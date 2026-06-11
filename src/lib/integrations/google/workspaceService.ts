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
  const accessToken = getAccessToken(integration);

  if (!accessToken) {
    return { files: [] as GoogleFile[], reason: "not_connected" as const };
  }

  const params = new URLSearchParams({
    q: `'${targetFolder}' in parents and trashed = false`,
    pageSize: "30",
    fields: "files(id,name,mimeType,webViewLink,modifiedTime,thumbnailLink)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true"
  });
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    }
  );
  const body = (await response.json().catch(() => ({}))) as {
    files?: Array<Partial<GoogleFile>>;
  };

  if (!response.ok) {
    return { files: [] as GoogleFile[], reason: "not_connected" as const };
  }

  return {
    files: (body.files ?? []).map((file) => ({
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

  const accessToken = getAccessToken(integration);

  if (!accessToken) {
    return { id: null, status: "not_connected" as const };
  }

  const calendarId = readServerEnv("GOOGLE_CALENDAR_ID") ?? "primary";
  const start = new Date(input.startAt);
  const end = input.endAt
    ? new Date(input.endAt)
    : new Date(start.getTime() + 60 * 60 * 1000);
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.notes ?? undefined,
        location: input.location ?? undefined,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() }
      }),
      cache: "no-store"
    }
  );
  const body = (await response.json().catch(() => ({}))) as { id?: string };

  return {
    id: response.ok ? body.id ?? null : null,
    status: response.ok ? ("created" as const) : ("not_connected" as const)
  };
}

function getAccessToken(integration: DbRow) {
  const encryptedAccess =
    typeof integration.access_token_encrypted === "string"
      ? integration.access_token_encrypted
      : null;

  return decryptToken(encryptedAccess);
}
