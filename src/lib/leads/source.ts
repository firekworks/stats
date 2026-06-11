import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readServerEnv } from "@/lib/server/env";
import { getSupabaseServiceEnv } from "@/lib/server/env";

const wonStatuses = ["Ganado", "Cliente", "Cierre ganado", "Cerrado ganado"];

export type LeadCandidate = {
  id: string;
  name: string;
  sector: string;
  city: string;
  phone: string;
  website: string;
  instagramUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
  googleMapsUrl: string;
  contactName: string;
  score: number;
  status: string;
  notes: string;
};

let leadsClient: SupabaseClient | null = null;

export function getLeadsSourceStatus() {
  const { url, serviceRoleKey } = getLeadsEnv();
  const missing: string[] = [];

  if (!url) missing.push("LEADS_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) {
    missing.push("LEADS_SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    configured: missing.length === 0,
    missing
  };
}

export async function searchWonLeads(query: string) {
  const db = getLeadsClient();

  if (!db) {
    return { leads: [] as LeadCandidate[], missing: getLeadsSourceStatus().missing };
  }

  const normalized = query.trim();
  let request = db
    .from("leads")
    .select(leadSelectColumns)
    .in("status", wonStatuses)
    .eq("is_invalid", false)
    .eq("is_disqualified", false)
    .order("updated_at", { ascending: false })
    .limit(12);

  if (normalized) {
    const safe = normalized.replace(/[%(),]/g, " ");
    request = request.or(
      `name.ilike.%${safe}%,city.ilike.%${safe}%,sector.ilike.%${safe}%`
    );
  }

  const { data, error } = await request;

  if (error) {
    return { leads: [] as LeadCandidate[], error: error.message };
  }

  return {
    leads: ((data ?? []) as unknown as Record<string, unknown>[]).map(mapLeadCandidate)
  };
}

export async function getWonLeadById(leadId: string) {
  const db = getLeadsClient();

  if (!db) return null;

  const { data } = await db
    .from("leads")
    .select(leadSelectColumns)
    .eq("id", leadId)
    .in("status", wonStatuses)
    .maybeSingle();

  return data ? mapLeadCandidate(data as unknown as Record<string, unknown>) : null;
}

const leadSelectColumns = [
  "id",
  "name",
  "sector",
  "city",
  "phone",
  "website",
  "instagram_url",
  "facebook_url",
  "whatsapp_url",
  "google_maps_url",
  "owner_name",
  "score",
  "score_total",
  "status",
  "notes",
  "pain",
  "diagnosis",
  "recommended_service",
  "recommended_offer",
  "next_action"
].join(", ");

function getLeadsClient() {
  if (typeof window !== "undefined") {
    throw new Error("Leads client cannot be used in the browser");
  }

  const { url, serviceRoleKey } = getLeadsEnv();

  if (!url || !serviceRoleKey) return null;

  if (!leadsClient) {
    leadsClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return leadsClient;
}

function getLeadsEnv() {
  const stats = getSupabaseServiceEnv();

  return {
    url: readServerEnv("LEADS_SUPABASE_URL") ?? stats.url,
    serviceRoleKey:
      readServerEnv("LEADS_SUPABASE_SERVICE_ROLE_KEY") ?? stats.serviceRoleKey
  };
}

function mapLeadCandidate(row: Record<string, unknown>): LeadCandidate {
  const notes = [
    string(row.notes),
    string(row.pain) ? `Dolor: ${string(row.pain)}` : "",
    string(row.diagnosis) ? `Diagnóstico: ${string(row.diagnosis)}` : "",
    string(row.recommended_service)
      ? `Servicio recomendado: ${string(row.recommended_service)}`
      : "",
    string(row.recommended_offer)
      ? `Oferta recomendada: ${string(row.recommended_offer)}`
      : "",
    string(row.next_action) ? `Siguiente acción: ${string(row.next_action)}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: string(row.id),
    name: string(row.name),
    sector: string(row.sector),
    city: string(row.city),
    phone: string(row.phone),
    website: string(row.website),
    instagramUrl: string(row.instagram_url),
    facebookUrl: string(row.facebook_url),
    whatsappUrl: string(row.whatsapp_url),
    googleMapsUrl: string(row.google_maps_url),
    contactName: string(row.owner_name),
    score: number(row.score_total) || number(row.score),
    status: string(row.status),
    notes
  };
}

function string(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
