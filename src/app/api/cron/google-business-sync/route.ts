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
    reason: "Google Business Profile sync esta preparado, pero no importa metricas hasta mapear assets y permisos reales."
  });
}
