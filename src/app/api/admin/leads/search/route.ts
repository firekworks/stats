import { NextResponse } from "next/server";
import { getLeadsSourceStatus, searchWonLeads } from "@/lib/leads/source";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalRequest({ allowViewer: true });
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const status = getLeadsSourceStatus();

  if (!status.configured) {
    return NextResponse.json({
      leads: [],
      missing: status.missing
    });
  }

  const result = await searchWonLeads(query);

  return NextResponse.json(result);
}
