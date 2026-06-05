import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { statsEditableTexts } from "@/lib/app-texts";

const missingTableCodes = new Set(["42P01", "42703", "PGRST106", "PGRST205"]);
const allowedKeys: ReadonlySet<string> = new Set(statsEditableTexts.map((entry) => entry.key));

const bodySchema = z.object({
  entries: z.array(
    z.object({
      key: z.string().min(1).max(120),
      value: z.string().max(2000)
    })
  )
});

export async function POST(request: Request) {
  const auth = await requireAdminUser();
  if ("response" in auth) return auth.response;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
  }

  const rows = parsed.data.entries
    .filter((entry) => allowedKeys.has(entry.key))
    .map((entry) => ({
      app: "stats",
      key: entry.key,
      value: entry.value.trim(),
      updated_by: auth.userId,
      updated_at: new Date().toISOString()
    }));

  if (!rows.length) {
    return NextResponse.json({ error: "No hay textos validos" }, { status: 400 });
  }

  const { error } = await auth.admin.from("app_texts").upsert(rows, {
    onConflict: "app,key"
  });

  if (error) {
    if (missingTableCodes.has(error.code)) {
      return NextResponse.json(
        { error: "Base de datos pendiente de migración" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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
