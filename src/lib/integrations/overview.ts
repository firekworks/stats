import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type IntegrationOverviewRow = {
  id: string;
  clientId: string;
  provider: string;
  status: string;
  externalAccountName: string | null;
  providerUserName: string | null;
  lastSyncAt: string | null;
  connectedAt: string | null;
  revokedAt: string | null;
  tokenExpiresAt: string | null;
  errorMessage: string | null;
};

export type ConnectedAssetOverviewRow = {
  id: string;
  clientId: string;
  provider: string;
  assetType: string;
  name: string;
  status: string;
  isSelected: boolean;
  lastSyncedAt: string | null;
};

type Row = Record<string, unknown>;

export async function getIntegrationOverview(clientIds: string[]) {
  const admin = getSupabaseAdminClient();

  if (!admin || !clientIds.length) {
    return {
      integrations: [] as IntegrationOverviewRow[],
      assets: [] as ConnectedAssetOverviewRow[]
    };
  }

  const [integrations, assets] = await Promise.all([
    admin
      .from("integrations")
      .select(
        "id, client_id, provider, status, external_account_name, provider_user_name, last_sync_at, connected_at, revoked_at, token_expires_at, error_message"
      )
      .in("client_id", clientIds)
      .order("provider", { ascending: true }),
    admin
      .from("connected_assets")
      .select("id, client_id, provider, asset_type, name, status, is_selected, last_synced_at")
      .in("client_id", clientIds)
      .order("provider", { ascending: true })
      .order("asset_type", { ascending: true })
      .order("name", { ascending: true })
  ]);

  return {
    integrations: ((integrations.data ?? []) as Row[]).map(mapIntegration),
    assets: ((assets.data ?? []) as Row[]).map(mapAsset)
  };
}

function mapIntegration(row: Row): IntegrationOverviewRow {
  return {
    id: string(row.id),
    clientId: string(row.client_id),
    provider: string(row.provider),
    status: string(row.status),
    externalAccountName: nullableString(row.external_account_name),
    providerUserName: nullableString(row.provider_user_name),
    lastSyncAt: nullableString(row.last_sync_at),
    connectedAt: nullableString(row.connected_at),
    revokedAt: nullableString(row.revoked_at),
    tokenExpiresAt: nullableString(row.token_expires_at),
    errorMessage: nullableString(row.error_message)
  };
}

function mapAsset(row: Row): ConnectedAssetOverviewRow {
  return {
    id: string(row.id),
    clientId: string(row.client_id),
    provider: string(row.provider),
    assetType: string(row.asset_type),
    name: string(row.name),
    status: string(row.status),
    isSelected: Boolean(row.is_selected),
    lastSyncedAt: nullableString(row.last_synced_at)
  };
}

function string(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
