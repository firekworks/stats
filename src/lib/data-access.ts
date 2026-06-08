import {
  getAllDemoData,
  getDemoPortalData,
  getDemoPortalDataBySlug as getFallbackDemoPortalDataBySlug
} from "@/lib/demo-data";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Alert,
  Campaign,
  CalendarEvent,
  Client,
  ClientScore,
  ConnectedAsset,
  ContentItem,
  IntegrationStatus,
  IntegrationSyncLog,
  Invoice,
  InvoiceItem,
  LeadEvent,
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
  const admin = getSupabaseAdminClient();

  if (!supabase || !clientId) {
    return getFallbackPortalData(clientId);
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
      .from("client_profile_view")
      .select("*")
      .eq("id", clientId),
    supabase
      .from("client_dashboard_view")
      .select("*")
      .eq("client_id", clientId)
      .not("month", "is", null)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
    supabase.from("client_campaigns_view").select("*").eq("client_id", clientId),
    supabase.from("client_content_view").select("*").eq("client_id", clientId),
    supabase.from("client_reports_view").select("*").eq("client_id", clientId),
    supabase
      .from("client_invoices_view")
      .select("*")
      .eq("client_id", clientId),
    supabase.from("client_leaderboard_view").select("*"),
    supabase.from("client_score_public_view").select("*").eq("client_id", clientId),
    supabase
      .from("client_alerts_public_view")
      .select("*")
      .eq("client_id", clientId),
    supabase
      .from("client_tasks_public_view")
      .select("*")
      .eq("client_id", clientId)
  ]);

  if (clients.error || !clients.data?.[0]) {
    return getFallbackPortalData(clientId);
  }

  const supplemental = await getSupplementalRows(admin, [clientId]);

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
    tasks: tasks.data ?? [],
    ...supplemental
  });
}

export async function getAdminPortalData(): Promise<PortalData> {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase) {
    return getFallbackPortalData();
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
    supabase.from("clients").select("*, client_subscriptions(monthly_fee, plans(name))"),
    supabase.from("monthly_metrics").select("*"),
    supabase.from("campaigns").select("*"),
    supabase.from("content_items").select("*"),
    supabase.from("monthly_reports").select("*"),
    supabase.from("invoices").select("*, invoice_items(*)"),
    supabase.from("leaderboard_entries").select("*, leaderboards(name, metric)"),
    supabase.from("client_scores").select("*"),
    supabase.from("alerts").select("*"),
    supabase.from("tasks").select("*")
  ]);

  if (clients.error || !clients.data?.length) {
    return getFallbackPortalData();
  }

  const clientIds = clients.data.map((client) => String(client.id));
  const supplemental = await getSupplementalRows(admin ?? supabase, clientIds);

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
    tasks: tasks.data ?? [],
    ...supplemental
  });
}

export async function getDemoPortalDataBySlug(slug: string): Promise<PortalData | null> {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return getFallbackDemoPortalDataBySlug(slug);
  }

  const { data: client } = await admin
    .from("clients")
    .select("*, client_subscriptions(monthly_fee, plans(name))")
    .eq("slug", slug)
    .eq("is_demo", true)
    .maybeSingle<Row>();

  if (!client) {
    return getFallbackDemoPortalDataBySlug(slug);
  }

  const clientId = String(client.id);
  const [
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
    admin
      .from("monthly_metrics")
      .select("*")
      .eq("client_id", clientId)
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
    admin.from("campaigns").select("*").eq("client_id", clientId),
    admin.from("content_items").select("*").eq("client_id", clientId),
    admin.from("monthly_reports").select("*").eq("client_id", clientId),
    admin.from("invoices").select("*, invoice_items(*)").eq("client_id", clientId),
    admin.from("leaderboard_entries").select("*, leaderboards(name, metric)"),
    admin.from("client_scores").select("*").eq("client_id", clientId),
    admin.from("alerts").select("*").eq("client_id", clientId),
    admin.from("tasks").select("*").eq("client_id", clientId)
  ]);
  const supplemental = await getSupplementalRows(admin, [clientId]);

  return makePortalData({
    clients: [client],
    selectedClientId: clientId,
    metrics: metrics.data ?? [],
    campaigns: campaigns.data ?? [],
    content: content.data ?? [],
    reports: reports.data ?? [],
    invoices: invoices.data ?? [],
    leaderboards: leaderboards.data ?? [],
    scores: scores.data ?? [],
    alerts: alerts.data ?? [],
    tasks: tasks.data ?? [],
    ...supplemental
  });
}

