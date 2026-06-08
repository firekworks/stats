import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/security/tokenCrypto";
import {
  getGoogleDriveRootFolderId,
  getGoogleMissingEnv,
  GOOGLE_BUSINESS_PROVIDER
} from "@/lib/integrations/google/googleService";
import { getIntegration, type DbRow } from "@/lib/integrations/store";
import { readServerEnv } from "@/lib/server/env";

type GoogleFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string | null;
  thumbnailLink?: string | null;
};

type CalendarInput = {
  title: string;
  startAt: string;
  endAt?: string | null;
  notes?: string | null;
  location?: string | null;
};

export function getGoogleWorkspaceMissingEnv() {
  return getGoogleMissingEnv();
}

export async function getGoogleWorkspaceStatus(db: SupabaseClient, clientIds: string[]) {
  if (!clientIds.length) {
    return {
      configured: getGoogleWorkspaceMissingEnv().length === 0,
      missing: getGoogleWorkspaceMissingEnv(),
      rootFolderId: getGoogleDriveRootFolderId(),
      connectedClients: 0
    };
  }

  const { data } = await db
    .from("integrations")
    .select("client_id, status, last_sync_at, connected_at, error_message")
    .eq("provider", GOOGLE_BUSINESS_PROVIDER)
    .in("client_id", clientIds);

  return {
    configured: getGoogleWorkspaceMissingEnv().length === 0,
    missing: getGoogleWorkspaceMissingEnv(),
    rootFolderId: getGoogleDriveRootFolderId(),
    connectedClients: (data ?? []).filter((row) => row.status === "connected").length,
    integrations: data ?? []
  };
}

export async function listGoogleDriveFilesForClient({
  db,
  clientId,
  folderId
}: {
  db: SupabaseClient;
  clientId: string;
  folderId?: string | null;
}) {
  const integration = await getIntegration(db, GOOGLE_BUSINESS_PROVIDER, clientId);

  if (!integration || integration.status !== "connected") {
    return { files: [] as GoogleFile[], reason: "not_connected" as const };
  }

  const targetFolder = folderId || getGoogleDriveRootFolderId();
  const client = await getOAuthClient(integration);
  const { google } = await import("googleapis");
  const drive = google.drive({ version: "v3", auth: client });
  const response = await drive.files.list({
    q: `'${targetFolder}' in parents and trashed = false`,
    pageSize: 30,
    fields: "files(id,name,mimeType,webViewLink,modifiedTime,thumbnailLink)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  return {
    files: (response.data.files ?? []).map((file) => ({
      id: file.id ?? "",
      name: file.name ?? "Archivo",
      mimeType: file.mimeType ?? "",
      webViewLink: file.webViewLink ?? "#",
      modifiedTime: file.modifiedTime ?? null,
      thumbnailLink: file.thumbnailLink ?? null
    })),
    reason: null
  };
}

export async function createGoogleCalendarEvent({
  db,
  clientId,
  input
}: {
  db: SupabaseClient;
  clientId: string;
  input: CalendarInput;
}) {
  const integration = await getIntegration(db, GOOGLE_BUSINESS_PROVIDER, clientId);

  if (!integration || integration.status !== "connected") {
    return { id: null, status: "not_connected" as const };
  }

  const client = await getOAuthClient(integration);
  const { google } = await import("googleapis");
  const calendar = google.calendar({ version: "v3", auth: client });
  const calendarId = readServerEnv("GOOGLE_CALENDAR_ID") ?? "primary";
  const start = new Date(input.startAt);
  const end = input.endAt
    ? new Date(input.endAt)
    : new Date(start.getTime() + 60 * 60 * 1000);
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: input.title,
      description: input.notes ?? undefined,
      location: input.location ?? undefined,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() }
    }
  });

  return { id: response.data.id ?? null, status: "created" as const };
}

async function getOAuthClient(integration: DbRow) {
  const { google } = await import("googleapis");
  const client = new google.auth.OAuth2(
    readServerEnv("GOOGLE_CLIENT_ID") ?? undefined,
    readServerEnv("GOOGLE_CLIENT_SECRET") ?? undefined,
    readServerEnv("GOOGLE_REDIRECT_URI") ?? undefined
  );
  const encryptedAccess =
    typeof integration.access_token_encrypted === "string"
      ? integration.access_token_encrypted
      : null;
  const encryptedRefresh =
    typeof integration.refresh_token_encrypted === "string"
      ? integration.refresh_token_encrypted
      : null;
  client.setCredentials({
    access_token: decryptToken(encryptedAccess) ?? undefined,
    refresh_token: decryptToken(encryptedRefresh) ?? undefined,
    expiry_date: integration.token_expires_at
      ? new Date(String(integration.token_expires_at)).getTime()
      : undefined
  });

  return client;
}
