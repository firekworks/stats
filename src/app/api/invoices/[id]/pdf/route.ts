import { NextResponse } from "next/server";
import { invoices } from "@/lib/demo-data";
import { buildInvoicePdf } from "@/lib/pdf";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const pdf = await buildInvoicePdf(id);
  const invoice = invoices.find((item) => item.id === id);
  const supabase = getSupabaseAdminClient();

  if (supabase && invoice) {
    await supabase.storage
      .from(process.env.SUPABASE_INVOICES_BUCKET ?? "stats-invoices")
      .upload(`${invoice.clientId}/invoices/${invoice.invoiceNumber}.pdf`, pdf, {
        contentType: "application/pdf",
        upsert: true
      });
  }

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice?.invoiceNumber ?? id}.pdf"`
    }
  });
}
