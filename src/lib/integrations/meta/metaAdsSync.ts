import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { metaGraphList } from "@/lib/integrations/meta/metaGraph";
import { META_PROVIDER, type MetaSyncResult } from "@/lib/integrations/meta/metaTypes";
import { recalculateMonthlyMetricsForClientMonth } from "@/lib/integrations/monthlyRollup";
import {
  asDateString,
  asNumber,
  asString,
  createSyncLog,
  finishSyncLog,
  getConnectedIntegrations,
  getSelectedAssets,
  type DbRow
} from "@/lib/integrations/store";
import { decryptToken } from "@/lib/security/tokenCrypto";

export async function runMetaAdsSync(db: SupabaseClient): Promise<MetaSyncResult> {
  const integrations = await getConnectedIntegrations(db, META_PROVIDER);
  const result: MetaSyncResult = {
    integrationsChecked: integrations.length,
    assetsChecked: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    errors: []
  };

  for (const integration of integrations) {
    const clientId = asString(integration.client_id);
    const integrationId = asString(integration.id);
    const encryptedToken = asString(integration.access_token_encrypted);
    const accessToken = decryptToken(encryptedToken);

    if (!clientId || !integrationId || !accessToken) {
      result.errors.push("Integracion Meta sin token cifrado usable");
      continue;
    }

    const log = await createSyncLog({
      db,
      clientId,
      integrationId,
      provider: META_PROVIDER
    });

    try {
      const assets = await getSelectedAssets(db, clientId, META_PROVIDER, "ad_account");
      result.assetsChecked += assets.length;

      for (const asset of assets) {
        const syncCounts = await syncAdAccount({
          db,
          clientId,
          integrationId,
          asset,
          accessToken
        });

        result.recordsInserted += syncCounts.inserted;
        result.recordsUpdated += syncCounts.updated;
      }

      await db
        .from("integrations")
        .update({
          last_sync_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", integrationId);

      await finishSyncLog({
        db,
        logId: log.id,
        status: "success",
        recordsInserted: result.recordsInserted,
        recordsUpdated: result.recordsUpdated
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      result.errors.push(message);
      await finishSyncLog({
        db,
        logId: log.id,
        status: "error",
        errorMessage: message
      });
      await db
        .from("integrations")
        .update({ status: "error", error_message: message, updated_at: new Date().toISOString() })
        .eq("id", integrationId);
    }
  }

  return result;
}

async function syncAdAccount({
  db,
  clientId,
  integrationId,
  asset,
  accessToken
}: {
  db: SupabaseClient;
  clientId: string;
  integrationId: string;
  asset: DbRow;
  accessToken: string;
}) {
  const adAccountId = asString(asset.external_id);
  const campaigns = await metaGraphList<DbRow>(`${adAccountId}/campaigns`, accessToken, {
    fields:
      "id,name,status,objective,start_time,stop_time,daily_budget,lifetime_budget,account_id",
    limit: 100
  });
  const counts = { inserted: 0, updated: 0 };
  const affectedMonths = new Set<string>();

  for (const campaign of campaigns) {
    const localCampaign = await upsertCampaign({
      db,
      clientId,
      integrationId,
      asset,
      campaign
    });

    counts[localCampaign.created ? "inserted" : "updated"] += 1;

    const insights = await metaGraphList<DbRow>(`${asString(campaign.id)}/insights`, accessToken, {
      date_preset: "last_30d",
      fields:
        "campaign_id,date_start,date_stop,impressions,reach,clicks,spend,ctr,cpc,cpm,actions,inline_link_clicks,frequency",
      limit: 100
    });
    const campaignTotals = {
      spend: 0,
      leads: 0,
      messages: 0,
      conversions: 0
    };

    for (const insight of insights) {
      const actions = asActionMap(insight.actions);
      campaignTotals.spend += asNumber(insight.spend);
      campaignTotals.leads += extractLeads(actions);
      campaignTotals.messages += extractMessages(actions);
      campaignTotals.conversions += extractConversions(actions);

      const metric = await upsertCampaignMetric({
        db,
        clientId,
        campaignId: localCampaign.id,
        insight,
        actions
      });

      counts[metric.created ? "inserted" : "updated"] += 1;
      affectedMonths.add(monthKey(metric.date));
    }

    await db
      .from("campaigns")
      .update({
        spend: Number(campaignTotals.spend.toFixed(2)),
        real_spend: Number(campaignTotals.spend.toFixed(2)),
        lifecycle_status: campaignTotals.spend > 0 ? "active" : "planned",
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", localCampaign.id);
  }

  for (const key of affectedMonths) {
    const [year, month] = key.split("-").map(Number);
    await recalculateMonthlyMetricsForClientMonth({ db, clientId, month, year });
  }

  return counts;
}

async function upsertCampaign({
  db,
  clientId,
  integrationId,
  asset,
  campaign
}: {
  db: SupabaseClient;
  clientId: string;
  integrationId: string;
  asset: DbRow;
  campaign: DbRow;
}) {
  const externalId = asString(campaign.id);
  const now = new Date().toISOString();
  const payload = {
    client_id: clientId,
    integration_id: integrationId,
    connected_asset_id: asString(asset.id) || null,
    provider: META_PROVIDER,
    external_id: externalId,
    external_campaign_id: externalId,
    external_account_id: asString(asset.external_id),
    external_ad_account_id: asString(asset.external_id),
    name: asString(campaign.name) || `Meta campaign ${externalId}`,
    platform: "Meta Ads",
    objective: mapMetaObjective(asString(campaign.objective)),
    status: mapMetaCampaignStatus(asString(campaign.status)),
    start_date: asDateString(campaign.start_time),
    end_date: asString(campaign.stop_time) ? asDateString(campaign.stop_time) : null,
    budget: metaMoney(campaign.lifetime_budget) || metaMoney(campaign.daily_budget),
    planned_budget:
      metaMoney(campaign.lifetime_budget) || metaMoney(campaign.daily_budget),
    source: "meta",
    sync_status: "synced",
    lifecycle_status: mapLifecycleStatus(asString(campaign.status)),
    raw_payload: campaign,
    last_synced_at: now,
    updated_at: now
  };

  const existing = await findByExternal(db, "campaigns", clientId, externalId);

  if (existing?.id) {
    const { error } = await db.from("campaigns").update(payload).eq("id", existing.id);
    if (error) throw error;
    return { id: asString(existing.id), created: false };
  }

  const { data, error } = await db.from("campaigns").insert(payload).select("id").single<DbRow>();
  if (error) throw error;
  return { id: asString(data.id), created: true };
}

async function upsertCampaignMetric({
  db,
  clientId,
  campaignId,
  insight,
  actions
}: {
  db: SupabaseClient;
  clientId: string;
  campaignId: string;
  insight: DbRow;
  actions: Record<string, number>;
}) {
  const externalId = asString(insight.campaign_id);
  const date = asDateString(insight.date_stop ?? insight.date_start);
  const leads = extractLeads(actions);
  const messages = extractMessages(actions);
  const conversions = extractConversions(actions);
  const payload = {
    campaign_id: campaignId,
    client_id: clientId,
    date,
    provider: META_PROVIDER,
    entity_type: "campaign",
    entity_id: externalId,
    external_campaign_id: externalId,
    impressions: Math.round(asNumber(insight.impressions)),
    reach: Math.round(asNumber(insight.reach)),
    clicks: Math.round(asNumber(insight.clicks)),
    link_clicks: Math.round(asNumber(insight.inline_link_clicks)),
    inline_link_clicks: Math.round(asNumber(insight.inline_link_clicks)),
    leads: Math.round(leads),
    messages: Math.round(messages),
    conversions: Math.round(conversions),
    spend: Number(asNumber(insight.spend).toFixed(2)),
    ctr: asNumber(insight.ctr),
    cpc: asNumber(insight.cpc),
    cpm: asNumber(insight.cpm),
    cost_per_lead: costPerLead(insight.spend, leads),
    frequency: asNumber(insight.frequency) || null,
    actions,
    source: "meta",
    raw_payload: insight,
    last_synced_at: new Date().toISOString()
  };

  const { data: existing, error: existingError } = await db
    .from("campaign_metrics")
    .select("id")
    .eq("client_id", clientId)
    .eq("provider", META_PROVIDER)
    .eq("entity_type", "campaign")
    .eq("entity_id", externalId)
    .eq("date", date)
    .maybeSingle<DbRow>();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await db.from("campaign_metrics").update(payload).eq("id", existing.id);
    if (error) throw error;
    return { id: asString(existing.id), date, created: false };
  }

  const { data, error } = await db
    .from("campaign_metrics")
    .insert(payload)
    .select("id")
    .single<DbRow>();
  if (error) throw error;
  return { id: asString(data.id), date, created: true };
}

async function findByExternal(
  db: SupabaseClient,
  table: "campaigns",
  clientId: string,
  externalId: string
) {
  const { data, error } = await db
    .from(table)
    .select("id")
    .eq("client_id", clientId)
    .eq("provider", META_PROVIDER)
    .eq("external_id", externalId)
    .maybeSingle<DbRow>();

  if (error) throw error;
  return data;
}

function asActionMap(value: unknown) {
  const rows = Array.isArray(value) ? (value as DbRow[]) : [];
  return rows.reduce<Record<string, number>>((accumulator, item) => {
    const key = asString(item.action_type);
    if (key) {
      accumulator[key] = asNumber(item.value);
    }
    return accumulator;
  }, {});
}

function costPerLead(spend: unknown, leads: unknown) {
  const leadCount = asNumber(leads);
  return leadCount > 0 ? Number((asNumber(spend) / leadCount).toFixed(2)) : 0;
}

function metaMoney(value: unknown) {
  const amount = asNumber(value);
  return amount > 0 ? Number((amount / 100).toFixed(2)) : 0;
}

function mapMetaCampaignStatus(status: string) {
  if (status === "ACTIVE") return "active";
  if (status === "PAUSED") return "paused";
  if (status === "ARCHIVED" || status === "DELETED") return "cancelled";
  return "completed";
}

function mapLifecycleStatus(status: string) {
  if (status === "ACTIVE") return "active";
  if (status === "PAUSED") return "approved";
  if (status === "ARCHIVED" || status === "DELETED") return "reported";
  return "completed";
}

function mapMetaObjective(objective: string) {
  if (objective.includes("MESSAGES")) return "Mensajes";
  if (objective.includes("LEAD")) return "Leads";
  if (objective.includes("TRAFFIC")) return "Trafico";
  if (objective.includes("REACH") || objective.includes("AWARENESS")) {
    return "Reconocimiento";
  }
  return "Leads";
}

function extractLeads(actions: Record<string, number>) {
  return sumActions(actions, [
    "lead",
    "onsite_conversion.lead_grouped",
    "offsite_conversion.fb_pixel_lead",
    "onsite_web_lead",
    "onsite_conversion.lead"
  ]);
}

function extractMessages(actions: Record<string, number>) {
  return sumActions(actions, [
    "onsite_conversion.messaging_conversation_started_7d",
    "onsite_conversion_messaging_conversation_started_7d",
    "onsite_conversion.messaging_first_reply",
    "contact_total"
  ]);
}

function extractConversions(actions: Record<string, number>) {
  return sumActions(actions, [
    "purchase",
    "lead",
    "complete_registration",
    "schedule_total",
    "onsite_conversion.booking_request"
  ]);
}

function sumActions(actions: Record<string, number>, keys: string[]) {
  return keys.reduce((total, key) => total + (actions[key] ?? 0), 0);
}

function monthKey(date: string) {
  return date.slice(0, 7);
}
