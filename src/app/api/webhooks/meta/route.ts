import { NextResponse } from "next/server";
import { META_PROVIDER } from "@/lib/integrations/meta/metaTypes";
import { storeWebhookEvent, verifyMetaSignature } from "@/lib/integrations/webhooks";
import { readServerEnv } from "@/lib/server/env";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = readServerEnv("META_WEBHOOK_VERIFY_TOKEN");

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return NextResponse.json({ error: "Webhook Meta no verificado" }, { status: 403 });
}

export async function POST(request: Request) {
  const db = getSupabaseServiceClient();

  if (!db) {
    return NextResponse.json(
      { error: "Supabase service role no configurado" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Firma Meta invalida" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody || "{}") as Record<string, unknown>;
  const result = await storeWebhookEvent({
    db,
    provider: META_PROVIDER,
    eventType: typeof payload.object === "string" ? payload.object : "meta",
    externalId: externalWebhookId(payload),
    payload,
    signature
  });

  return NextResponse.json({ ok: true, result });
}

function externalWebhookId(payload: Record<string, unknown>) {
  const entry = Array.isArray(payload.entry)
    ? (payload.entry[0] as Record<string, unknown> | undefined)
    : undefined;
  const id = typeof entry?.id === "string" ? entry.id : null;
  const time = typeof entry?.time === "number" ? entry.time : Date.now();

  return id ? `meta:${id}:${time}` : null;
}
