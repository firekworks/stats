import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const missingTableCodes = new Set(["42P01", "42703", "PGRST106", "PGRST205"]);
const internalRoles = new Set<Role>(["admin", "sales", "viewer"]);

const reservedUsernames = new Set([
  "admin",
  "root",
  "firekworks",
  "soporte",
  "stats",
  "leads",
  "radar",
  "null",
  "undefined",
  "test",
  "demo"
]);

type LoginBody = {
  username?: string;
  password?: string;
};

type ProfileRow = {
  user_id: string;
  role: Role;
  is_active: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const username = normalizeUsername(body.username || "");
  const password = body.password || "";

  if (!username || !password) {
    return invalidLogin();
  }

  const admin = getSupabaseAdminClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !admin ||
    !url ||
    !publicKey ||
    publicKey.startsWith("sb_secret_") ||
    publicKey.includes("service_role")
  ) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 503 });
  }

  const resolved = await resolveAuthIdentity(admin, username);

  if (resolved.status === "pending-migration") {
    return NextResponse.json(
      { error: "Base de datos pendiente de migración" },
      { status: 503 }
    );
  }

  if (!resolved.authEmail) {
    return invalidLogin();
  }

  const authClient = createClient(url, publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data, error } = await authClient.auth.signInWithPassword({
    email: resolved.authEmail,
    password
  });

  if (error || !data.session || !data.user?.id) {
    return invalidLogin();
  }

  const validation = await validateAccess(admin, data.user.id, resolved.clientId);

  if (validation.status === "pending-migration") {
    return NextResponse.json(
      { error: "Base de datos pendiente de migración" },
      { status: 503 }
    );
  }

  if (!validation.ok) {
    return invalidLogin();
  }

  return NextResponse.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    route: validation.route
  });
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

async function resolveAuthIdentity(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  username: string
) {
  if (username.includes("@")) {
    return { authEmail: username, clientId: null as string | null };
  }

  if (reservedUsernames.has(username)) {
    return { authEmail: null, clientId: null };
  }

  const { data, error } = await admin
    .from("client_login_aliases")
    .select("auth_email, client_id, is_active")
    .eq("username", username)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    if (missingTableCodes.has(error.code)) {
      return { authEmail: null, clientId: null, status: "pending-migration" as const };
    }

    return { authEmail: null, clientId: null };
  }

  if (!data?.auth_email || !data.client_id) {
    return { authEmail: null, clientId: null };
  }

  return { authEmail: data.auth_email as string, clientId: data.client_id as string };
}

async function validateAccess(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  userId: string,
  expectedClientId: string | null
) {
  const { data: profile } = await admin
    .from("profiles")
    .select("user_id, role, is_active")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (!profile?.is_active) {
    return { ok: false, route: "/login" };
  }

  if (internalRoles.has(profile.role)) {
    return { ok: true, route: "/admin" };
  }

  if (profile.role !== "client") {
    return { ok: false, route: "/login" };
  }

  const { data: clientUser, error } = await admin
    .from("client_users")
    .select("client_id, is_active, clients(client_portal_enabled)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    if (missingTableCodes.has(error.code)) {
      return { ok: false, route: "/login", status: "pending-migration" as const };
    }

    return { ok: false, route: "/login" };
  }

  const clientId = clientUser?.client_id as string | undefined;
  const clients = clientUser?.clients as
    | { client_portal_enabled?: boolean }
    | { client_portal_enabled?: boolean }[]
    | null;
  const client = Array.isArray(clients) ? clients[0] : clients;

  if (
    !clientId ||
    (expectedClientId && expectedClientId !== clientId) ||
    !client?.client_portal_enabled
  ) {
    return { ok: false, route: "/login" };
  }

  return { ok: true, route: "/client" };
}

function invalidLogin() {
  return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
}
