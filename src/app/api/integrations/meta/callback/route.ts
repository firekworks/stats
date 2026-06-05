import { NextResponse } from "next/server";
import { requireInternalRequest, missingEnvResponse } from "@/lib/integrations/http";
import {
  exchangeForLongLivedMetaToken,
  exchangeMetaCodeForToken,
  getMetaMissingEnv
} from "@/lib/integrations/meta/metaOAuth";
import { META_PROVIDER, META_READ_SCOPES } from "@/lib/integrations/meta/metaTypes";
import { syncMetaAssetsForIntegration } from "@/lib/integrations/meta/metaService";
import type { DbRow } from "@/lib/integrations/store";
import { encryptToken } from "@/lib/security/tokenCrypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const missing = getMetaMissingEnv(true);
  if (missing.length) return missingEnvResponse(missing);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const metaError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (metaError) {
    return redirectWithStatus(request, `meta_error=${encodeURIComponent(metaError)}`);
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Callback Meta incompleto" }, { status: 400 });
  }

  const { data: oauthState, error: stateError } = await auth.profile.admin
    .from("oauth_states")
    .select("*")
    .eq("provider", META_PROVIDER)
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
    const shortToken = await exchangeMetaCodeForToken({ code, request });
    const longToken = await exchangeForLongLivedMetaToken(shortToken.access_token);
    const tokenExpiresAt = longToken.expires_in
      ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
      : null;

    const { data: integration, error: integrationError } = await auth.profile.admin
      .from("integrations")
      .upsert(
        {
          client_id: oauthState.client_id,
          provider: META_PROVIDER,
          status: "connected",
          scopes: Array.from(META_READ_SCOPES),
          access_token_encrypted: encryptToken(longToken.access_token),
          refresh_token_encrypted: null,
          token_expires_at: tokenExpiresAt,
          token_last_rotated_at: new Date().toISOString(),
          connected_at: new Date().toISOString(),
          revoked_at: null,
          error_message: null,
          metadata: {
            token_type: longToken.token_type ?? shortToken.token_type ?? null,
            oauth_scopes: Array.from(META_READ_SCOPES)
          },
          updated_at: new Date().toISOString()
        },
        { onConflict: "client_id,provider" }
      )
      .select("*")
      .single<DbRow>();

    if (integrationError) {
      throw integrationError;
    }

    await auth.profile.admin
      .from("oauth_states")
      .update({ status: "used", used_at: new Date().toISOString() })
      .eq("id", oauthState.id);

    await syncMetaAssetsForIntegration({
      db: auth.profile.admin,
      integration
    });

    return redirectWithStatus(
      request,
      `meta_connected=1&clientId=${encodeURIComponent(String(oauthState.client_id))}`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error conectando Meta";
    await auth.profile.admin
      .from("oauth_states")
      .update({ status: "error", used_at: new Date().toISOString(), metadata: { error: message } })
      .eq("id", oauthState.id);

    return redirectWithStatus(request, `meta_error=${encodeURIComponent(message)}`);
  }
}

function redirectWithStatus(request: Request, query: string) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/admin/integrations?${query}`);
}
