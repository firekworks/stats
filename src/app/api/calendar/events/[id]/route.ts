import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const patch = {
    title: stringOrNull(body.title),
    type: stringOrNull(body.type),
    status: stringOrNull(body.status),
    start_at: stringOrNull(body.startAt),
    end_at: stringOrNull(body.endAt),
    notes: stringOrNull(body.notes),
    location: stringOrNull(body.location),
    updated_at: new Date().toISOString()
  };
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== null)
  );
  const { data, error } = await auth.profile.admin
    .from("calendar_events")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ event: data });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  const { error } = await auth.profile.admin
    .from("calendar_events")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
