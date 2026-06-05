import {
  getAllDemoData,
  getDemoPortalData,
  getLatestMetric,
  getPreviousMetric
} from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Alert,
  Campaign,
  Client,
  ClientScore,
  ContentItem,
  Invoice,
  InvoiceItem,
  LeaderboardEntry,
  MonthlyMetric,
  PortalData,
  Report,
  Task
} from "@/lib/types";

// Replace with generated Supabase Database types after the first schema pull.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

export async function getClientPortalData(clientId?: string) {
  const supabase = await getSupabaseServerClient();

  if (!supabase || !clientId) {
    return getDemoPortalData(clientId);
  }

  const [
    clients,
    metrics,
    campaigns,
    content,
    reports,
    invoices,
    leaderboards,
    scores,
    alerts,
    tasks
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*, subscriptions(monthly_fee, plans(name))")
      .eq("id", clientId),
    supabase
      .from("monthly_metrics")
      .select("*")
      .eq("client_id", clientId)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
    supabase.from("campaigns").select("*").eq("client_id", clientId),
    supabase.from("content_items").select("*").eq("client_id", clientId),
    supabase.from("reports").select("*").eq("client_id", clientId),
    supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("client_id", clientId),
    supabase.from("leaderboard_entries").select("*, leaderboards(category)"),
    supabase.from("client_scores").select("*").eq("client_id", clientId),
    supabase
      .from("alerts")
      .select("*")
      .or(`client_id.eq.${clientId},visibility.eq.client`),
    supabase
      .from("tasks")
      .select("*")
      .eq("client_id", clientId)
      .eq("visible_to_client", true)
  ]);

  if (clients.error || !clients.data?.[0]) {
    return getDemoPortalData(clientId);
  }

  return makePortalData({
    clients: clients.data,
    selectedClientId: clientId,
    metrics: metrics.data ?? [],
    campaigns: campaigns.data ?? [],
    content: content.data ?? [],
    reports: reports.data ?? [],
    invoices: invoices.data ?? [],
    leaderboards: leaderboards.data ?? [],
    scores: scores.data ?? [],
    alerts: alerts.data ?? [],
    tasks: tasks.data ?? []
  });
}

export async function getAdminPortalData(): Promise<PortalData> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return getAllDemoData();
  }

  const [
    clients,
    metrics,
    campaigns,
    content,
    reports,
    invoices,
    leaderboards,
    scores,
    alerts,
    tasks
  ] = await Promise.all([
    supabase.from("clients").select("*, subscriptions(monthly_fee, plans(name))"),
    supabase.from("monthly_metrics").select("*"),
    supabase.from("campaigns").select("*"),
    supabase.from("content_items").select("*"),
    supabase.from("reports").select("*"),
    supabase.from("invoices").select("*, invoice_items(*)"),
    supabase.from("leaderboard_entries").select("*, leaderboards(category)"),
    supabase.from("client_scores").select("*"),
    supabase.from("alerts").select("*"),
    supabase.from("tasks").select("*")
  ]);

  if (clients.error || !clients.data?.length) {
    return getAllDemoData();
  }

  return makePortalData({
    clients: clients.data,
    selectedClientId: clients.data[0].id,
    metrics: metrics.data ?? [],
    campaigns: campaigns.data ?? [],
    content: content.data ?? [],
    reports: reports.data ?? [],
    invoices: invoices.data ?? [],
    leaderboards: leaderboards.data ?? [],
    scores: scores.data ?? [],
    alerts: alerts.data ?? [],
    tasks: tasks.data ?? []
  });
}

function makePortalData(input: {
  clients: Row[];
  selectedClientId: string;
  metrics: Row[];
  campaigns: Row[];
  content: Row[];
  reports: Row[];
  invoices: Row[];
  leaderboards: Row[];
  scores: Row[];
  alerts: Row[];
  tasks: Row[];
}): PortalData {
  const clients = input.clients.map(mapClient);
  const selectedClient =
    clients.find((client) => client.id === input.selectedClientId) ?? clients[0];

  return {
    clients,
    selectedClient,
    metrics: input.metrics.map(mapMetric),
    campaigns: input.campaigns.map(mapCampaign),
    content: input.content.map(mapContent),
    reports: input.reports.map(mapReport),
    invoices: input.invoices.map(mapInvoice),
    leaderboards: input.leaderboards.map((entry) =>
      mapLeaderboard(entry, selectedClient.id)
    ),
    scores: input.scores.map(mapScore),
    alerts: input.alerts.map(mapAlert),
    tasks: input.tasks.map(mapTask)
  };
}

function mapClient(row: Row): Client {
  const subscription = Array.isArray(row.subscriptions)
    ? row.subscriptions[0]
    : undefined;
  const plan = Array.isArray(subscription?.plans)
    ? subscription.plans[0]
    : subscription?.plans;

  return {
    id: row.id,
    slug: row.slug,
    publicName: row.public_name,
    legalName: row.legal_name,
    industry: row.industry,
    status: row.status,
    city: row.city ?? "",
    averageTicket: Number(row.average_ticket ?? 0),
    allowPublicLeaderboardName: Boolean(row.allow_public_leaderboard_name),
    planName: plan?.name ?? "Plan activo",
    planStatus:
      row.status === "active" ? "Activo" : row.status === "paused" ? "Pausado" : "Baja",
    monthlyFee: Number(subscription?.monthly_fee ?? 0),
    onboardedAt: row.onboarded_at,
    publicLeaderboardName: row.public_leaderboard_name
  };
}

