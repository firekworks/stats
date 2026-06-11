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

export type IntegrationEnvGroup = {
  id: string;
  title: string;
  description: string;
  required: string[];
  optional: string[];
  missing: string[];
  ready: boolean;
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

export function getIntegrationEnvChecklist(): IntegrationEnvGroup[] {
  return [
    envGroup({
      id: "google-calendar",
      title: "Google Calendar",
      description: "OAuth, calendar.events y creación server-side de eventos.",
      required: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "ENCRYPTION_KEY"],
      optional: ["GOOGLE_CALENDAR_ID"]
    }),
    envGroup({
      id: "google-drive",
      title: "Google Drive",
      description: "Lectura de carpetas por cliente y enlace manual como fallback.",
      required: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI", "ENCRYPTION_KEY"],
      optional: ["GOOGLE_DRIVE_ROOT_FOLDER_ID"]
    }),
    envGroup({
      id: "canva",
      title: "Canva",
      description: "OAuth futuro; hoy se guardan enlaces manuales por cliente y pieza.",
      required: ["CANVA_CLIENT_ID", "CANVA_CLIENT_SECRET"],
      optional: ["CANVA_REDIRECT_URI"]
    }),
    envGroup({
      id: "meta",
      title: "Meta Ads + Instagram + Facebook",
      description: "OAuth Meta, selección de activos y sincronización de campañas/contenido.",
      required: ["META_APP_ID", "META_APP_SECRET", "META_GRAPH_VERSION", "NEXT_PUBLIC_APP_URL", "ENCRYPTION_KEY"],
      optional: ["META_BUSINESS_ID", "META_WEBHOOK_VERIFY_TOKEN"]
    }),
    envGroup({
      id: "whatsapp",
      title: "WhatsApp Cloud API",
      description: "Webhooks y eventos de mensajes para futuras métricas de conversación.",
      required: ["WHATSAPP_BUSINESS_ACCOUNT_ID", "WHATSAPP_WEBHOOK_VERIFY_TOKEN"],
      optional: ["WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN"]
    }),
    envGroup({
      id: "metricool",
      title: "Metricool",
      description: "Preparado como conector de lectura cuando se active la fuente externa.",
      required: ["METRICOOL_API_KEY"],
      optional: []
    }),
    envGroup({
      id: "generator",
      title: "Generador interno",
      description: "Playbooks locales activos; una clave IA permite mejorar copies más adelante.",
      required: [],
      optional: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],
      missing: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
        ? []
        : ["OPENAI_API_KEY o ANTHROPIC_API_KEY"],
      ready: true
    }),
    envGroup({
      id: "pdf",
      title: "PDFs e informes",
      description: "Facturas e informes se generan en backend sin exponer datos fiscales.",
      required: [],
      optional: ["NEXT_PUBLIC_APP_URL"]
    })
  ];
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

function envGroup(input: {
  id: string;
  title: string;
  description: string;
  required: string[];
  optional: string[];
  missing?: string[];
  ready?: boolean;
}): IntegrationEnvGroup {
  const missing = input.missing ?? input.required.filter((name) => !process.env[name]);

  return {
    ...input,
    missing,
    ready: input.ready ?? missing.length === 0
  };
}
