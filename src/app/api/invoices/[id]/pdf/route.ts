import { NextResponse } from "next/server";
import { canAccessClient, getRequestProfile } from "@/lib/api-auth";
import { buildInvoicePdf } from "@/lib/pdf";
import { getDemoInvoicePdfInput, getInvoicePdfInput } from "@/lib/pdf-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const profile = await getRequestProfile();

  if (!profile) {
    const demoInput = getDemoInvoicePdfInput(id);

    if (!demoInput) {
      return NextResponse.json({ error: "Sesion requerida" }, { status: 401 });
    }

    const pdf = await buildInvoicePdf(demoInput);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FW-${slugFilePart(
          demoInput.invoice.invoiceNumber.replace(/^FW[-_]?/i, "")
        )}-${slugFilePart(demoInput.client.slug)}.pdf"`
      }
    });
  }

  const input = await getInvoicePdfInput(profile.admin, id);

  if (!input) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  if (!canAccessClient(profile, input.invoice.clientId)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const pdf = await buildInvoicePdf(input);
  const storagePath = `${input.invoice.clientId}/invoices/${input.invoice.invoiceNumber}.pdf`;

  if (!input.isDemoData) {
    await profile.admin.storage
      .from(process.env.SUPABASE_INVOICES_BUCKET ?? "stats-invoices")
      .upload(storagePath, pdf, {
        contentType: "application/pdf",
        upsert: true
      });

    await profile.admin
      .from("invoices")
      .update({ pdf_storage_path: storagePath })
      .eq("id", input.invoice.id);
  }

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="FW-${slugFilePart(
        input.invoice.invoiceNumber.replace(/^FW[-_]?/i, "")
      )}-${slugFilePart(input.client.slug)}.pdf"`
    }
  });
}

function slugFilePart(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "factura"
  );
}
