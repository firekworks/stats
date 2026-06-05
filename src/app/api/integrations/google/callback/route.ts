import { NextResponse } from "next/server";
import {
  exchangeGoogleCodeForToken,
  getGoogleMissingEnv,
  GOOGLE_BUSINESS_PROVIDER
} from "@/lib/integrations/google/googleService";
import { missingEnvResponse, requireInternalRequest } from "@/lib/integrations/http";
import type { DbRow } from "@/lib/integrations/store";
import { encryptToken } from "@/lib/security/tokenCrypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const missing = getGoogleMissingEnv();
  if (missing.length) return missingEnvResponse(missing);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const googleError = url.searchParams.get("error");

  if (googleError) {
    return redirectWithStatus(request, `google_error=${encodeURIComponent(googleError)}`);
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Callback Google incompleto" }, { status: 400 });
  }

  const { data: oauthState, error: stateError } = await auth.profile.admin
    .from("oauth_states")
    .select("*")
    .eq("provider", GOOGLE_BUSINESS_PROVIDER)
    .eq("state", state)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle<DbRow>();

  if (stateError) {
    return NextResponse.json({ error: stateError.message }, { status: 500 });
  }

  if (!oauthState?.client_id) {
    return NextResponse.json({ error: "Estado OAuth invalido o expirado" }, { status: 400 });
  }

  try {
    const token = await exchangeGoogleCodeForToken(code);
    const tokenExpiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null;

    const { error: integrationError } = await auth.profile.admin
      .from("integrations")
      .upsert(
        {
          client_id: oauthState.client_id,
          provider: GOOGLE_BUSINESS_PROVIDER,
          status: "connected",
          scopes: token.scope ? token.scope.split(" ") : [],
          access_token_encrypted: encryptToken(token.access_token),
          refresh_token_encrypted: encryptToken(token.refresh_token),
          token_expires_at: tokenExpiresAt,
          token_last_rotated_at: new Date().toISOString(),
          connected_at: new Date().toISOString(),
          error_message: null,
          metadata: {
            token_type: token.token_type ?? null,
            placeholder: true
          },
          updated_at: new Date().toISOString()
        },
        { onConflict: "client_id,provider" }
      );

    if (integrationError) throw integrationError;

    await auth.profile.admin
      .from("oauth_states")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", oauthState.id);

    return redirectWithStatus(
      request,
      `google_connected=1&clientId=${encodeURIComponent(String(oauthState.client_id))}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error conectando Google";
    return redirectWithStatus(request, `google_error=${encodeURIComponent(message)}`);
  }
}

function redirectWithStatus(request: Request, query: string) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/admin/integrations?${query}`);
}
