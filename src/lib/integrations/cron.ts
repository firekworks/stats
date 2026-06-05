import "server-only";

import { NextResponse } from "next/server";
import { constantTimeEqual } from "@/lib/security/tokenCrypto";
import { readServerEnv } from "@/lib/server/env";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export function requireCronRequest(request: Request) {
  const configuredSecret = readServerEnv("CRON_SECRET");

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado" },
      { status: 401 }
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (!token || !constantTimeEqual(token, configuredSecret)) {
    return NextResponse.json({ error: "Cron no autorizado" }, { status: 401 });
  }

  return null;
}

export function requireCronServiceClient() {
  const db = getSupabaseServiceClient();

  if (!db) {
    return {
      response: NextResponse.json(
        { error: "Supabase service role no configurado" },
        { status: 503 }
      )
    };
  }

  return { db };
}
