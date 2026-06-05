import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceEnv } from "@/lib/server/env";

let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase service client cannot be used in the browser");
  }

  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (!serviceClient) {
    serviceClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return serviceClient;
}
