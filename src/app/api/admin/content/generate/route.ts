import { NextResponse } from "next/server";
import { generateMonthlyCampaignPlan } from "@/lib/content-strategy";
import { requireInternalRequest } from "@/lib/integrations/http";
import type { Client, ContentIdea, ContentType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateBody = {
  clientId?: string;
  objective?: string;
  count?: number;
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as GenerateBody;

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const { data: row, error } = await auth.profile.admin
    .from("clients")
    .select(
      "id, slug, name, legal_name, sector, city, brand_colors, brand_voice, target_audience, objective, services, average_ticket, service_fee, monthly_budget, plan_name, status, show_in_leaderboard, public_leaderboard_name, onboarded_at, is_demo"
    )
    .eq("id", body.clientId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const client = mapIdeaClient(row);
  const plan = generateMonthlyCampaignPlan({
    client,
    objective: body.objective
  });
  const ideas = plan.pieces.slice(0, Math.min(Math.max(Number(body.count ?? plan.pieces.length), 1), 18));
  const monthStart = currentMonthStart();
  const monthEnd = currentMonthEnd();
  const { data: campaign, error: campaignError } = await auth.profile.admin
    .from("campaigns")
    .insert({
      client_id: client.id,
      name: `Campaña ${plan.monthLabel} - ${client.publicName}`,
      platform: "Meta Ads",
      objective: campaignObjective(plan.objective),
      status: "draft",
      start_date: monthStart,
      end_date: monthEnd,
      budget: parseAdBudget(plan.recommendedAdBudget),
      spend: 0,
      planned_budget: parseAdBudget(plan.recommendedAdBudget),
      recommended_ad_spend: parseAdBudget(plan.recommendedAdBudget),
      real_spend: 0,
      service_price: client.monthlyFee,
      internal_price: 0,
      client_visible_summary: "",
      internal_notes: [
        `Objetivo: ${plan.objective}`,
        `Oferta: ${plan.offer}`,
        `Público: ${plan.targetAudience}`,
        `Dolor: ${plan.mainPain}`,
        `Promesa: ${plan.promise}`,
        `Tono: ${plan.brandTone}`,
        `Estilo: ${plan.visualStyle}`
      ].join("\n"),
      is_demo: Boolean(row.is_demo),
      campaign_type: "Campaña mensual interna",
      offer: plan.offer,
      target_audience: plan.targetAudience,
      funnel_stage: "TOFU/MOFU/BOFU",
      funnel_stage_plan: {
        pack: plan.packName,
        objective: plan.objective,
        promise: plan.promise,
        gbpChecklist: plan.gbpChecklist,
        whatsappChecklist: plan.whatsappChecklist
      },
      recommendations: `${plan.packName}. ${plan.calendarSummary}`,
      launch_checklist: [
        "Revisar oferta",
        "Confirmar material",
        "Crear diseños",
        "Programar piezas",
        "Validar informe"
      ],
      metric_mode: "manual",
      source: "stats_internal_generator",
      sync_status: "manual",
      lifecycle_status: "planned"
    })
    .select("id, name")
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json(
      { error: campaignError?.message ?? "No se pudo crear la campaña" },
      { status: 400 }
    );
  }

  const existingCodes = await loadExistingCodeCounts(auth.profile.admin, client.id);
  const pieces = ideas.map((idea, index) => withPersistedCode(idea, existingCodes, index));
  const { data: contentRows, error: contentError } = await auth.profile.admin
    .from("content_items")
    .insert(
      pieces.map((idea) => ({
        client_id: client.id,
        campaign_id: campaign.id,
        content_code: idea.code,
        type: idea.format,
        platform: platformForFormat(idea.format),
        title: idea.title,
        objective: idea.objective,
        funnel_stage: idea.funnelStage,
        hook: idea.hook,
        caption: idea.caption,
        visual_brief: idea.visualBrief,
        cta: idea.cta,
        due_date: idea.suggestedDate,
        publish_date: idea.suggestedDate,
        published_at: null,
        status: "idea",
        url: "#",
        storage_path: null,
        client_visible: false,
        internal_notes: buildInternalScript(idea),
        notes: buildInternalScript(idea),
        preview_data: {
          internalStage: idea.funnelStage,
          aida: idea.aida,
          screenText: idea.screenText,
          voiceover: idea.voiceover,
          shots: [idea.shot1, idea.shot2, idea.shot3],
          broll: idea.broll,
          resources: idea.resources,
          adsSuggestion: idea.adsSuggestion
        },
        is_demo: Boolean(row.is_demo),
        is_promoted: idea.promoted,
        promotion_budget: idea.promoted ? suggestedPieceBudget(plan.packPrice) : 0,
        source: "stats_internal_generator",
        sync_status: "manual",
        lifecycle_status: "planned"
      }))
    )
    .select("id, content_code, publish_date");

  if (contentError) {
    return NextResponse.json({ error: contentError.message }, { status: 400 });
  }

  const eventRows = (contentRows ?? []).map((item, index) => ({
    client_id: client.id,
    campaign_id: campaign.id,
    content_item_id: item.id,
    title: `${eventTypeForPiece(pieces[index]?.format)} ${item.content_code}`,
    type: eventTypeForPiece(pieces[index]?.format),
    status: "pending",
    start_at: `${item.publish_date ?? pieces[index]?.suggestedDate}T10:00:00.000Z`,
    end_at: `${item.publish_date ?? pieces[index]?.suggestedDate}T10:30:00.000Z`,
    location: platformForFormat(pieces[index]?.format ?? "Post"),
    notes: "Evento interno creado por Generar campaña interna. No sincronizado con Google.",
    is_demo: Boolean(row.is_demo),
    sync_google_requested: false,
    created_by: auth.profile.userId
  }));

  if (eventRows.length) {
    const { error: eventsError } = await auth.profile.admin
      .from("calendar_events")
      .insert(eventRows);

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    provider: process.env.AI_PROVIDER ?? "template",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
    campaign,
    plan,
    ideas: pieces,
    created: {
      campaign: 1,
      content: contentRows?.length ?? 0,
      events: eventRows.length
    }
  });
}

