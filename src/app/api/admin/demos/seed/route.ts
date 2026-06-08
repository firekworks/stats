import { NextResponse } from "next/server";
import { seedStatsDemoData } from "@/lib/demo-seed";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  try {
    const result = await seedStatsDemoData(auth.profile.admin);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron crear las demos"
      },
      { status: 400 }
    );
  }
}
