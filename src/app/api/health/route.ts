import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return NextResponse.json({
    ok: true,
    app: "firekworks-stats",
    time: new Date().toISOString(),
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKeyConfigured: Boolean(anonKey),
    serviceRoleConfiguredServerSide: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  });
}