async function getSupplementalRows(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>> | ReturnType<typeof getSupabaseAdminClient>,
  clientIds: string[]
) {
  const empty = {
    campaignMetrics: [] as Row[],
    contentMetrics: [] as Row[],
    integrations: [] as Row[],
    connectedAssets: [] as Row[],
    syncLogs: [] as Row[],
    leadEvents: [] as Row[],
    calendarEvents: [] as Row[]
  };

  if (!supabase || !clientIds.length) {
    return empty;
  }

  const [
    campaignMetrics,
    contentMetrics,
    integrations,
    connectedAssets,
    syncLogs,
    leadEvents,
    calendarEvents
  ] = await Promise.all([
    supabase
      .from("campaign_metrics")
      .select("*")
      .in("client_id", clientIds)
      .order("date", { ascending: false }),
    supabase
      .from("content_metrics")
      .select("*")
      .in("client_id", clientIds)
      .order("date", { ascending: false }),
    supabase
      .from("integrations")
      .select(
        "id, client_id, provider, status, external_account_name, provider_user_name, last_sync_at, error_message"
      )
      .in("client_id", clientIds),
    supabase
      .from("connected_assets")
      .select(
        "id, client_id, provider, asset_type, external_id, name, status, is_selected, last_synced_at"
      )
      .in("client_id", clientIds),
    supabase
      .from("integration_sync_logs")
      .select(
        "id, client_id, provider, status, records_inserted, records_updated, started_at, finished_at, error_message"
      )
      .in("client_id", clientIds)
      .order("started_at", { ascending: false })
      .limit(80),
    supabase
      .from("lead_events")
      .select(
        "id, client_id, provider, channel, campaign_id, content_item_id, contact_name, occurred_at, created_at"
      )
      .in("client_id", clientIds)
      .order("occurred_at", { ascending: false })
      .limit(80),
    supabase
      .from("calendar_events")
      .select("*")
      .or(`client_id.in.(${clientIds.join(",")}),client_id.is.null`)
      .order("start_at", { ascending: true })
      .limit(80)
  ]);

  return {
    campaignMetrics: campaignMetrics.data ?? [],
    contentMetrics: contentMetrics.data ?? [],
    integrations: integrations.data ?? [],
    connectedAssets: connectedAssets.data ?? [],
    syncLogs: syncLogs.data ?? [],
    leadEvents: leadEvents.data ?? [],
    calendarEvents: calendarEvents.data ?? []
  };
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
  campaignMetrics?: Row[];
  contentMetrics?: Row[];
  integrations?: Row[];
  connectedAssets?: Row[];
  syncLogs?: Row[];
  leadEvents?: Row[];
  calendarEvents?: Row[];
}): PortalData {
  const clients = input.clients.map(mapClient);
  const selectedClient =
    clients.find((client) => client.id === input.selectedClientId) ?? clients[0];
  const campaignSummaries = summarizeCampaignMetrics(input.campaignMetrics ?? []);
  const contentSummaries = summarizeContentMetrics(input.contentMetrics ?? []);

  return {
    clients,
    selectedClient,
    metrics: input.metrics.map(mapMetric),
    campaigns: input.campaigns.map((row) =>
      mapCampaign(row, campaignSummaries.get(row.id))
    ),
    content: input.content.map((row) => mapContent(row, contentSummaries.get(row.id))),
    reports: input.reports.map(mapReport),
    invoices: input.invoices.map(mapInvoice),
    leaderboards: input.leaderboards.map((entry) =>
      mapLeaderboard(entry, selectedClient.id)
    ),
    scores: input.scores.map(mapScore),
    alerts: input.alerts.map(mapAlert),
    tasks: input.tasks.map(mapTask),
    calendarEvents: (input.calendarEvents ?? []).map(mapCalendarEvent),
    integrations: (input.integrations ?? []).map(mapIntegration),
    connectedAssets: (input.connectedAssets ?? []).map(mapConnectedAsset),
    syncLogs: (input.syncLogs ?? []).map(mapSyncLog),
    leadEvents: (input.leadEvents ?? []).map(mapLeadEvent)
  };
}

