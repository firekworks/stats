import { NextResponse } from "next/server";
import { generateContentIdeas } from "@/lib/content-strategy";
import { requireInternalRequest } from "@/lib/integrations/http";
import type { Client } from "@/lib/types";

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
      "id, slug, name, legal_name, sector, city, brand_colors, brand_voice, target_audience, objective, services, average_ticket, service_fee, status, show_in_leaderboard, public_leaderboard_name, onboarded_at"
    )
    .eq("id", body.clientId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const client = mapIdeaClient(row);
  const ideas = generateContentIdeas({
    client,
    objective: body.objective,
    count: Math.min(Math.max(Number(body.count ?? 8), 1), 12)
  });

  return NextResponse.json({
    provider: process.env.AI_PROVIDER ?? "template",
    aiConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
    ideas
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
    planName: "Plan activo",
    planStatus: row.status === "Pausado" ? "Pausado" : row.status === "Baja" ? "Baja" : "Activo",
    monthlyFee: Number(row.service_fee ?? 0),
    onboardedAt: String(row.onboarded_at ?? new Date().toISOString()),
    publicLeaderboardName: String(row.public_leaderboard_name ?? name)
  };
}
