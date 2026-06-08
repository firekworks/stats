import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientPayload = {
  publicName?: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  city?: string;
  address?: string;
  email?: string;
  phone?: string;
  contactName?: string;
  planName?: string;
  monthlyFee?: number;
  adBudget?: number;
  driveFolderId?: string;
  status?: string;
  type?: "real" | "demo";
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as ClientPayload;
  const publicName = clean(body.publicName);

  if (!publicName) {
    return NextResponse.json({ error: "Nombre comercial requerido" }, { status: 400 });
  }

  const slug = slugify(publicName);
  const status = normalizeClientStatus(body.status);
  const { data, error } = await auth.profile.admin
    .from("clients")
    .insert({
      name: publicName,
      slug,
      legal_name: clean(body.legalName) || publicName,
      tax_id: clean(body.taxId),
      sector: clean(body.industry),
      city: clean(body.city),
      billing_address: clean(body.address),
      billing_email: clean(body.email),
      phone: clean(body.phone),
      commercial_contact_name: clean(body.contactName),
      plan_name: clean(body.planName),
      service_fee: number(body.monthlyFee),
      monthly_budget: number(body.adBudget),
      drive_folder_id: extractDriveFolderId(clean(body.driveFolderId)),
      status,
      source: body.type === "demo" ? "demo" : "stats",
      is_demo: body.type === "demo",
      client_portal_enabled: true,
      portal_status: body.type === "demo" ? "demo" : "active"
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ client: data });
}

function normalizeClientStatus(value?: string) {
  if (value === "paused") return "Pausado";
  if (value === "churned") return "Baja";
  if (value === "pending") return "Pendiente";
  return "Activo";
}

function clean(value?: string | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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
