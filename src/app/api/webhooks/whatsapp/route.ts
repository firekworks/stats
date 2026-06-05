import { NextResponse } from "next/server";
import { storeWebhookEvent } from "@/lib/integrations/webhooks";
import { readServerEnv } from "@/lib/server/env";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const provider = "whatsapp";

export function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = readServerEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN");

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return NextResponse.json(
    { error: "Webhook WhatsApp no verificado" },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  const db = getSupabaseServiceClient();

  if (!db) {
    return NextResponse.json(
      { error: "Supabase service role no configurado" },
      { status: 503 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await storeWebhookEvent({
    db,
    provider,
    eventType: "whatsapp",
    externalId: externalWebhookId(payload),
    payload,
    signature: request.headers.get("x-hub-signature-256")
  });

  return NextResponse.json({ ok: true, result });
}

function externalWebhookId(payload: Record<string, unknown>) {
  const entry = Array.isArray(payload.entry)
    ? (payload.entry[0] as Record<string, unknown> | undefined)
    : undefined;
  const id = typeof entry?.id === "string" ? entry.id : null;
  const changes = Array.isArray(entry?.changes)
    ? (entry?.changes[0] as Record<string, unknown> | undefined)
    : undefined;
  const value = changes?.value as Record<string, unknown> | undefined;
  const messages = Array.isArray(value?.messages)
    ? (value?.messages[0] as Record<string, unknown> | undefined)
    : undefined;
  const messageId = typeof messages?.id === "string" ? messages.id : null;

  return messageId ?? (id ? `whatsapp:${id}:${Date.now()}` : null);
}
