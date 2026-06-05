import { NextResponse } from "next/server";
import { reports } from "@/lib/demo-data";
import { buildMonthlyReportPdf } from "@/lib/pdf";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId =
    url.searchParams.get("clientId") ??
    "11111111-1111-4111-8111-111111111111";
  const pdf = await buildMonthlyReportPdf(clientId);

  const supabase = getSupabaseAdminClient();
  const report = reports.find((item) => item.clientId === clientId);

  if (supabase && report) {
    await supabase.storage
      .from(process.env.SUPABASE_REPORTS_BUCKET ?? "stats-reports")
      .upload(report.storagePath ?? `${clientId}/reports/latest.pdf`, pdf, {
        contentType: "application/pdf",
        upsert: true
      });
  }

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="firekworks-stats-${clientId}.pdf"`
    }
  });
}
