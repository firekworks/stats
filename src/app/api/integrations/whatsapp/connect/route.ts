import { NextResponse } from "next/server";
import { okJson, requireInternalRequest } from "@/lib/integrations/http";
import { registerWhatsappAsset } from "@/lib/integrations/whatsapp/whatsappService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConnectBody = {
  clientId?: string;
  businessAccountId?: string;
  phoneNumberId?: string;
  displayName?: string;
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as ConnectBody;

  if (!body.clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const result = await registerWhatsappAsset({
    db: auth.profile.admin,
    clientId: body.clientId,
    businessAccountId: body.businessAccountId ?? null,
    phoneNumberId: body.phoneNumberId ?? null,
    displayName: body.displayName ?? null
  });

  return okJson(result);
}
