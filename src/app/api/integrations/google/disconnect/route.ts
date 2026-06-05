import { NextResponse } from "next/server";
import { GOOGLE_BUSINESS_PROVIDER } from "@/lib/integrations/google/googleService";
import { okJson, requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { clientId?: string };

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await auth.profile.admin
    .from("integrations")
    .update({
      status: "revoked",
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      token_expires_at: null,
      revoked_at: now,
      updated_at: now
    })
    .eq("client_id", body.clientId)
    .eq("provider", GOOGLE_BUSINESS_PROVIDER);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return okJson({ ok: true });
}
