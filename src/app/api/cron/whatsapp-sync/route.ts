import { NextResponse } from "next/server";
import { requireCronRequest } from "@/lib/integrations/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const denied = requireCronRequest(request);
  if (denied) return denied;

  return NextResponse.json({
    ok: true,
    skipped: true,
    reason: "WhatsApp Cloud API queda preparado via webhooks; no se generan metricas sin eventos reales."
  });
}
