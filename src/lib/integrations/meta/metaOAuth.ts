import "server-only";

import { getMissingServerEnv, getPublicAppUrl, readServerEnv } from "@/lib/server/env";
import { META_READ_SCOPES, type MetaTokenResponse } from "@/lib/integrations/meta/metaTypes";

export function getMetaMissingEnv(includeSecret = true) {
  return getMissingServerEnv(
    includeSecret
      ? ["META_APP_ID", "META_APP_SECRET", "META_GRAPH_VERSION", "NEXT_PUBLIC_APP_URL"]
      : ["META_APP_ID", "META_GRAPH_VERSION", "NEXT_PUBLIC_APP_URL"]
  );
}

export function getMetaRedirectUri(request?: Request) {
  return `${getPublicAppUrl(request)}/api/integrations/meta/callback`;
}

export function getMetaGraphBase() {
  const version = readServerEnv("META_GRAPH_VERSION");

  if (!version) {
    throw new Error("META_GRAPH_VERSION is required");
  }

  return `https://graph.facebook.com/${version}`;
}

export function buildMetaAuthorizationUrl({
  state,
  request
}: {
  state: string;
  request?: Request;
}) {
  const appId = readServerEnv("META_APP_ID");
  const version = readServerEnv("META_GRAPH_VERSION");

  if (!appId || !version) {
    throw new Error("META_APP_ID and META_GRAPH_VERSION are required");
  }

  const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", getMetaRedirectUri(request));
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", META_READ_SCOPES.join(","));

  return url;
}

export async function exchangeMetaCodeForToken({
  code,
  request
}: {
  code: string;
  request?: Request;
}) {
  const url = new URL(`${getMetaGraphBase()}/oauth/access_token`);
  url.searchParams.set("client_id", requiredMetaEnv("META_APP_ID"));
  url.searchParams.set("client_secret", requiredMetaEnv("META_APP_SECRET"));
  url.searchParams.set("redirect_uri", getMetaRedirectUri(request));
  url.searchParams.set("code", code);

  return fetchMetaToken(url);
}

export async function exchangeForLongLivedMetaToken(shortLivedToken: string) {
  const url = new URL(`${getMetaGraphBase()}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", requiredMetaEnv("META_APP_ID"));
  url.searchParams.set("client_secret", requiredMetaEnv("META_APP_SECRET"));
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  return fetchMetaToken(url);
}

async function fetchMetaToken(url: URL) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });
  const body = (await response.json().catch(() => ({}))) as Partial<
    MetaTokenResponse & { error?: { message?: string } }
  >;

  if (!response.ok || !body.access_token) {
    throw new Error(body.error?.message ?? "Meta token exchange failed");
  }

  return body as MetaTokenResponse;
}

function requiredMetaEnv(name: string) {
  const value = readServerEnv(name);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
