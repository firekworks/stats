import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CalendarBody = {
  clientId?: string;
  campaignId?: string | null;
  contentItemId?: string | null;
  title?: string;
  type?: string;
  startAt?: string;
  endAt?: string | null;
  location?: string | null;
  notes?: string | null;
  isDemo?: boolean;
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as CalendarBody;

  if (!body.clientId || !body.title || !body.startAt) {
    return NextResponse.json(
      { error: "clientId, title y startAt son requeridos" },
      { status: 400 }
    );
  }

  const start = new Date(body.startAt);
  const end = body.endAt ? new Date(body.endAt) : null;

  if (Number.isNaN(start.getTime()) || (end && Number.isNaN(end.getTime()))) {
    return NextResponse.json({ error: "Fecha no valida" }, { status: 400 });
  }

  const { data, error } = await auth.profile.admin
    .from("calendar_events")
    .insert({
      client_id: body.clientId,
      campaign_id: body.campaignId ?? null,
      content_item_id: body.contentItemId ?? null,
      title: body.title,
      type: body.type ?? "Evento",
      status: "pending",
      start_at: start.toISOString(),
      end_at: end?.toISOString() ?? null,
      location: body.location ?? "Stats",
      notes: body.notes ?? null,
      created_by: auth.profile.userId,
      is_demo: Boolean(body.isDemo)
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const googleConfigured = Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN &&
      process.env.FIREKWORKS_CALENDAR_ID
  );

  return NextResponse.json({
    event: data,
    googleCalendar: googleConfigured ? "pending_connector" : "internal_fallback"
  });
}
