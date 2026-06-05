import { NextResponse } from "next/server";
import { okJson, requireInternalRequest } from "@/lib/integrations/http";
import { WHATSAPP_PROVIDER } from "@/lib/integrations/whatsapp/whatsappService";

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
      revoked_at: now,
      updated_at: now
    })
    .eq("client_id", body.clientId)
    .eq("provider", WHATSAPP_PROVIDER);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await auth.profile.admin
    .from("connected_assets")
    .update({ status: "disconnected", is_selected: false, updated_at: now })
    .eq("client_id", body.clientId)
    .eq("provider", WHATSAPP_PROVIDER);

  return okJson({ ok: true });
}
