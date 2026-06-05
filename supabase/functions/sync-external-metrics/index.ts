import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

type SyncPayload = {
  client_id: string;
  provider:
    | "meta_ads"
    | "instagram_graph"
    | "facebook_pages"
    | "whatsapp_cloud"
    | "google_business_profile";
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Missing Supabase service configuration" }, 500);
  }

  const payload = (await request.json()) as SyncPayload;

  if (!payload.client_id || !payload.provider) {
    return json({ error: "client_id and provider are required" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data: integration, error } = await supabase
    .from("integrations")
    .select("id, status")
    .eq("client_id", payload.client_id)
    .eq("provider", payload.provider)
    .maybeSingle();

  if (error) {
    return json({ error: error.message }, 500);
  }

  if (!integration) {
    return json({ error: "Integration not configured" }, 404);
  }

  await supabase
    .from("integrations")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("id", integration.id);

  return json({
    ok: true,
    provider: payload.provider,
    status: integration.status,
    note: "External API calls must be implemented here or in server-only code using Vault-backed tokens."
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
