import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type DbRow = Record<string, unknown>;

export type ConnectedAssetInput = {
  provider: string;
  assetType: string;
  externalId: string;
  name: string;
  username?: string | null;
  parentExternalId?: string | null;
  status?: "active" | "inactive" | "disconnected" | "error";
  isSelected?: boolean;
  metadata?: DbRow;
};

export type SyncLog = {
  id: string;
};

export async function getIntegration(
  db: SupabaseClient,
  provider: string,
  clientId: string
) {
  const { data, error } = await db
    .from("integrations")
    .select("*")
    .eq("provider", provider)
    .eq("client_id", clientId)
    .maybeSingle<DbRow>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getConnectedIntegrations(
  db: SupabaseClient,
  provider: string
) {
  const { data, error } = await db
    .from("integrations")
    .select("*")
    .eq("provider", provider)
    .eq("status", "connected");

  if (error) {
    throw error;
  }

  return (data ?? []) as DbRow[];
}

export async function upsertConnectedAssets({
  db,
  clientId,
  integrationId,
  assets
}: {
  db: SupabaseClient;
  clientId: string;
  integrationId: string;
  assets: ConnectedAssetInput[];
}) {
  if (!assets.length) {
    return [];
  }

  const now = new Date().toISOString();
  const payload = assets.map((asset) => ({
    client_id: clientId,
    integration_id: integrationId,
    provider: asset.provider,
    asset_type: asset.assetType,
    external_id: asset.externalId,
    name: asset.name,
    username: asset.username ?? null,
    parent_external_id: asset.parentExternalId ?? null,
    status: asset.status ?? "active",
    is_selected: asset.isSelected ?? false,
    metadata: asset.metadata ?? {},
    last_synced_at: now,
    updated_at: now
  }));

  const { data, error } = await db
    .from("connected_assets")
    .upsert(payload, { onConflict: "provider,asset_type,external_id" })
    .select("*");

  if (error) {
    throw error;
  }

  return (data ?? []) as DbRow[];
}

export async function getSelectedAssets(
  db: SupabaseClient,
  clientId: string,
  provider: string,
  assetType?: string
) {
  let query = db
    .from("connected_assets")
    .select("*")
    .eq("client_id", clientId)
    .eq("provider", provider)
    .eq("is_selected", true)
    .eq("status", "active");

  if (assetType) {
    query = query.eq("asset_type", assetType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as DbRow[];
}

export async function createSyncLog({
  db,
  integrationId,
  clientId,
  provider
}: {
  db: SupabaseClient;
  integrationId?: string | null;
  clientId: string;
  provider: string;
}) {
  const { data, error } = await db
    .from("integration_sync_logs")
    .insert({
      integration_id: integrationId ?? null,
      client_id: clientId,
      provider,
      status: "started"
    })
    .select("id")
    .single<SyncLog>();

  if (error) {
    throw error;
  }

  return data;
}

export async function finishSyncLog({
  db,
  logId,
  status,
  recordsInserted = 0,
  recordsUpdated = 0,
  errorMessage
}: {
  db: SupabaseClient;
  logId: string;
  status: "success" | "error";
  recordsInserted?: number;
  recordsUpdated?: number;
  errorMessage?: string | null;
}) {
  const { error } = await db
    .from("integration_sync_logs")
    .update({
      status,
      records_inserted: recordsInserted,
      records_updated: recordsUpdated,
      error_message: errorMessage ?? null,
      finished_at: new Date().toISOString()
    })
    .eq("id", logId);

  if (error) {
    throw error;
  }
}

export function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function asDateString(value: unknown) {
  if (typeof value === "string" && value) {
    return value.slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}
