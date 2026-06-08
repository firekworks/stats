import { NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

const RESERVED_USERNAMES = new Set([
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
const pendingMigrationCodes = new Set(["42P01", "42703", "PGRST106", "PGRST205"]);

type AccessBody = {
  clientId?: string;
  username?: string;
  password?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as AccessBody;
  const clientId = body.clientId || "";
  const username = normalizeUsername(body.username || "");
  const password = body.password || "";

  if (!clientId || !username || password.length < 10) {
    return NextResponse.json({ error: "Cliente, usuario y contraseña temporal son obligatorios" }, { status: 400 });
  }

  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ error: "Ese usuario esta reservado" }, { status: 400 });
  }

  const { data: client, error: clientLookupError } = await auth.admin
    .from("clients")
    .select("id, name, client_portal_enabled")
    .eq("id", clientId)
    .maybeSingle();

  if (clientLookupError) {
    if (pendingMigrationCodes.has(clientLookupError.code)) {
      return NextResponse.json(
        { error: "Base de datos pendiente de migración" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: clientLookupError.message }, { status: 500 });
  }

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const authEmail = `${username}@clientes.firekworks.local`;
  const fullName = body.fullName?.trim() || client.name || username;

  const { data: existingAlias, error: aliasLookupError } = await auth.admin
    .from("client_login_aliases")
    .select("id")
    .or(`username.eq.${username},auth_email.eq.${authEmail}`)
    .maybeSingle();

  if (aliasLookupError) {
    if (pendingMigrationCodes.has(aliasLookupError.code)) {
      return NextResponse.json(
        { error: "Base de datos pendiente de migración" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: aliasLookupError.message }, { status: 500 });
  }

  if (existingAlias) {
    return NextResponse.json({ error: "Ese usuario ya existe" }, { status: 409 });
  }

  const { data: authUser, error: authError } = await auth.admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username
    }
  });

  if (authError || !authUser.user?.id) {
    return NextResponse.json({ error: authError?.message || "No se pudo crear el usuario Auth" }, { status: 500 });
  }

  const userId = authUser.user.id;

  const { error: profileError } = await auth.admin.from("profiles").upsert({
    user_id: userId,
    email: authEmail,
    full_name: fullName,
    role: "client",
    is_active: true
  });

  const { error: clientUserError } = await auth.admin.from("client_users").upsert({
    client_id: clientId,
    user_id: userId,
    role: "owner",
    is_active: true,
    invited_at: new Date().toISOString()
  });

  const { error: aliasError } = await auth.admin.from("client_login_aliases").insert({
    client_id: clientId,
    user_id: userId,
    username,
    auth_email: authEmail,
    is_active: true,
    created_by: auth.userId
  });

  const { error: clientError } = await auth.admin
    .from("clients")
    .update({
      client_portal_enabled: true,
      portal_status: "active"
    })
    .eq("id", clientId);

  const firstError = profileError || clientUserError || aliasError || clientError;

  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  return NextResponse.json({
    username,
    temporaryPassword: password,
    clientName: client.name
  });
}

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 32);
}

async function requireAdminUser() {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return { response: NextResponse.json({ error: "Supabase no configurado" }, { status: 503 }) };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return { response: NextResponse.json({ error: "Sesion interna requerida" }, { status: 401 }) };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_active || profile.role !== "admin") {
    return { response: NextResponse.json({ error: "Rol admin requerido" }, { status: 403 }) };
  }

  return { admin, userId: user.id };
}
