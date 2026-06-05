import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseServiceEnv } from "@/lib/server/env";

export async function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseServiceEnv();
  const key = anonKey;

  if (!url || !key || key.startsWith("sb_secret_") || key.includes("service_role")) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Middleware refreshes them.
        }
      }
    }
  });
}

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase admin client cannot be used in the browser");
  }

  const { url, serviceRoleKey } = getSupabaseServiceEnv();

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return adminClient;
}
