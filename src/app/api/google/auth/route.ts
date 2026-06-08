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

  const url = new URL(request.url);
  let clientId = url.searchParams.get("clientId");

  if (!clientId) {
    const { data: client } = await auth.profile.admin
      .from("clients")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ id: string }>();
    clientId = client?.id ?? null;
  }

  if (!clientId) {
    return NextResponse.json({ error: "No hay cliente para vincular Google" }, { status: 400 });
  }

  const state = randomBytes(32).toString("base64url");
  const scopes = [
    "https://www.googleapis.com/auth/business.manage",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/drive.readonly"
  ];
  const { error } = await auth.profile.admin.from("oauth_states").insert({
    provider: GOOGLE_BUSINESS_PROVIDER,
    client_id: clientId,
    state,
    scopes,
    created_by: auth.profile.userId,
    redirect_path: "/admin/integrations",
    metadata: { purpose: "google_workspace_oauth" }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(buildGoogleAuthorizationUrl(state));
}
