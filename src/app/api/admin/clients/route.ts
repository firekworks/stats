import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireInternalRequest } from "@/lib/integrations/http";
import { getWonLeadById } from "@/lib/leads/source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientPayload = {
  origin?: "manual" | "lead";
  leadId?: string;
  publicName?: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  city?: string;
  address?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  website?: string;
  pack?: "390" | "590";
  planName?: string;
  monthlyFee?: number;
  adBudget?: number;
  driveFolderId?: string;
  canvaFolderUrl?: string;
  canvaAccountUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  googleBusinessProfileUrl?: string;
  whatsappUrl?: string;
  internalNotes?: string;
  status?: string;
  type?: "real" | "demo";
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as ClientPayload;
  const lead =
    body.origin === "lead" && clean(body.leadId)
      ? await getWonLeadById(clean(body.leadId) ?? "")
      : null;
  const publicName = clean(body.publicName) ?? lead?.name ?? null;

  if (!publicName) {
    return NextResponse.json({ error: "Nombre comercial requerido" }, { status: 400 });
  }

  if (body.origin === "lead" && body.leadId && !lead) {
    return NextResponse.json(
      { error: "Lead no encontrado o no marcado como ganado" },
      { status: 404 }
    );
  }

  if (lead?.id) {
    const { data: existing } = await auth.profile.admin
      .from("clients")
      .select("id, slug, name")
      .eq("lead_id", lead.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ client: existing, reused: true });
    }
  }

  const slug = slugify(publicName);
  const status = normalizeClientStatus(body.status);
  const pack = resolvePack(body.pack, body.monthlyFee);
  const driveValue = clean(body.driveFolderId);
  const payload = {
      name: publicName,
      slug,
      legal_name: clean(body.legalName) || publicName,
      tax_id: clean(body.taxId),
      sector: clean(body.industry) ?? lead?.sector ?? null,
      city: clean(body.city) ?? lead?.city ?? null,
      billing_address: clean(body.address),
      billing_email: clean(body.email),
      commercial_contact_email: clean(body.email),
      phone: clean(body.phone) ?? lead?.phone ?? null,
      commercial_contact_name: clean(body.contactName) ?? lead?.contactName ?? null,
      website: clean(body.website) ?? lead?.website ?? null,
      plan_name: clean(body.planName) || pack.planName,
      service_fee: number(body.monthlyFee) || pack.fee,
      monthly_budget: number(body.adBudget) || pack.ads,
      drive_folder_id: extractDriveFolderId(driveValue),
      drive_folder_url: driveValue?.startsWith("http") ? driveValue : null,
      canva_folder_url: clean(body.canvaFolderUrl),
      canva_account_url: clean(body.canvaAccountUrl),
      instagram_url: clean(body.instagramUrl) ?? lead?.instagramUrl ?? null,
      facebook_url: clean(body.facebookUrl) ?? lead?.facebookUrl ?? null,
      google_business_profile_url:
        clean(body.googleBusinessProfileUrl) ?? lead?.googleMapsUrl ?? null,
      whatsapp_url: clean(body.whatsappUrl) ?? lead?.whatsappUrl ?? null,
      internal_notes: mergeNotes(clean(body.internalNotes), lead?.notes),
      status,
      source: body.type === "demo" ? "demo" : lead ? "lead_conversion" : "stats",
      lead_id: lead?.id ?? null,
      converted_from_lead: Boolean(lead),
      conversion_date: lead ? new Date().toISOString().slice(0, 10) : null,
      original_lead_score: lead?.score ?? null,
      original_lead_city: lead?.city || null,
      original_lead_sector: lead?.sector || null,
      is_demo: body.type === "demo",
      client_portal_enabled: true,
      portal_status: body.type === "demo" ? "demo" : "active"
    };
  const { data, error } = await insertClient(auth.profile.admin, payload)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ client: data, reused: false });
}

function normalizeClientStatus(value?: string) {
  if (value === "paused") return "Pausado";
  if (value === "churned") return "Baja";
  if (value === "pending") return "Pendiente datos fiscales";
  return "Activo";
}

function clean(value?: string | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolvePack(pack?: string, monthlyFee?: number) {
  const fee = Number(monthlyFee ?? 0);
  const resolved = pack === "590" || fee >= 540 ? 590 : 390;

  return resolved === 590
    ? { fee: 590, ads: 150, planName: "Pack 590 - Crecimiento local" }
    : { fee: 390, ads: 90, planName: "Pack 390 - Base local" };
}

function insertClient(
  db: { from: (table: string) => { insert: (payload: Record<string, unknown>) => unknown } },
  payload: Record<string, unknown>
) {
  return db.from("clients").insert(payload) as {
    select: (columns: string) => { single: () => Promise<{ data: unknown; error: { message: string } | null }> };
  };
}

function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || randomUUID()
  );
}

function extractDriveFolderId(value: string | null) {
  if (!value) return null;
  const match = value.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? value;
}

function mergeNotes(manual: string | null, leadNotes?: string | null) {
  return [manual, leadNotes ? `Origen Leads:\n${leadNotes}` : ""]
    .filter(Boolean)
    .join("\n\n") || null;
}