function mapIdeaClient(row: Record<string, unknown>): Client {
  const name = String(row.name ?? "Cliente");

  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    publicName: name,
    legalName: String(row.legal_name ?? row.name ?? name),
    industry: String(row.sector ?? ""),
    status: row.status === "Pausado" ? "paused" : row.status === "Baja" ? "churned" : "active",
    city: String(row.city ?? ""),
    brandColors: Array.isArray(row.brand_colors)
      ? row.brand_colors.map(String)
      : [],
    brandVoice: typeof row.brand_voice === "string" ? row.brand_voice : null,
    targetAudience:
      typeof row.target_audience === "string" ? row.target_audience : null,
    objective: typeof row.objective === "string" ? row.objective : null,
    services: Array.isArray(row.services) ? row.services.map(String) : [],
    averageTicket: Number(row.average_ticket ?? 0),
    allowPublicLeaderboardName: Boolean(row.show_in_leaderboard),
    planName: String(row.plan_name ?? "Pack Firekworks"),
    planStatus: row.status === "Pausado" ? "Pausado" : row.status === "Baja" ? "Baja" : "Activo",
    monthlyFee: Number(row.service_fee ?? 0),
    adBudget: Number(row.monthly_budget ?? 0),
    onboardedAt: String(row.onboarded_at ?? new Date().toISOString()),
    publicLeaderboardName: String(row.public_leaderboard_name ?? name)
  };
}

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10);
}

function currentMonthEnd() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0)).toISOString().slice(0, 10);
}

function campaignObjective(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("reserva") || normalized.includes("cita")) return "Reservas";
  if (normalized.includes("llamada")) return "Llamadas";
  if (normalized.includes("mensaje") || normalized.includes("whatsapp")) return "Mensajes";
  return "Leads";
}

function parseAdBudget(value: string) {
  const matches = value.match(/\d+/g)?.map(Number) ?? [0];
  return Math.max(...matches);
}

function suggestedPieceBudget(packPrice: 390 | 590) {
  return packPrice === 390 ? 25 : 35;
}

async function loadExistingCodeCounts(
  db: { from: (table: string) => unknown },
  clientId: string
) {
  const query = db.from("content_items") as {
    select: (columns: string) => {
      eq: (column: string, value: string) => Promise<{ data?: Array<{ content_code?: string | null }> }>;
    };
  };
  const { data } = await query.select("content_code").eq("client_id", clientId);
  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const [prefix, value] = String(row.content_code ?? "").split("-");
    const index = Number(value ?? 0);
    if (!prefix || !Number.isFinite(index)) continue;
    counts.set(prefix, Math.max(counts.get(prefix) ?? 0, index));
  }

  return counts;
}

function withPersistedCode(
  idea: ContentIdea,
  counts: Map<string, number>,
  index: number
): ContentIdea {
  const prefix = contentPrefix(idea.format);
  const next = (counts.get(prefix) ?? 0) + 1;
  counts.set(prefix, next);

  return {
    ...idea,
    code: `${prefix}-${String(next || index + 1).padStart(3, "0")}`
  };
}

function contentPrefix(format: ContentType) {
  if (format === "Reel") return "REEL";
  if (format === "Carrusel") return "CAR";
  if (format === "Story") return "STORY";
  if (format === "GBP") return "GBP";
  if (format === "WhatsApp") return "WA";
  return "POST";
}

function platformForFormat(format: ContentType) {
  if (format === "GBP") return "Google Business";
  if (format === "WhatsApp") return "WhatsApp";
  return "Instagram";
}

function eventTypeForPiece(format?: ContentType) {
  if (format === "Reel" || format === "Story") return "Publicación";
  if (format === "GBP") return "GBP";
  if (format === "WhatsApp") return "WhatsApp";
  return "Revisión";
}

function buildInternalScript(idea: ContentIdea) {
  return [
    `Fase interna: ${idea.funnelStage}`,
    `Dolor: ${idea.pain}`,
    `Idea central: ${idea.centralIdea}`,
    `Gancho: ${idea.hook}`,
    `AIDA - Atención: ${idea.aida.attention}`,
    `AIDA - Interés: ${idea.aida.interest}`,
    `AIDA - Deseo: ${idea.aida.desire}`,
    `AIDA - Acción: ${idea.aida.action}`,
    `Texto pantalla: ${idea.screenText}`,
    `Voz/frase: ${idea.voiceover}`,
    idea.shot1,
    idea.shot2,
    idea.shot3,
    `B-roll: ${idea.broll}`,
    `CTA: ${idea.cta}`,
    `Recursos: ${idea.resources}`,
    idea.adsSuggestion ? `Ads: ${idea.adsSuggestion}` : "Ads: no promocionar de inicio"
  ].join("\n");
}
