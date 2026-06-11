import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

const allowedKeys = new Set([
  "stats.packs_json",
  "stats.playbooks_json",
  "stats.pdf_templates_json",
  "stats.invoice_templates_json"
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    key?: string;
    value?: string;
  };

  if (!body.key || !allowedKeys.has(body.key)) {
    return NextResponse.json({ error: "Ajuste no permitido" }, { status: 400 });
  }

  if (typeof body.value !== "string" || body.value.length > 25000) {
    return NextResponse.json({ error: "Valor invalido" }, { status: 400 });
  }

  try {
    JSON.parse(body.value);
  } catch {
    return NextResponse.json({ error: "Debe ser JSON valido" }, { status: 400 });
  }

  const { error } = await auth.profile.admin.from("app_texts").upsert(
    {
      app: "stats",
      key: body.key,
      value: body.value,
      updated_by: auth.profile.userId,
      updated_at: new Date().toISOString()
    },
    { onConflict: "app,key" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
