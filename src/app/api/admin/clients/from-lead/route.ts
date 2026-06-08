import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FromLeadBody = {
  leadId?: string;
  name?: string;
  city?: string;
  sector?: string;
  score?: number;
  source?: string;
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as FromLeadBody;

  if (!body.name && !body.leadId) {
    return NextResponse.json({ error: "leadId o name requerido" }, { status: 400 });
  }

  const lead = body.leadId
    ? await findLead(auth.profile.admin, body.leadId)
    : null;
  const verifiedLeadId = lead?.id ? String(lead.id) : null;
  const name = String(body.name ?? lead?.name ?? "Cliente desde Leads");
  const city = String(body.city ?? lead?.city ?? "");
  const sector = String(body.sector ?? lead?.sector ?? "");

  const existing = await findExistingClient({
    db: auth.profile.admin,
    leadId: verifiedLeadId,
    name,
    city
  });

  if (existing) {
    return NextResponse.json({ ok: true, client: existing, reused: true });
  }

  const { data, error } = await auth.profile.admin
    .from("clients")
    .insert({
      name,
      legal_name: name,
      slug: makeSlug(`${name}-${city}`),
      sector,
      city,
      status: "Pendiente datos fiscales",
      source: body.source ?? "lead_conversion",
      lead_id: verifiedLeadId,
      converted_from_lead: Boolean(verifiedLeadId || body.leadId),
      conversion_date: new Date().toISOString().slice(0, 10),
      original_lead_score: Number(body.score ?? lead?.score ?? 0) || null,
      original_lead_city: city || null,
      original_lead_sector: sector || null,
      client_portal_enabled: false,
      portal_status: "pending"
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, client: data, reused: false });
}

async function findLead(db: ReturnType<typeof import("@/lib/supabase/server").getSupabaseAdminClient>, leadId: string) {
  if (!db) return null;

  const { data } = await db
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  return data as Record<string, unknown> | null;
}

async function findExistingClient({
  db,
  leadId,
  name,
  city
}: {
  db: NonNullable<ReturnType<typeof import("@/lib/supabase/server").getSupabaseAdminClient>>;
  leadId: string | null;
  name: string;
  city: string;
}) {
  if (leadId) {
    const { data } = await db
      .from("clients")
      .select("*")
      .eq("lead_id", leadId)
      .maybeSingle();

    if (data) return data;
  }

  const { data } = await db
    .from("clients")
    .select("*")
    .eq("name", name)
    .eq("city", city)
    .maybeSingle();

  return data;
}

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
