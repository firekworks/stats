import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { metaGraphGet, metaGraphList } from "@/lib/integrations/meta/metaGraph";
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

export async function runMetaSocialSync(db: SupabaseClient): Promise<MetaSyncResult> {
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
    const accessToken = decryptToken(asString(integration.access_token_encrypted));

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
      const instagramAssets = await getSelectedAssets(
        db,
        clientId,
        META_PROVIDER,
        "instagram_account"
      );
      const pageAssets = await getSelectedAssets(db, clientId, META_PROVIDER, "page");
      result.assetsChecked += instagramAssets.length + pageAssets.length;

      for (const asset of instagramAssets) {
        const counts = await syncInstagramAccount({
          db,
          clientId,
          integrationId,
          asset,
          accessToken
        });
        result.recordsInserted += counts.inserted;
        result.recordsUpdated += counts.updated;
      }

      for (const asset of pageAssets) {
        const counts = await syncFacebookPagePosts({
          db,
          clientId,
          integrationId,
          asset,
          accessToken
        });
        result.recordsInserted += counts.inserted;
        result.recordsUpdated += counts.updated;
      }

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

async function syncInstagramAccount({
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
  const accountId = asString(asset.external_id);
  const media = await metaGraphList<DbRow>(`${accountId}/media`, accessToken, {
    fields:
      "id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,like_count,comments_count",
    limit: 50
  });
  const counts = { inserted: 0, updated: 0 };
  const affectedMonths = new Set<string>();

  for (const item of media) {
    const content = await upsertContentItem({
      db,
      clientId,
      integrationId,
      asset,
      item,
      platform: "Instagram"
    });

    counts[content.created ? "inserted" : "updated"] += 1;

    const insights = await fetchInstagramInsights(asString(item.id), accessToken);

    if (Object.keys(insights).length) {
      const metric = await upsertContentMetric({
        db,
        clientId,
        contentId: content.id,
        entityId: asString(item.id),
        date: asDateString(item.timestamp),
        rawPayload: insights,
        values: {
          views: insights.views ?? insights.plays ?? 0,
          reach: insights.reach ?? 0,
          impressions: insights.impressions ?? 0,
          likes: asNumber(item.like_count) || insights.likes || 0,
          comments: asNumber(item.comments_count) || insights.comments || 0,
          shares: insights.shares ?? 0,
          saves: insights.saved ?? 0,
          plays: insights.plays ?? 0,
          total_interactions: insights.total_interactions ?? 0
        }
      });

      counts[metric.created ? "inserted" : "updated"] += 1;
      affectedMonths.add(monthKey(metric.date));
    }
  }

  for (const key of affectedMonths) {
    const [year, month] = key.split("-").map(Number);
    await recalculateMonthlyMetricsForClientMonth({ db, clientId, month, year });
  }

  return counts;
}

async function syncFacebookPagePosts({
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
  const pageId = asString(asset.external_id);
  const posts = await metaGraphList<DbRow>(`${pageId}/posts`, accessToken, {
    fields: "id,message,permalink_url,created_time,shares,likes.summary(true),comments.summary(true)",
    limit: 50
  });
  const counts = { inserted: 0, updated: 0 };
  const affectedMonths = new Set<string>();

  for (const post of posts) {
    const content = await upsertContentItem({
      db,
      clientId,
      integrationId,
      asset,
      item: post,
      platform: "Facebook"
    });

    counts[content.created ? "inserted" : "updated"] += 1;

    const metric = await upsertContentMetric({
      db,
      clientId,
      contentId: content.id,
      entityId: asString(post.id),
      date: asDateString(post.created_time),
      rawPayload: post,
      values: {
        likes: summaryTotal(post.likes),
        comments: summaryTotal(post.comments),
        shares: asNumber((post.shares as DbRow | undefined)?.count)
      }
    });

    counts[metric.created ? "inserted" : "updated"] += 1;
    affectedMonths.add(monthKey(metric.date));
  }

  for (const key of affectedMonths) {
    const [year, month] = key.split("-").map(Number);
    await recalculateMonthlyMetricsForClientMonth({ db, clientId, month, year });
  }

  return counts;
}

async function fetchInstagramInsights(mediaId: string, accessToken: string) {
  if (!mediaId) {
    return {};
  }

  try {
    const response = await metaGraphGet<{ data?: DbRow[] }>(
      `${mediaId}/insights`,
      accessToken,
      {
        metric:
          "impressions,reach,saved,shares,comments,likes,plays,total_interactions,views"
      }
    );

    return (response.data ?? []).reduce<Record<string, number>>((accumulator, row) => {
      const name = asString(row.name);
      const valueRows = Array.isArray(row.values) ? (row.values as DbRow[]) : [];
      const latest = valueRows[valueRows.length - 1];

      if (name && latest) {
        accumulator[name] = asNumber(latest.value);
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

async function upsertContentItem({
  db,
  clientId,
  integrationId,
  asset,
  item,
  platform
}: {
  db: SupabaseClient;
  clientId: string;
  integrationId: string;
  asset: DbRow;
  item: DbRow;
  platform: "Instagram" | "Facebook";
}) {
  const externalId = asString(item.id);
  const now = new Date().toISOString();
  const permalink = asString(item.permalink) || asString(item.permalink_url);
  const payload = {
    client_id: clientId,
    integration_id: integrationId,
    connected_asset_id: asString(asset.id) || null,
    provider: META_PROVIDER,
    external_id: externalId,
    external_media_id: externalId,
    external_account_id: asString(asset.external_id),
    type: mapContentType(item),
    platform,
    title: titleForContent(item),
    caption: asString(item.caption) || asString(item.message) || null,
    status: "published",
    published_at: asString(item.timestamp) || asString(item.created_time) || null,
    url: permalink || null,
    external_permalink: permalink || null,
    media_type: asString(item.media_type) || null,
    thumbnail_url: asString(item.thumbnail_url) || null,
    source: "meta",
    sync_status: "synced",
    lifecycle_status: "published",
    raw_payload: item,
    last_synced_at: now,
    updated_at: now
  };

  const { data: existing, error: existingError } = await db
    .from("content_items")
    .select("id")
    .eq("client_id", clientId)
    .eq("provider", META_PROVIDER)
    .eq("external_id", externalId)
    .maybeSingle<DbRow>();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await db.from("content_items").update(payload).eq("id", existing.id);
    if (error) throw error;
    return { id: asString(existing.id), created: false };
  }

  const { data, error } = await db.from("content_items").insert(payload).select("id").single<DbRow>();
  if (error) throw error;
  return { id: asString(data.id), created: true };
}

async function upsertContentMetric({
  db,
  clientId,
  contentId,
  entityId,
  date,
  values,
  rawPayload
}: {
  db: SupabaseClient;
  clientId: string;
  contentId: string;
  entityId: string;
  date: string;
  values: Record<string, number>;
  rawPayload: DbRow | Record<string, number>;
}) {
  const payload = {
    content_id: contentId,
    client_id: clientId,
    date,
    provider: META_PROVIDER,
    entity_type: "content",
    entity_id: entityId,
    views: Math.round(values.views ?? 0),
    reach: Math.round(values.reach ?? 0),
    impressions: Math.round(values.impressions ?? 0),
    likes: Math.round(values.likes ?? 0),
    comments: Math.round(values.comments ?? 0),
    shares: Math.round(values.shares ?? 0),
    saves: Math.round(values.saves ?? 0),
    clicks: Math.round(values.clicks ?? 0),
    plays: Math.round(values.plays ?? 0),
    total_interactions: Math.round(values.total_interactions ?? 0),
    engagement_rate: engagementRate(values),
    source: "meta",
    raw_payload: rawPayload,
    last_synced_at: new Date().toISOString()
  };

  const { data: existing, error: existingError } = await db
    .from("content_metrics")
    .select("id")
    .eq("client_id", clientId)
    .eq("provider", META_PROVIDER)
    .eq("entity_type", "content")
    .eq("entity_id", entityId)
    .eq("date", date)
    .maybeSingle<DbRow>();

  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await db.from("content_metrics").update(payload).eq("id", existing.id);
    if (error) throw error;
    return { id: asString(existing.id), date, created: false };
  }

  const { data, error } = await db.from("content_metrics").insert(payload).select("id").single<DbRow>();
  if (error) throw error;
  return { id: asString(data.id), date, created: true };
}

function mapContentType(item: DbRow) {
  const product = asString(item.media_product_type);
  const type = asString(item.media_type);

  if (product === "REELS") return "Reel";
  if (type === "CAROUSEL_ALBUM") return "Carrusel";
  if (type === "VIDEO") return "Video";
  if (type === "IMAGE") return "Post";
  return "Post";
}

function titleForContent(item: DbRow) {
  const text = asString(item.caption) || asString(item.message);
  return text ? text.slice(0, 90) : `Contenido ${asString(item.id)}`;
}

function summaryTotal(value: unknown) {
  const row = value && typeof value === "object" ? (value as DbRow) : null;
  const summary = row?.summary as DbRow | undefined;
  return asNumber(summary?.total_count);
}

function engagementRate(values: Record<string, number>) {
  const interactions =
    (values.likes ?? 0) +
    (values.comments ?? 0) +
    (values.shares ?? 0) +
    (values.saves ?? 0);
  const denominator = values.reach || values.impressions || values.views || 0;
  return denominator > 0 ? Number(((interactions / denominator) * 100).toFixed(2)) : 0;
}

function monthKey(date: string) {
  return date.slice(0, 7);
}
