import "server-only";

import { createHmac } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readServerEnv } from "@/lib/server/env";

export function verifyMetaSignature(rawBody: string, signature: string | null) {
  const secret = readServerEnv("META_APP_SECRET");

  if (!secret || !signature) {
    return true;
  }

  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return expected === signature;
}

export async function storeWebhookEvent({
  db,
  provider,
  eventType,
  externalId,
  payload,
  signature
}: {
  db: SupabaseClient;
  provider: string;
  eventType?: string | null;
  externalId?: string | null;
  payload: Record<string, unknown>;
  signature?: string | null;
}) {
  const { data, error } = await db
    .from("webhook_events")
    .insert({
      provider,
      event_type: eventType ?? null,
      external_id: externalId ?? null,
      payload,
      signature: signature ?? null,
      processing_status: "pending"
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (error.code === "23505") {
      return { id: null, duplicate: true };
    }

    throw error;
  }

  return { id: data.id, duplicate: false };
}