function mapClient(row: Row): Client {
  const subscription = Array.isArray(row.subscriptions)
    ? row.subscriptions[0]
    : Array.isArray(row.client_subscriptions)
      ? row.client_subscriptions[0]
      : undefined;
  const plan = Array.isArray(subscription?.plans)
    ? subscription.plans[0]
    : subscription?.plans;

  return {
    id: row.id,
    slug: row.slug ?? row.id,
    publicName: row.public_name ?? row.name,
    legalName: row.legal_name ?? row.billing_name ?? row.name,
    isDemo: Boolean(row.is_demo),
    demoLabel: row.demo_label ?? null,
    leadId: row.lead_id ?? null,
    source: row.source ?? null,
    taxId: row.tax_id ?? null,
    billingEmail: row.billing_email ?? null,
    billingAddress: row.billing_address ?? null,
    phone: row.phone ?? null,
    website: row.website ?? null,
    industry: row.industry ?? row.sector ?? "",
    status:
      row.status === "Baja"
        ? "churned"
        : row.status === "Pausado"
          ? "paused"
          : "active",
    city: row.city ?? "",
    logoUrl: row.logo_url ?? null,
    brandColors: Array.isArray(row.brand_colors) ? row.brand_colors : [],
    brandVoice: row.brand_voice ?? null,
    targetAudience: row.target_audience ?? null,
    objective: row.objective ?? null,
    services: Array.isArray(row.services) ? row.services : [],
    driveFolderId: row.drive_folder_id ?? null,
    convertedFromLead: Boolean(row.converted_from_lead),
    conversionDate: row.conversion_date ?? null,
    originalLeadScore:
      row.original_lead_score === null || typeof row.original_lead_score === "undefined"
        ? null
        : Number(row.original_lead_score),
    originalLeadCity: row.original_lead_city ?? null,
    originalLeadSector: row.original_lead_sector ?? null,
    averageTicket: Number(row.average_ticket ?? 0),
    allowPublicLeaderboardName: Boolean(
      row.allow_public_leaderboard_name ?? row.show_in_leaderboard
    ),
    planName: plan?.name ?? "Plan activo",
    planStatus:
      row.status === "active" || row.status === "Activo"
        ? "Activo"
        : row.status === "paused" || row.status === "Pausado"
          ? "Pausado"
          : "Baja",
    monthlyFee: Number(subscription?.monthly_fee ?? row.service_fee ?? 0),
    onboardedAt: row.onboarded_at,
    publicLeaderboardName:
      row.public_leaderboard_name ?? row.name ?? "Cliente local"
  };
}

function mapMetric(row: Row): MonthlyMetric {
  return {
    id: row.id ?? `${row.client_id}-${row.year}-${row.month}`,
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
    realRevenue:
      row.real_revenue === null || typeof row.real_revenue === "undefined"
        ? null
        : Number(row.real_revenue),
    adSpend: Number(row.ad_spend ?? 0),
    serviceFee: Number(row.service_fee ?? 0),
    extras: Number(row.extras ?? row.extra_costs ?? 0),
    totalInvestment: Number(
      row.total_investment ??
        Number(row.ad_spend ?? 0) +
          Number(row.service_fee ?? 0) +
          Number(row.extra_costs ?? row.extras ?? 0)
    ),
    estimatedRoi:
      row.estimated_roi === null ? null : Number(row.estimated_roi ?? 0),
    realRoi:
      row.real_roi === null || typeof row.real_roi === "undefined"
        ? null
        : Number(row.real_roi),
    roiMode: row.roi_mode ?? row.roi_type,
    bestContentId: row.best_content_id,
    worstContentId: row.worst_content_id,
    summary: row.summary ?? row.summary_client ?? "",
    diagnosis: row.diagnosis ?? row.diagnosis_client ?? "",
    nextMonthPlan: row.next_month_plan ?? row.next_month_plan_client ?? ""
  };
}

