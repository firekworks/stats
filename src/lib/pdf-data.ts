import { getBillingSettings } from "@/lib/billing-settings";
import {
  campaigns as demoCampaigns,
  clients as demoClients,
  contentItems as demoContent,
  invoices as demoInvoices,
  monthlyMetrics as demoMetrics
} from "@/lib/demo-data";
import type { InvoicePdfInput, MonthlyReportPdfInput } from "@/lib/pdf";
import type { Campaign, Client, ContentItem, Invoice, MonthlyMetric } from "@/lib/types";
import type { getSupabaseAdminClient } from "@/lib/supabase/server";

type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
type Row = Record<string, unknown>;

export async function getMonthlyReportPdfInput(
  admin: AdminClient,
  clientId: string,
  month?: number | null,
  year?: number | null
): Promise<MonthlyReportPdfInput | null> {
  const { settings } = await getBillingSettings();
  const { data: clientRow } = await admin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle<Row>();

  if (!clientRow) {
    const demoClient = demoClients.find((client) => client.id === clientId);

    if (!demoClient) {
      return null;
    }

    const metric =
      demoMetrics
        .filter(
          (item) =>
            item.clientId === clientId &&
            (!month || item.month === month) &&
            (!year || item.year === year)
        )
        .sort((a, b) => b.year - a.year || b.month - a.month)[0] ??
      demoMetrics.find((item) => item.clientId === clientId) ??
      demoMetrics[0];

    return {
      billing: settings,
      client: demoClient,
      metric,
      campaigns: demoCampaigns.filter((campaign) => campaign.clientId === clientId),
      content: demoContent.filter((item) => item.clientId === clientId),
      isDemoData: true
    };
  }

  let metricQuery = admin
    .from("monthly_metrics")
    .select("*")
    .eq("client_id", clientId);

  if (month && year) {
    metricQuery = metricQuery.eq("month", month).eq("year", year);
  } else {
    metricQuery = metricQuery
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(1);
  }

  const { data: metricRow } = await metricQuery.maybeSingle<Row>();
  const { data: campaignRows } = await admin
    .from("campaigns")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(12);
  const { data: contentRows } = await admin
    .from("content_items")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(12);

  const now = new Date();
  const metric = mapMetric(
    metricRow ?? {
      id: `${clientId}-empty`,
      client_id: clientId,
      month: month ?? now.getMonth() + 1,
      year: year ?? now.getFullYear(),
      roi_type: "insufficient_data",
      summary_client: "Aun no hay metricas reales registradas para este periodo.",
      diagnosis_client:
        "Conecta integraciones o introduce datos manuales para generar diagnosticos.",
      next_month_plan_client:
        "Preparar integraciones y consolidar datos del cliente."
    }
  );

  return {
    billing: settings,
    client: mapClient(clientRow),
    metric,
    campaigns: (campaignRows ?? []).map(mapCampaign),
    content: (contentRows ?? []).map(mapContent)
  };
}

export async function getInvoicePdfInput(
  admin: AdminClient,
  invoiceId: string
): Promise<InvoicePdfInput | null> {
  const { settings } = await getBillingSettings();
  const { data: invoiceRow } = await admin
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", invoiceId)
    .maybeSingle<Row>();

  if (!invoiceRow) {
    const demoInvoice = demoInvoices.find((invoice) => invoice.id === invoiceId);
    const demoClient = demoInvoice
      ? demoClients.find((client) => client.id === demoInvoice.clientId)
      : null;

    if (!demoInvoice || !demoClient) {
      return null;
    }

    return {
      billing: settings,
      client: demoClient,
      invoice: demoInvoice,
      isDemoData: true
    };
  }

  const clientId = String(invoiceRow.client_id ?? "");
  const { data: clientRow } = await admin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle<Row>();

  if (!clientRow) {
    return null;
  }

  return {
    billing: settings,
    client: mapClient(clientRow),
    invoice: mapInvoice(invoiceRow)
  };
}

function mapClient(row: Row): Client & {
  taxId?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
} {
  const status = String(row.status ?? "Activo");

  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    publicName: String(row.name ?? "Cliente"),
    legalName: String(row.legal_name ?? row.billing_name ?? row.name ?? "Cliente"),
    leadId: stringOrNull(row.lead_id),
    source: stringOrNull(row.source),
    taxId: stringOrNull(row.tax_id),
    billingEmail: stringOrNull(row.billing_email),
    billingAddress: stringOrNull(row.billing_address),
    phone: stringOrNull(row.phone),
    website: stringOrNull(row.website),
    industry: String(row.sector ?? row.industry ?? ""),
    status:
      status === "Baja" || status === "churned"
        ? "churned"
        : status === "Pausado" || status === "paused"
          ? "paused"
          : "active",
    city: String(row.city ?? ""),
    averageTicket: number(row.average_ticket),
    allowPublicLeaderboardName: Boolean(row.show_in_leaderboard),
    planName: "Plan activo",
    planStatus:
      status === "Baja" ? "Baja" : status === "Pausado" ? "Pausado" : "Activo",
    monthlyFee: number(row.service_fee),
    onboardedAt: String(row.created_at ?? ""),
    publicLeaderboardName: String(row.public_leaderboard_name ?? row.name ?? "Cliente")
  };
}

