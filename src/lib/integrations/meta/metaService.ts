import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { metaGraphGet, metaGraphList } from "@/lib/integrations/meta/metaGraph";
import {
  META_PROVIDER,
  type MetaAssetDiscovery,
  type MetaUser
} from "@/lib/integrations/meta/metaTypes";
import {
  asString,
  type ConnectedAssetInput,
  type DbRow,
  upsertConnectedAssets
} from "@/lib/integrations/store";
import { readServerEnv } from "@/lib/server/env";
import { decryptToken } from "@/lib/security/tokenCrypto";

export async function discoverMetaAssets(accessToken: string): Promise<MetaAssetDiscovery> {
  const assets = new Map<string, ConnectedAssetInput>();
  const user = await getMetaUser(accessToken);

  await collectAdAccounts(accessToken, assets);
  await collectBusinessAdAccounts(accessToken, assets);
  await collectPagesAndInstagram(accessToken, assets);

  return {
    assets: [...assets.values()],
    user
  };
}

export async function syncMetaAssetsForIntegration({
  db,
  integration
}: {
  db: SupabaseClient;
  integration: DbRow;
}) {
  const accessToken = decryptToken(asString(integration.access_token_encrypted));
  const clientId = asString(integration.client_id);
  const integrationId = asString(integration.id);

  if (!accessToken || !clientId || !integrationId) {
    throw new Error("La integracion Meta no tiene token cifrado usable");
  }

  const discovery = await discoverMetaAssets(accessToken);
  const storedAssets = await upsertConnectedAssets({
    db,
    clientId,
    integrationId,
    assets: discovery.assets
  });

  const { error } = await db
    .from("integrations")
    .update({
      provider_user_id: discovery.user?.id ?? null,
      provider_user_name: discovery.user?.name ?? null,
      external_account_id: discovery.user?.id ?? null,
      external_account_name: discovery.user?.name ?? null,
      last_sync_at: new Date().toISOString(),
      error_message: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", integrationId);

  if (error) {
    throw error;
  }

  return {
    assets: storedAssets,
    user: discovery.user
  };
}

async function getMetaUser(accessToken: string): Promise<MetaUser | null> {
  try {
    const row = await metaGraphGet<DbRow>("me", accessToken, {
      fields: "id,name"
    });

    return {
      id: asString(row.id),
      name: asString(row.name) || undefined
    };
  } catch {
    return null;
  }
}

async function collectAdAccounts(
  accessToken: string,
  assets: Map<string, ConnectedAssetInput>
) {
  try {
    const rows = await metaGraphList<DbRow>("me/adaccounts", accessToken, {
      fields: "id,name,account_id,account_status,currency,timezone_name,business"
    });

    rows.forEach((row) => {
      const externalId = asString(row.id);
      if (!externalId) return;

      setAsset(assets, {
        provider: META_PROVIDER,
        assetType: "ad_account",
        externalId,
        name: asString(row.name) || externalId,
        status: accountStatus(row.account_status),
        metadata: sanitizeMetaPayload(row)
      });
    });
  } catch {
    // Missing read permissions for a subset of assets should not block OAuth.
  }
}

async function collectBusinessAdAccounts(
  accessToken: string,
  assets: Map<string, ConnectedAssetInput>
) {
  const businessId = readServerEnv("META_BUSINESS_ID");

  if (!businessId) {
    return;
  }

  try {
    const rows = await metaGraphList<DbRow>(
      `${businessId}/owned_ad_accounts`,
      accessToken,
      {
        fields: "id,name,account_id,account_status,currency,timezone_name"
      }
    );

    rows.forEach((row) => {
      const externalId = asString(row.id);
      if (!externalId) return;

      setAsset(assets, {
        provider: META_PROVIDER,
        assetType: "ad_account",
        externalId,
        name: asString(row.name) || externalId,
        status: accountStatus(row.account_status),
        metadata: {
          ...sanitizeMetaPayload(row),
          source: "business"
        }
      });
    });
  } catch {
    // The app can run without business_management permission.
  }
}

async function collectPagesAndInstagram(
  accessToken: string,
  assets: Map<string, ConnectedAssetInput>
) {
  try {
    const rows = await metaGraphList<DbRow>("me/accounts", accessToken, {
      fields:
        "id,name,username,category,instagram_business_account{id,username,name,profile_picture_url},connected_instagram_account{id,username}"
    });

    rows.forEach((row) => {
      const pageId = asString(row.id);
      if (!pageId) return;

      setAsset(assets, {
        provider: META_PROVIDER,
        assetType: "page",
        externalId: pageId,
        name: asString(row.name) || pageId,
        username: asString(row.username) || null,
        metadata: sanitizeMetaPayload(row)
      });

      const instagramBusiness = asObject(row.instagram_business_account);
      const connectedInstagram = asObject(row.connected_instagram_account);
      const instagram = instagramBusiness ?? connectedInstagram;
      const instagramId = instagram ? asString(instagram.id) : "";

      if (instagramId) {
        setAsset(assets, {
          provider: META_PROVIDER,
          assetType: "instagram_account",
          externalId: instagramId,
          name: asString(instagram?.name) || asString(instagram?.username) || instagramId,
          username: asString(instagram?.username) || null,
          parentExternalId: pageId,
          metadata: sanitizeMetaPayload(instagram)
        });
      }
    });
  } catch {
    // Pages/Instagram are optional until permissions are granted.
  }
}

function setAsset(
  assets: Map<string, ConnectedAssetInput>,
  asset: ConnectedAssetInput
) {
  assets.set(`${asset.provider}:${asset.assetType}:${asset.externalId}`, asset);
}

function accountStatus(status: unknown): ConnectedAssetInput["status"] {
  return Number(status) === 1 ? "active" : "inactive";
}

function asObject(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as DbRow;
  }

  return null;
}

function sanitizeMetaPayload(row: DbRow | null) {
  if (!row) {
    return {};
  }

  const { access_token: _accessToken, ...safe } = row;
  void _accessToken;
  return safe;
}
