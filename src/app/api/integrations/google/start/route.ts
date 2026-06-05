import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  buildGoogleAuthorizationUrl,
  getGoogleMissingEnv,
  GOOGLE_BUSINESS_PROVIDER
} from "@/lib/integrations/google/googleService";
import { missingEnvResponse, requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const missing = getGoogleMissingEnv();
  if (missing.length) return missingEnvResponse(missing);

  const clientId = new URL(request.url).searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const state = randomBytes(32).toString("base64url");
  const { error } = await auth.profile.admin.from("oauth_states").insert({
    provider: GOOGLE_BUSINESS_PROVIDER,
    client_id: clientId,
    state,
    scopes: ["https://www.googleapis.com/auth/business.manage"],
    created_by: auth.profile.userId,
    redirect_path: "/admin/integrations",
    metadata: { purpose: "google_business_oauth_placeholder" }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(buildGoogleAuthorizationUrl(state));
}