function mapMetric(row: Row): MonthlyMetric {
  return {
    id: String(row.id ?? `${row.client_id}-${row.year}-${row.month}`),
    clientId: String(row.client_id),
    month: number(row.month),
    year: number(row.year),
    reach: number(row.reach),
    impressions: number(row.impressions),
    profileVisits: number(row.profile_visits),
    websiteClicks: number(row.website_clicks),
    calls: number(row.calls),
    whatsappClicks: number(row.whatsapp_clicks),
    messages: number(row.messages),
    leads: number(row.leads),
    bookings: number(row.bookings),
    estimatedRevenue: number(row.estimated_revenue),
    realRevenue: nullableNumber(row.real_revenue),
    adSpend: number(row.ad_spend),
    serviceFee: number(row.service_fee),
    extras: number(row.extra_costs ?? row.extras),
    totalInvestment:
      nullableNumber(row.total_investment) ??
      number(row.ad_spend) + number(row.service_fee) + number(row.extra_costs),
    estimatedRoi: nullableNumber(row.estimated_roi),
    realRoi: nullableNumber(row.real_roi),
    roiMode: String(row.roi_type ?? row.roi_mode ?? "estimated") as MonthlyMetric["roiMode"],
    bestContentId: stringOrNull(row.best_content_id),
    worstContentId: stringOrNull(row.worst_content_id),
    summary: String(row.summary_client ?? row.summary ?? ""),
    diagnosis: String(row.diagnosis_client ?? row.diagnosis ?? ""),
    nextMonthPlan: String(row.next_month_plan_client ?? row.next_month_plan ?? "")
  };
}

function mapCampaign(row: Row): Campaign {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    name: String(row.name ?? "Campana"),
    platform: String(row.platform ?? "Meta Ads") as Campaign["platform"],
    objective: String(row.objective ?? "Leads") as Campaign["objective"],
    budget: number(row.budget),
    spend: number(row.spend),
    startDate: String(row.start_date ?? ""),
    endDate: stringOrNull(row.end_date),
    status: String(row.status ?? "draft") as Campaign["status"],
    ctr: number(row.ctr),
    cpc: number(row.cpc),
    cpm: number(row.cpm),
    leads: number(row.leads),
    costPerLead: number(row.cost_per_lead),
    roas: nullableNumber(row.roas),
    visibleSummary: String(row.client_visible_summary ?? "")
  };
}

function mapContent(row: Row): ContentItem {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    title: String(row.title ?? "Contenido"),
    type: String(row.type ?? "Post") as ContentItem["type"],
    platform: String(row.platform ?? "Instagram") as ContentItem["platform"],
    publishDate: String(row.published_at ?? row.publish_date ?? ""),
    status: String(row.status ?? "idea") as ContentItem["status"],
    url: String(row.url ?? "#"),
    storagePath: stringOrNull(row.storage_path),
    views: number(row.views),
    reach: number(row.reach),
    likes: number(row.likes),
    comments: number(row.comments),
    shares: number(row.shares),
    saves: number(row.saves),
    engagementRate: number(row.engagement_rate),
    performance: String(row.performance_label ?? row.performance ?? "ok") as ContentItem["performance"],
    reusable: Boolean(row.reusable),
    learning: String(row.learning ?? row.caption ?? "")
  };
}

function mapInvoice(row: Row): Invoice {
  const items = Array.isArray(row.invoice_items) ? row.invoice_items : [];

  return {
    id: String(row.id),
    clientId: String(row.client_id),
    invoiceNumber: String(row.invoice_number ?? row.id),
    status: String(row.status ?? "draft") as Invoice["status"],
    issueDate: String(row.issue_date ?? ""),
    dueDate: String(row.due_date ?? ""),
    taxableBase: number(row.taxable_base ?? row.subtotal),
    vatRate: number(row.vat_rate ?? row.tax_rate),
    withholdingRate: number(row.withholding_rate),
    total: number(row.total),
    paymentMethod: String(row.payment_method ?? ""),
    publicNotes: String(row.public_notes ?? ""),
    items: items.map((item) => ({
      id: String((item as Row).id),
      description: String((item as Row).description ?? ""),
      quantity: number((item as Row).quantity),
      unitPrice: number((item as Row).unit_price),
      total: number((item as Row).total)
    }))
  };
}

function number(value: unknown) {
  return Number(value ?? 0);
}

function nullableNumber(value: unknown) {
  return value === null || typeof value === "undefined" ? null : Number(value);
}

function stringOrNull(value: unknown) {
  return value === null || typeof value === "undefined" ? null : String(value);
}