function mapCampaign(row: Row, summary?: CampaignMetricSummary): Campaign {
  const budget = Number(row.planned_budget ?? row.budget ?? 0);
  const spend = Number(row.real_spend ?? summary?.spend ?? row.spend ?? 0);
  const leads = Number(summary?.leads ?? row.leads ?? 0);

  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    platform: row.platform,
    objective: row.objective,
    campaignType: row.campaign_type ?? null,
    offer: row.offer ?? null,
    targetAudience: row.target_audience ?? null,
    funnelStage: row.funnel_stage ?? null,
    funnelStagePlan: row.funnel_stage_plan ?? null,
    recommendations: row.recommendations ?? null,
    launchChecklist: row.launch_checklist ?? null,
    isDemo: Boolean(row.is_demo),
    metricMode: row.metric_mode ?? null,
    budget,
    spend,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    impressions: Number(summary?.impressions ?? row.impressions ?? 0),
    reach: Number(summary?.reach ?? row.reach ?? 0),
    clicks: Number(summary?.clicks ?? row.clicks ?? 0),
    ctr: Number(summary?.ctr ?? row.ctr ?? 0),
    cpc: Number(summary?.cpc ?? row.cpc ?? 0),
    cpm: Number(summary?.cpm ?? row.cpm ?? 0),
    leads,
    messages: Number(summary?.messages ?? row.messages ?? 0),
    conversions: Number(summary?.conversions ?? row.conversions ?? 0),
    costPerLead: Number(summary?.costPerLead ?? row.cost_per_lead ?? 0),
    roas:
      row.roas === null || typeof row.roas === "undefined"
        ? null
        : Number(row.roas),
    visibleSummary: row.visible_summary ?? row.client_visible_summary ?? "",
    source: row.source ?? null,
    syncStatus: row.sync_status ?? null,
    metaAdAccountId: row.meta_ad_account_id ?? null,
    metaCampaignId: row.meta_campaign_id ?? null,
    metaAdsetId: row.meta_adset_id ?? null,
    metaAdId: row.meta_ad_id ?? null,
    externalCampaignId: row.external_campaign_id ?? row.external_id ?? null,
    externalAdAccountId: row.external_ad_account_id ?? row.external_account_id ?? null,
    plannedBudget: budget,
    realSpend: spend,
    servicePrice: Number(row.service_price ?? 0),
    internalPrice: Number(row.internal_price ?? 0),
    lifecycleStatus: row.lifecycle_status ?? null,
    lastSyncedAt: row.last_synced_at ?? null
  };
}

