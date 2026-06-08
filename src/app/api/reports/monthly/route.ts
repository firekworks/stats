import { NextResponse } from "next/server";
import { buildMonthlyReportPdf } from "@/lib/pdf";
import { canAccessClient, getRequestProfile } from "@/lib/api-auth";
import {
  getDemoMonthlyReportPdfInput,
  getMonthlyReportPdfInput
} from "@/lib/pdf-data";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  const month = Number(url.searchParams.get("month") || 0) || null;
  const year = Number(url.searchParams.get("year") || 0) || null;
  const profile = await getRequestProfile();
  const admin = profile?.admin ?? getSupabaseAdminClient();

  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  if (!admin) {
    const demoInput = getDemoMonthlyReportPdfInput(clientId, month, year);

    if (!demoInput) {
      return NextResponse.json({ error: "Sesion requerida" }, { status: 401 });
    }

    const pdf = await buildMonthlyReportPdf(demoInput);
    const period = `${demoInput.metric.year}-${String(demoInput.metric.month).padStart(2, "0")}`;
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="FW-${slugFilePart(
          demoInput.client.publicName
        )}-informe-${period}.pdf"`
      }
    });
  }

  if (!profile) {
    const { data: demoClient } = await admin
      .from("clients")
      .select("id, is_demo")
      .eq("id", clientId)
      .eq("is_demo", true)
      .maybeSingle();

    if (!demoClient) {
      return NextResponse.json({ error: "Sesion requerida" }, { status: 401 });
    }
  } else if (!canAccessClient(profile, clientId)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const input = await getMonthlyReportPdfInput(admin, clientId, month, year);

  if (!input) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const pdf = await buildMonthlyReportPdf(input);
  const period = `${input.metric.year}-${String(input.metric.month).padStart(2, "0")}`;
  const filename = `FW-${slugFilePart(input.client.publicName)}-informe-${period}.pdf`;
  const storagePath = `${clientId}/reports/${input.metric.year}-${String(
    input.metric.month
  ).padStart(2, "0")}.pdf`;

  if (!input.isDemoData && profile) {
    await profile.admin.storage
      .from(process.env.SUPABASE_REPORTS_BUCKET ?? "stats-reports")
      .upload(storagePath, pdf, {
        contentType: "application/pdf",
        upsert: true
      });

    await profile.admin.from("monthly_reports").upsert(
      {
        client_id: clientId,
        month: input.metric.month,
        year: input.metric.year,
        title: `Informe mensual - ${input.metric.month}/${input.metric.year}`,
        status: "generated",
        pdf_storage_path: storagePath,
        generated_at: new Date().toISOString()
      },
      { onConflict: "client_id,month,year" }
    );
  }

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`
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
      .toLowerCase() || "cliente"
  );
}
