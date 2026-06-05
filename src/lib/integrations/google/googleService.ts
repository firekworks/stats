import "server-only";

import { getMissingServerEnv, readServerEnv } from "@/lib/server/env";

export const GOOGLE_BUSINESS_PROVIDER = "google_business";

const googleBusinessScopes = ["https://www.googleapis.com/auth/business.manage"];

export function getGoogleMissingEnv() {
  return getMissingServerEnv([
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI"
  ]);
}

export function buildGoogleAuthorizationUrl(state: string) {
  const clientId = readServerEnv("GOOGLE_CLIENT_ID");
  const redirectUri = readServerEnv("GOOGLE_REDIRECT_URI");

  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth no configurado");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", googleBusinessScopes.join(" "));
  url.searchParams.set("state", state);

  return url;
}

export async function exchangeGoogleCodeForToken(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: requiredGoogleEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredGoogleEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: requiredGoogleEnv("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code"
    }),
    cache: "no-store"
  });
  const body = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    error_description?: string;
    error?: string;
  };

  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description ?? body.error ?? "Google token exchange failed");
  }

  return body;
}

function requiredGoogleEnv(name: string) {
  const value = readServerEnv(name);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
