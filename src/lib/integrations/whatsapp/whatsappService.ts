import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const WHATSAPP_PROVIDER = "whatsapp";

export async function registerWhatsappAsset({
  db,
  clientId,
  businessAccountId,
  phoneNumberId,
  displayName
}: {
  db: SupabaseClient;
  clientId: string;
  businessAccountId?: string | null;
  phoneNumberId?: string | null;
  displayName?: string | null;
}) {
  const now = new Date().toISOString();
  const { data: integration, error: integrationError } = await db
    .from("integrations")
    .upsert(
      {
        client_id: clientId,
        provider: WHATSAPP_PROVIDER,
        status: phoneNumberId ? "connected" : "pending",
        external_account_id: businessAccountId ?? phoneNumberId ?? null,
        external_account_name: displayName ?? "WhatsApp Business",
        connected_at: phoneNumberId ? now : null,
        metadata: {
          placeholder: true,
          business_account_id: businessAccountId ?? null,
          phone_number_id: phoneNumberId ?? null
        },
        updated_at: now
      },
      { onConflict: "client_id,provider" }
    )
    .select("id")
    .single<{ id: string }>();

  if (integrationError) {
    throw integrationError;
  }

  if (phoneNumberId) {
    const { error: assetError } = await db.from("connected_assets").upsert(
      {
        client_id: clientId,
        integration_id: integration.id,
        provider: WHATSAPP_PROVIDER,
        asset_type: "whatsapp_phone_number",
        external_id: phoneNumberId,
        name: displayName ?? "WhatsApp Business",
        parent_external_id: businessAccountId ?? null,
        status: "active",
        is_selected: true,
        metadata: {
          business_account_id: businessAccountId ?? null
        },
        last_synced_at: now,
        updated_at: now
      },
      { onConflict: "provider,asset_type,external_id" }
    );

    if (assetError) {
      throw assetError;
    }
  }

  return { ok: true, integrationId: integration.id };
}