function mapContent(row: Row, summary?: ContentMetricSummary): ContentItem {
  return {
    id: row.id,
    clientId: row.client_id,
    campaignId: row.campaign_id ?? null,
    contentCode: row.content_code ?? null,
    title: row.title,
    type: row.type,
    platform: row.platform,
    objective: row.objective ?? null,
    funnelStage: row.funnel_stage ?? null,
    hook: row.hook ?? null,
    caption: row.caption ?? null,
    visualBrief: row.visual_brief ?? null,
    cta: row.cta ?? null,
    dueDate: row.due_date ?? null,
    publishDate: row.publish_date ?? row.published_at,
    status: row.status,
    url: row.url ?? "#",
    storagePath: row.storage_path,
    driveFolderId: row.drive_folder_id ?? null,
    googleDriveFolderId: row.google_drive_folder_id ?? null,
    canvaDesignId: row.canva_design_id ?? null,
    canvaEditUrl: row.canva_edit_url ?? null,
    canvaViewUrl: row.canva_view_url ?? null,
    metaPostId: row.meta_post_id ?? null,
    previewImageUrl: row.preview_image_url ?? null,
    previewData: row.preview_data ?? null,
    notes: row.notes ?? row.internal_notes ?? null,
    assignedTo: row.assigned_to ?? null,
    isDemo: Boolean(row.is_demo),
    views: Number(summary?.views ?? row.views ?? 0),
    reach: Number(summary?.reach ?? row.reach ?? 0),
    impressions: Number(summary?.impressions ?? row.impressions ?? 0),
    plays: Number(summary?.plays ?? row.plays ?? 0),
    likes: Number(summary?.likes ?? row.likes ?? 0),
    comments: Number(summary?.comments ?? row.comments ?? 0),
    shares: Number(summary?.shares ?? row.shares ?? 0),
    saves: Number(summary?.saves ?? row.saves ?? 0),
    clicks: Number(summary?.clicks ?? row.clicks ?? 0),
    engagementRate: Number(summary?.engagementRate ?? row.engagement_rate ?? 0),
    performance: row.performance ?? row.performance_label ?? "ok",
    reusable: Boolean(row.reusable),
    learning: row.learning ?? row.caption ?? "",
    source: row.source ?? null,
    syncStatus: row.sync_status ?? null,
    externalMediaId: row.external_media_id ?? row.external_id ?? null,
    externalAccountId: row.external_account_id ?? null,
    servicePrice: Number(row.service_price ?? 0),
    internalPrice: Number(row.internal_price ?? 0),
    lifecycleStatus: row.lifecycle_status ?? null,
    lastSyncedAt: row.last_synced_at ?? null
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
    storagePath: row.storage_path ?? row.pdf_storage_path,
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
    taxableBase: Number(row.taxable_base ?? row.subtotal ?? 0),
    vatRate: Number(row.vat_rate ?? row.tax_rate ?? 0),
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
    id: row.id ?? row.leaderboard_id,
    clientId: row.client_id,
    category: row.category ?? row.leaderboards?.category ?? row.leaderboards?.name ?? "Ranking",
    rank: Number(row.rank ?? row.position ?? 0),
    displayName: row.display_name,
    metricLabel: row.metric_label ?? String(row.value ?? ""),
    trend: Number(row.trend ?? row.value ?? 0),
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
    approvalsSpeed: Number(row.approvals_speed ?? row.approval_speed_score ?? 0),
    collaboration: Number(row.collaboration ?? row.ease_of_work_score ?? 0),
    profitability: Number(row.profitability ?? row.profitability_score ?? 0),
    growth: Number(row.growth ?? row.growth_potential_score ?? 0),
    churnRisk: Number(row.churn_risk ?? row.churn_risk_score ?? 0),
    communication: Number(row.communication ?? row.communication_score ?? 0),
    satisfaction: Number(row.satisfaction ?? row.perceived_satisfaction_score ?? 0),
    action: row.recommended_action ?? row.internal_recommendation ?? "",
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

function mapIntegration(row: Row): IntegrationStatus {
  return {
    id: row.id,
    clientId: row.client_id,
    provider: row.provider,
    status: row.status,
    externalAccountName: row.external_account_name ?? null,
    providerUserName: row.provider_user_name ?? null,
    lastSyncAt: row.last_sync_at ?? null,
    errorMessage: row.error_message ?? null
  };
}

function mapConnectedAsset(row: Row): ConnectedAsset {
  return {
    id: row.id,
    clientId: row.client_id,
    provider: row.provider,
    assetType: row.asset_type,
    externalId: row.external_id,
    name: row.name,
    status: row.status,
    isSelected: Boolean(row.is_selected),
    lastSyncedAt: row.last_synced_at ?? null
  };
}

function mapSyncLog(row: Row): IntegrationSyncLog {
  return {
    id: row.id,
    clientId: row.client_id,
    provider: row.provider,
    status: row.status,
    recordsInserted: Number(row.records_inserted ?? 0),
    recordsUpdated: Number(row.records_updated ?? 0),
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? null,
    errorMessage: row.error_message ?? null
  };
}

function mapLeadEvent(row: Row): LeadEvent {
  return {
    id: row.id,
    clientId: row.client_id,
    provider: row.provider,
    channel: row.channel,
    campaignId: row.campaign_id ?? null,
    contentItemId: row.content_item_id ?? null,
    contactName: row.contact_name ?? null,
    occurredAt: row.occurred_at,
    createdAt: row.created_at
  };
}

function mapCalendarEvent(row: Row): CalendarEvent {
  return {
    id: row.id,
    clientId: row.client_id ?? null,
    leadId: row.lead_id ?? null,
    campaignId: row.campaign_id ?? null,
    contentItemId: row.content_item_id ?? null,
    title: row.title,
    type: row.type,
    status: row.status,
    startAt: row.start_at,
    endAt: row.end_at ?? null,
    location: row.location ?? null,
    googleMapsUrl: row.google_maps_url ?? null,
    googleCalendarEventId: row.google_calendar_event_id ?? null,
    notes: row.notes ?? null,
    assignedTo: row.assigned_to ?? null,
    createdBy: row.created_by ?? null,
    isDemo: Boolean(row.is_demo)
  };
}

type CampaignMetricSummary = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  messages: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  costPerLead: number;
};

function summarizeCampaignMetrics(rows: Row[]) {
  const summaries = new Map<string, CampaignMetricSummary>();

  rows.forEach((row) => {
    const campaignId = row.campaign_id;
    if (!campaignId) return;

    const current =
      summaries.get(campaignId) ??
      {
        spend: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
        leads: 0,
        messages: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        costPerLead: 0
      };

    current.spend += Number(row.spend ?? 0);
    current.impressions += Number(row.impressions ?? 0);
    current.reach += Number(row.reach ?? 0);
    current.clicks += Number(row.clicks ?? 0);
    current.leads += Number(row.leads ?? 0);
    current.messages += Number(row.messages ?? 0);
    current.conversions += Number(row.conversions ?? 0);
    summaries.set(campaignId, current);
  });

  summaries.forEach((summary) => {
    summary.ctr =
      summary.impressions > 0 ? Number(((summary.clicks / summary.impressions) * 100).toFixed(2)) : 0;
    summary.cpc =
      summary.clicks > 0 ? Number((summary.spend / summary.clicks).toFixed(2)) : 0;
    summary.cpm =
      summary.impressions > 0 ? Number((summary.spend / (summary.impressions / 1000)).toFixed(2)) : 0;
    summary.costPerLead =
      summary.leads > 0 ? Number((summary.spend / summary.leads).toFixed(2)) : 0;
  });

  return summaries;
}

type ContentMetricSummary = {
  views: number;
  reach: number;
  impressions: number;
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
};

function summarizeContentMetrics(rows: Row[]) {
  const summaries = new Map<string, ContentMetricSummary>();

  rows.forEach((row) => {
    const contentId = row.content_id;
    if (!contentId) return;

    const current =
      summaries.get(contentId) ??
      {
        views: 0,
        reach: 0,
        impressions: 0,
        plays: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        clicks: 0,
        engagementRate: 0
      };

    current.views += Number(row.views ?? 0);
    current.reach += Number(row.reach ?? 0);
    current.impressions += Number(row.impressions ?? 0);
    current.plays += Number(row.plays ?? 0);
    current.likes += Number(row.likes ?? 0);
    current.comments += Number(row.comments ?? 0);
    current.shares += Number(row.shares ?? 0);
    current.saves += Number(row.saves ?? 0);
    current.clicks += Number(row.clicks ?? 0);
    summaries.set(contentId, current);
  });

  summaries.forEach((summary) => {
    const interactions =
      summary.likes + summary.comments + summary.shares + summary.saves;
    const denominator = summary.reach || summary.impressions || summary.views;
    summary.engagementRate =
      denominator > 0 ? Number(((interactions / denominator) * 100).toFixed(2)) : 0;
  });

  return summaries;
}

function getFallbackPortalData(clientId?: string): PortalData {
  if (isDemoModeEnabled()) {
    return clientId ? getDemoPortalData(clientId) : getAllDemoData();
  }

  return makeEmptyPortalData(clientId);
}

function makeEmptyPortalData(clientId = "no-client"): PortalData {
  const selectedClient: Client = {
    id: clientId,
    slug: "sin-cliente",
    publicName: "Sin cliente",
    legalName: "Sin cliente",
    leadId: null,
    source: null,
    taxId: null,
    billingEmail: null,
    billingAddress: null,
    phone: null,
    website: null,
    industry: "",
    status: "paused",
    city: "",
    averageTicket: 0,
    allowPublicLeaderboardName: false,
    planName: "Sin plan",
    planStatus: "Pausado",
    monthlyFee: 0,
    onboardedAt: new Date().toISOString(),
    publicLeaderboardName: "Sin cliente"
  };

  return {
    clients: clientId === "no-client" ? [] : [selectedClient],
    selectedClient,
    metrics: [],
    campaigns: [],
    content: [],
    reports: [],
    invoices: [],
    leaderboards: [],
    scores: [],
    alerts: [],
    tasks: [],
    calendarEvents: [],
    integrations: [],
    connectedAssets: [],
    syncLogs: [],
    leadEvents: []
  };
}

function isDemoModeEnabled() {
  return (
    process.env.STATS_DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_STATS_DEMO_MODE === "true"
  );
}
