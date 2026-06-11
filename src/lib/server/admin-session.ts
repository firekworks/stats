import "server-only";

import {
  createHash,
  createHmac,
  pbkdf2Sync,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readServerEnv } from "@/lib/server/env";

const COOKIE_NAME = "stats_admin_session";
const SHORT_SESSION_SECONDS = 60 * 60 * 12;
const REMEMBERED_SESSION_SECONDS = 60 * 60 * 24 * 90;

type AdminSessionPayload = {
  email: string;
  exp: number;
  iat: number;
  nonce: string;
  role: "admin";
};

export type StatsAdminSession = {
  id: "env-admin";
  email: string;
  fullName: string;
  role: "admin";
};

export async function getStatsAdminSession(): Promise<StatsAdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) return null;

  const payload = verifySessionCookie(raw);

  if (!payload) return null;

  return {
    id: "env-admin",
    email: payload.email,
    fullName: "Admin Firekworks",
    role: "admin"
  };
}

export function issueStatsAdminSession({
  email,
  remember
}: {
  email: string;
  remember: boolean;
}) {
  const maxAge = remember ? REMEMBERED_SESSION_SECONDS : SHORT_SESSION_SECONDS;
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    email,
    exp: now + maxAge,
    iat: now,
    nonce: randomBytes(16).toString("hex"),
    role: "admin"
  };
  const token = signPayload(payload);
  const response = NextResponse.json({
    adminSession: true,
    expiresAt: payload.exp,
    route: "/admin"
  });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

export function clearStatsAdminSession(response = NextResponse.json({ ok: true })) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

export function getAdminAuthMissingEnv() {
  const missing: string[] = [];

  if (!readServerEnv("STATS_ADMIN_EMAIL")) missing.push("STATS_ADMIN_EMAIL");
  if (!readServerEnv("STATS_ADMIN_PASSWORD_HASH") && !readServerEnv("STATS_ADMIN_PASSWORD")) {
    missing.push("STATS_ADMIN_PASSWORD_HASH");
  }
  if (!getSessionSecret()) missing.push("SESSION_SECRET o AUTH_SECRET");

  return missing;
}

export function verifyStatsAdminCredentials({
  password,
  username
}: {
  password: string;
  username: string;
}) {
  const adminEmail = readServerEnv("STATS_ADMIN_EMAIL")?.toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();

  if (!adminEmail || normalizedUsername !== adminEmail) {
    return { matched: false, ok: false as const };
  }

  const missing = getAdminAuthMissingEnv();

  if (missing.length) {
    return {
      matched: true,
      ok: false as const,
      status: 503,
      error: `Login admin no configurado. Faltan: ${missing.join(", ")}.`
    };
  }

  const passwordHash = readServerEnv("STATS_ADMIN_PASSWORD_HASH");
  const plainPassword = readServerEnv("STATS_ADMIN_PASSWORD");
  const ok = passwordHash
    ? verifyPasswordHash(password, passwordHash)
    : constantTimeEqual(password, plainPassword ?? "");

  return ok
    ? { matched: true, ok: true as const, email: adminEmail }
    : {
        matched: true,
        ok: false as const,
        status: 401,
        error: "Credenciales admin incorrectas."
      };
}

function signPayload(payload: AdminSessionPayload) {
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${signature(encoded)}`;
}

function verifySessionCookie(value: string): AdminSessionPayload | null {
  const [encoded, receivedSignature] = value.split(".");

  if (!encoded || !receivedSignature) return null;

  const expectedSignature = signature(encoded);

  if (!constantTimeEqual(receivedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.role !== "admin" || !payload.email || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function signature(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret() ?? "")
    .update(encodedPayload)
    .digest("base64url");
}

function getSessionSecret() {
  return readServerEnv("SESSION_SECRET") ?? readServerEnv("AUTH_SECRET");
}

function verifyPasswordHash(password: string, configuredHash: string) {
  const value = configuredHash.trim();

  if (value.startsWith("sha256$")) {
    return constantTimeEqual(sha256(password), value.slice("sha256$".length));
  }

  const [kind, ...parts] = value.split(":");

  if (kind === "sha256" && parts[0]) {
    return constantTimeEqual(sha256(password), parts.join(":"));
  }

  if (/^[a-f0-9]{64}$/i.test(value)) {
    return constantTimeEqual(sha256(password), value);
  }

  if (kind === "scrypt" && parts.length >= 2) {
    const [salt, expected] = parts;
    const derived = scryptSync(password, salt, 32).toString("hex");
    return constantTimeEqual(derived, expected);
  }

  if (kind === "pbkdf2" && parts.length >= 3) {
    const [iterationsText, salt, expected] = parts;
    const iterations = Number(iterationsText);

    if (!Number.isFinite(iterations) || iterations < 10_000) {
      return false;
    }

    const derived = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
    return constantTimeEqual(derived, expected);
  }

  return false;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function base64url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
