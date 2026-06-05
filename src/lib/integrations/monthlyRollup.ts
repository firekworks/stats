import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { asNumber, type DbRow } from "@/lib/integrations/store";

export async function recalculateMonthlyMetricsForClientMonth({
  db,
  clientId,
  month,
  year
}: {
  db: SupabaseClient;
  clientId: string;
  month: number;
  year: number;
}) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

  const [{ data: campaignMetrics, error: campaignError }, { data: contentMetrics, error: contentError }, { data: client }] =
    await Promise.all([
      db
        .from("campaign_metrics")
        .select("reach, impressions, clicks, leads, messages, spend")
        .eq("client_id", clientId)
        .gte("date", from)
        .lt("date", to),
      db
        .from("content_metrics")
        .select("reach, impressions, clicks, views")
        .eq("client_id", clientId)
        .gte("date", from)
        .lt("date", to),
      db
        .from("clients")
        .select("average_ticket, service_fee")
        .eq("id", clientId)
        .maybeSingle<DbRow>()
    ]);

  if (campaignError) {
    throw campaignError;
  }

  if (contentError) {
    throw contentError;
  }

  const campaigns = (campaignMetrics ?? []) as DbRow[];
  const content = (contentMetrics ?? []) as DbRow[];
  const adSpend = sum(campaigns, "spend");
  const serviceFee = asNumber(client?.service_fee);
  const leads = Math.round(sum(campaigns, "leads"));
  const estimatedRevenue = leads * asNumber(client?.average_ticket);
  const totalInvestment = adSpend + serviceFee;
  const estimatedRoi =
    estimatedRevenue > 0 && totalInvestment > 0
      ? Number((estimatedRevenue / totalInvestment).toFixed(4))
      : null;

  const payload = {
    client_id: clientId,
    month,
    year,
    reach: Math.round(sum(campaigns, "reach") + sum(content, "reach")),
    impressions: Math.round(
      sum(campaigns, "impressions") + sum(content, "impressions")
    ),
    clicks: Math.round(sum(campaigns, "clicks") + sum(content, "clicks")),
    leads,
    messages: Math.round(sum(campaigns, "messages")),
    ad_spend: Number(adSpend.toFixed(2)),
    service_fee: Number(serviceFee.toFixed(2)),
    estimated_revenue: Number(estimatedRevenue.toFixed(2)),
    estimated_roi: estimatedRoi,
    roi_type: estimatedRevenue > 0 ? "estimated" : "insufficient_data",
    data_status: "synced",
    calculated_at: new Date().toISOString(),
    source_summary: {
      campaign_metric_rows: campaigns.length,
      content_metric_rows: content.length
    },
    updated_at: new Date().toISOString()
  };

  const { error } = await db
    .from("monthly_metrics")
    .upsert(payload, { onConflict: "client_id,month,year" });

  if (error) {
    throw error;
  }

  return payload;
}

function sum(rows: DbRow[], key: string) {
  return rows.reduce((total, row) => total + asNumber(row[key]), 0);
}