function mapMetric(row: Row): MonthlyMetric {
  return {
    id: row.id,
    clientId: row.client_id,
    month: Number(row.month),
    year: Number(row.year),
    reach: Number(row.reach ?? 0),
    impressions: Number(row.impressions ?? 0),
    profileVisits: Number(row.profile_visits ?? 0),
    websiteClicks: Number(row.website_clicks ?? 0),
    calls: Number(row.calls ?? 0),
    whatsappClicks: Number(row.whatsapp_clicks ?? 0),
    messages: Number(row.messages ?? 0),
    leads: Number(row.leads ?? 0),
    bookings: Number(row.bookings ?? 0),
    estimatedRevenue: Number(row.estimated_revenue ?? 0),
    realRevenue: row.real_revenue === null ? null : Number(row.real_revenue),
    adSpend: Number(row.ad_spend ?? 0),
    serviceFee: Number(row.service_fee ?? 0),
    extras: Number(row.extras ?? 0),
    totalInvestment: Number(row.total_investment ?? 0),
    estimatedRoi:
      row.estimated_roi === null ? null : Number(row.estimated_roi ?? 0),
    realRoi: row.real_roi === null ? null : Number(row.real_roi),
    roiMode: row.roi_mode,
    bestContentId: row.best_content_id,
    worstContentId: row.worst_content_id,
    summary: row.summary ?? "",
    diagnosis: row.diagnosis ?? "",
    nextMonthPlan: row.next_month_plan ?? ""
  };
}

function mapCampaign(row: Row): Campaign {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    platform: row.platform,
    objective: row.objective,
    budget: Number(row.budget ?? 0),
    spend: Number(row.spend ?? 0),
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    ctr: Number(row.ctr ?? 0),
    cpc: Number(row.cpc ?? 0),
    cpm: Number(row.cpm ?? 0),
    leads: Number(row.leads ?? 0),
    costPerLead: Number(row.cost_per_lead ?? 0),
    roas: row.roas === null ? null : Number(row.roas),
    visibleSummary: row.visible_summary ?? ""
  };
}

function mapContent(row: Row): ContentItem {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    type: row.type,
    platform: row.platform,
    publishDate: row.publish_date,
    status: row.status,
    url: row.url ?? "#",
    storagePath: row.storage_path,
    views: Number(row.views ?? 0),
    reach: Number(row.reach ?? 0),
    likes: Number(row.likes ?? 0),
    comments: Number(row.comments ?? 0),
    shares: Number(row.shares ?? 0),
    saves: Number(row.saves ?? 0),
    engagementRate: Number(row.engagement_rate ?? 0),
    performance: row.performance,
    reusable: Boolean(row.reusable),
    learning: row.learning ?? ""
  };
}

function mapReport(row: Row): Report {
  return {
    id: row.id,
    clientId: row.client_id,
    month: Number(row.month),
    year: Number(row.year),
    title: row.title,
    status: row.status,
    storagePath: row.storage_path,
    generatedAt: row.generated_at ?? row.created_at
  };
}

function mapInvoice(row: Row): Invoice {
  const items = Array.isArray(row.invoice_items) ? row.invoice_items : [];

  return {
    id: row.id,
    clientId: row.client_id,
    invoiceNumber: row.invoice_number,
    status: row.status,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    taxableBase: Number(row.taxable_base ?? 0),
    vatRate: Number(row.vat_rate ?? 0),
    withholdingRate: Number(row.withholding_rate ?? 0),
    total: Number(row.total ?? 0),
    paymentMethod: row.payment_method ?? "",
    publicNotes: row.public_notes ?? "",
    items: items.map(mapInvoiceItem)
  };
}

function mapInvoiceItem(row: Row): InvoiceItem {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity ?? 0),
    unitPrice: Number(row.unit_price ?? 0),
    total: Number(row.total ?? 0)
  };
}

function mapLeaderboard(row: Row, selectedClientId: string): LeaderboardEntry {
  return {
    id: row.id,
    clientId: row.client_id,
    category: row.category ?? row.leaderboards?.category ?? "Ranking",
    rank: Number(row.rank),
    displayName: row.display_name,
    metricLabel: row.metric_label,
    trend: Number(row.trend ?? 0),
    isCurrentClient: row.client_id === selectedClientId
  };
}

function mapScore(row: Row): ClientScore {
  return {
    clientId: row.client_id,
    score: Number(row.score ?? 0),
    level: row.level,
    levelName: row.level_name,
    punctualPayment: Number(row.punctual_payment ?? 0),
    approvalsSpeed: Number(row.approvals_speed ?? 0),
    collaboration: Number(row.collaboration ?? 0),
    profitability: Number(row.profitability ?? 0),
    growth: Number(row.growth ?? 0),
    churnRisk: Number(row.churn_risk ?? 0),
    communication: Number(row.communication ?? 0),
    satisfaction: Number(row.satisfaction ?? 0),
    action: row.recommended_action ?? "",
    updatedAt: row.updated_at
  };
}

function mapAlert(row: Row): Alert {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    severity: row.severity,
    visibility: row.visibility,
    createdAt: row.created_at
  };
}

function mapTask(row: Row): Task {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    dueDate: row.due_date,
    status: row.status,
    visibleToClient: Boolean(row.visible_to_client)
  };
}

export { getLatestMetric, getPreviousMetric };
