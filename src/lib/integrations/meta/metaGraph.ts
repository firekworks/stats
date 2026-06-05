import "server-only";

import { getMetaGraphBase } from "@/lib/integrations/meta/metaOAuth";
import type { DbRow } from "@/lib/integrations/store";
import type { MetaGraphList } from "@/lib/integrations/meta/metaTypes";

export class MetaApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "MetaApiError";
    this.status = status;
    this.code = code;
  }
}

export async function metaGraphGet<T extends DbRow>(
  path: string,
  accessToken: string,
  params: Record<string, string | number | boolean> = {}
) {
  const url = buildGraphUrl(path, params);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });
  const body = (await response.json().catch(() => ({}))) as DbRow & {
    error?: {
      message?: string;
      code?: string | number;
    };
  };

  if (!response.ok || body.error) {
    throw new MetaApiError(
      body.error?.message ?? `Meta Graph error ${response.status}`,
      response.status,
      body.error?.code ? String(body.error.code) : undefined
    );
  }

  return body as T;
}

export async function metaGraphList<T extends DbRow>(
  path: string,
  accessToken: string,
  params: Record<string, string | number | boolean> = {}
) {
  const first = await metaGraphGet<MetaGraphList<T>>(path, accessToken, params);
  const results = [...(first.data ?? [])];
  let next = first.paging?.next;

  while (next) {
    const response = await fetch(next, {
      method: "GET",
      cache: "no-store"
    });
    const body = (await response.json().catch(() => ({}))) as MetaGraphList<T> & {
      error?: { message?: string; code?: string | number };
    };

    if (!response.ok || body.error) {
      throw new MetaApiError(
        body.error?.message ?? `Meta Graph error ${response.status}`,
        response.status,
        body.error?.code ? String(body.error.code) : undefined
      );
    }

    results.push(...(body.data ?? []));
    next = body.paging?.next;
  }

  return results;
}

function buildGraphUrl(
  path: string,
  params: Record<string, string | number | boolean>
) {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(`${getMetaGraphBase()}/${normalizedPath}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url;
}
