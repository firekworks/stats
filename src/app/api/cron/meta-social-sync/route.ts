import { NextResponse } from "next/server";
import {
  requireCronRequest,
  requireCronServiceClient
} from "@/lib/integrations/cron";
import { runMetaSocialSync } from "@/lib/integrations/meta/metaSocialSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireCronRequest(request);
  if (denied) return denied;

  const service = requireCronServiceClient();
  if ("response" in service) return service.response;

  const result = await runMetaSocialSync(service.db);
  return NextResponse.json({ ok: result.errors.length === 0, result });
}
