import { NextResponse } from "next/server";
import { createGoogleCalendarEvent } from "@/lib/integrations/google/workspaceService";
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
  syncGoogle?: boolean;
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

  let googleCalendarEventId: string | null = null;
  let googleCalendar = "not_requested";

  if (body.syncGoogle) {
    try {
      const result = await createGoogleCalendarEvent({
        db: auth.profile.admin,
        clientId: body.clientId,
        input: {
          title: body.title,
          startAt: start.toISOString(),
          endAt: end?.toISOString() ?? null,
          notes: body.notes ?? null,
          location: body.location ?? null
        }
      });
      googleCalendarEventId = result.id;
      googleCalendar = result.status;
    } catch (error) {
      googleCalendar =
        error instanceof Error ? `error: ${error.message}` : "error";
    }
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
      google_calendar_event_id: googleCalendarEventId,
      notes: body.notes ?? null,
      sync_google_requested: Boolean(body.syncGoogle),
      created_by: auth.profile.userId,
      is_demo: Boolean(body.isDemo)
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    event: data,
    googleCalendar
  });
}
