import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type LeadEventInput = {
  clientId: string;
  provider: "meta" | "whatsapp" | "google_business" | string;
  channel: string;
  externalEventId?: string | null;
  externalLeadId?: string | null;
  connectedAssetId?: string | null;
  campaignId?: string | null;
  contentItemId?: string | null;
  leadId?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  message?: string | null;
  occurredAt?: string | null;
  payload?: Record<string, unknown>;
};

export async function ingestLeadEvent(
  db: SupabaseClient,
  input: LeadEventInput
) {
  const payload = {
    client_id: input.clientId,
    provider: input.provider,
    channel: input.channel,
    external_event_id: input.externalEventId ?? null,
    external_lead_id: input.externalLeadId ?? null,
    connected_asset_id: input.connectedAssetId ?? null,
    campaign_id: input.campaignId ?? null,
    content_item_id: input.contentItemId ?? null,
    lead_id: input.leadId ?? null,
    contact_name: input.contactName ?? null,
    contact_phone: input.contactPhone ?? null,
    contact_email: input.contactEmail ?? null,
    message: input.message ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    payload: input.payload ?? {}
  };

  if (input.externalEventId) {
    const { data: existing, error: existingError } = await db
      .from("lead_events")
      .select("id")
      .eq("provider", input.provider)
      .eq("external_event_id", input.externalEventId)
      .maybeSingle<{ id: string }>();

    if (existingError) {
      throw existingError;
    }

    if (existing?.id) {
      return { id: existing.id, created: false };
    }
  }

  const { data, error } = await db
    .from("lead_events")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw error;
  }

  return { id: data.id, created: true };
}
