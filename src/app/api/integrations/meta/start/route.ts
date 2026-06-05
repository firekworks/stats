import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireInternalRequest, missingEnvResponse } from "@/lib/integrations/http";
import {
  buildMetaAuthorizationUrl,
  getMetaMissingEnv
} from "@/lib/integrations/meta/metaOAuth";
import { META_PROVIDER, META_READ_SCOPES } from "@/lib/integrations/meta/metaTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const missing = getMetaMissingEnv(false);
  if (missing.length) return missingEnvResponse(missing);

  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const { data: client, error: clientError } = await auth.profile.admin
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle<{ id: string }>();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const state = randomBytes(32).toString("base64url");
  const { error } = await auth.profile.admin.from("oauth_states").insert({
    provider: META_PROVIDER,
    client_id: clientId,
    state,
    scopes: Array.from(META_READ_SCOPES),
    created_by: auth.profile.userId,
    redirect_path: "/admin/integrations",
    metadata: {
      purpose: "meta_oauth"
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(buildMetaAuthorizationUrl({ state, request }));
}
