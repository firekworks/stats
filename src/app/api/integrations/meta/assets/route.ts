import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  okJson,
  requireClientAccess,
  requireInternalRequest
} from "@/lib/integrations/http";
import { syncMetaAssetsForIntegration } from "@/lib/integrations/meta/metaService";
import { META_PROVIDER } from "@/lib/integrations/meta/metaTypes";
import { getIntegration, type DbRow } from "@/lib/integrations/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssetsBody = {
  clientId?: string;
  selectedAssetIds?: string[];
  refresh?: boolean;
};

export async function GET(request: Request) {
  const auth = await requireInternalRequest({ allowViewer: true });
  if ("response" in auth) return auth.response;

  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const denied = requireClientAccess(auth.profile, clientId);
  if (denied) return denied;

  return okJson(await loadAssets(auth.profile.admin, clientId));
}

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as AssetsBody;
  const clientId = body.clientId;

  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const denied = requireClientAccess(auth.profile, clientId);
  if (denied) return denied;

  const integration = await getIntegration(auth.profile.admin, META_PROVIDER, clientId);

  if (!integration) {
    return NextResponse.json({ error: "Integracion Meta no conectada" }, { status: 404 });
  }

  if (body.refresh) {
    await syncMetaAssetsForIntegration({
      db: auth.profile.admin,
      integration
    });
  }

  if (Array.isArray(body.selectedAssetIds)) {
    await auth.profile.admin
      .from("connected_assets")
      .update({ is_selected: false, updated_at: new Date().toISOString() })
      .eq("client_id", clientId)
      .eq("provider", META_PROVIDER);

    if (body.selectedAssetIds.length) {
      await auth.profile.admin
        .from("connected_assets")
        .update({ is_selected: true, updated_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .eq("provider", META_PROVIDER)
        .in("id", body.selectedAssetIds);
    }
  }

  return okJson(await loadAssets(auth.profile.admin, clientId));
}

async function loadAssets(db: SupabaseClient, clientId: string) {
  const { data: integration, error: integrationError } = await db
    .from("integrations")
    .select("id, client_id, provider, status, external_account_name, provider_user_name, last_sync_at, error_message")
    .eq("client_id", clientId)
    .eq("provider", META_PROVIDER)
    .maybeSingle<DbRow>();

  if (integrationError) {
    throw integrationError;
  }

  const { data: assets, error: assetsError } = await db
    .from("connected_assets")
    .select("id, provider, asset_type, external_id, name, username, status, is_selected, last_synced_at, metadata")
    .eq("client_id", clientId)
    .eq("provider", META_PROVIDER)
    .order("asset_type", { ascending: true })
    .order("name", { ascending: true });

  if (assetsError) {
    throw assetsError;
  }

  return {
    integration,
    assets: assets ?? []
  };
}
