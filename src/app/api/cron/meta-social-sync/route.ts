import { NextResponse } from "next/server";
import {
  requireCronRequest,
  requireCronServiceClient
} from "@/lib/integrations/cron";
import { runMetaSocialSync } from "@/lib/integrations/meta/metaSocialSync";
import { getMissingServerEnv } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireCronRequest(request);
  if (denied) return denied;

  const service = requireCronServiceClient();
  if ("response" in service) return service.response;

  const missing = getMissingServerEnv(["META_GRAPH_VERSION", "ENCRYPTION_KEY"]);
  if (missing.length) {
    return NextResponse.json({ error: "Configuracion Meta incompleta", missing }, { status: 503 });
  }

  const result = await runMetaSocialSync(service.db);
  return NextResponse.json({ ok: result.errors.length === 0, result });
}
