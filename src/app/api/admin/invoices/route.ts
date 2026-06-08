import { NextResponse } from "next/server";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const clientId = string(body.clientId);
  const concept = string(body.concept) ?? "Gestión mensual Firekworks";
  const base = number(body.base);
  const vatRate = number(body.vatRate, 21);
  const withholdingRate = number(body.withholdingRate, 0);

  if (!clientId || base <= 0) {
    return NextResponse.json({ error: "Cliente y base imponible requeridos" }, { status: 400 });
  }

  const taxAmount = round(base * (vatRate / 100));
  const withholdingAmount = round(base * (withholdingRate / 100));
  const total = round(base + taxAmount - withholdingAmount);
  const invoiceNumber = string(body.invoiceNumber) ?? makeInvoiceNumber();
  const issueDate = string(body.issueDate) ?? new Date().toISOString().slice(0, 10);
  const dueDate = string(body.dueDate) ?? addDays(issueDate, 7);

  const { data: invoice, error } = await auth.profile.admin
    .from("invoices")
    .insert({
      client_id: clientId,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      status: string(body.status) ?? "draft",
      subtotal: base,
      tax_rate: vatRate,
      tax_amount: taxAmount,
      withholding_rate: withholdingRate,
      withholding_amount: withholdingAmount,
      total,
      payment_method: string(body.paymentMethod) ?? "Transferencia",
      public_notes: string(body.notes)
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: itemError } = await auth.profile.admin.from("invoice_items").insert({
    invoice_id: invoice.id,
    description: concept,
    quantity: 1,
    unit_price: base,
    total: base
  });

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 400 });
  }

  return NextResponse.json({ invoice });
}

function string(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function makeInvoiceNumber() {
  const date = new Date();
  return `FW-${date.getFullYear()}-${String(Date.now()).slice(-5)}`;
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
