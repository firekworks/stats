import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const clientId = string(body.clientId);
  const title = string(body.title);

  if (!clientId || !title) {
    return NextResponse.json({ error: "Cliente y título requeridos" }, { status: 400 });
  }

  const { count } = await auth.profile.admin
    .from("content_items")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId);
  const format = string(body.format) ?? "Post";
  const prefix = format === "Reel" ? "REEL" : format === "Carrusel" ? "CAR" : format === "Story" ? "STORY" : "POST";
  const code = string(body.contentCode) ?? `${prefix}-${String((count ?? 0) + 1).padStart(3, "0")}`;
  const { data, error } = await auth.profile.admin
    .from("content_items")
    .insert({
      client_id: clientId,
      campaign_id: string(body.campaignId),
      content_code: code,
      type: format,
      platform: "Instagram",
      title,
      objective: string(body.objective),
      hook: string(body.hook),
      caption: string(body.copy),
      cta: string(body.cta),
      due_date: string(body.date),
      publish_date: string(body.date),
      status: string(body.status) ?? "idea",
      google_drive_file_id: string(body.driveFileId),
      drive_file_url: string(body.driveFileUrl),
      canva_view_url: string(body.canvaUrl),
      is_promoted: Boolean(body.promoted),
      promotion_budget: number(body.budget),
      client_visible: Boolean(body.clientVisible)
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ content: data });
}

function string(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
