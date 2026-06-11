import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const pack = resolvePack(string(body.pack), numberOrNull(body.monthlyFee));
  const driveValue = string(body.driveFolderId);
  const patch = {
    name: string(body.publicName),
    slug: string(body.slug),
    legal_name: string(body.legalName),
    tax_id: string(body.taxId),
    sector: string(body.industry),
    city: string(body.city),
    billing_address: string(body.address),
    billing_email: string(body.email),
    commercial_contact_email: string(body.email),
    phone: string(body.phone),
    commercial_contact_name: string(body.contactName),
    plan_name: string(body.planName) ?? pack.planName,
    service_fee: numberOrNull(body.monthlyFee) ?? pack.fee,
    monthly_budget: numberOrNull(body.adBudget) ?? pack.ads,
    drive_folder_id: extractDriveFolderId(driveValue),
    drive_folder_url: driveValue?.startsWith("http") ? driveValue : null,
    instagram_url: string(body.instagramUrl),
    facebook_url: string(body.facebookUrl),
    google_business_profile_url: string(body.googleBusinessProfileUrl),
    portal_status: string(body.portalStatus),
    internal_notes: string(body.internalNotes),
    status: normalizeClientStatus(string(body.status)),
    updated_at: new Date().toISOString()
  };
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== null && value !== undefined)
  );
  const { data, error } = await auth.profile.admin
    .from("clients")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ client: data });
}

function string(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberOrNull(value: unknown) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeClientStatus(value: string | null) {
  if (!value) return null;
  if (value === "active" || value === "Activo") return "Activo";
  if (value === "paused" || value === "Pausado") return "Pausado";
  if (value === "churned" || value === "Baja") return "Baja";
  return value;
}

function resolvePack(pack: string | null, monthlyFee: number | null) {
  const resolved = pack === "590" || Number(monthlyFee ?? 0) >= 540 ? 590 : 390;

  return resolved === 590
    ? { fee: 590, ads: 150, planName: "Pack 590 - Crecimiento local" }
    : { fee: 390, ads: 90, planName: "Pack 390 - Base local" };
}

function extractDriveFolderId(value: string | null) {
  if (!value) return null;
  const match = value.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? value;
}
