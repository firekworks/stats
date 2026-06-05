import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";

type Payload = {
  client_id: string;
  month: number;
  year: number;
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

  const payload = (await request.json()) as Payload;

  if (!payload.client_id || !payload.month || !payload.year) {
    return json({ error: "client_id, month and year are required" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data: metric, error: metricError } = await supabase
    .from("monthly_metrics")
    .select("id, client_id, month, year, summary")
    .eq("client_id", payload.client_id)
    .eq("month", payload.month)
    .eq("year", payload.year)
    .single();

  if (metricError) {
    return json({ error: metricError.message }, 404);
  }

  const storagePath = `${payload.client_id}/reports/${payload.year}-${String(
    payload.month
  ).padStart(2, "0")}.pdf`;

  await supabase.from("reports").upsert(
    {
      client_id: payload.client_id,
      month: payload.month,
      year: payload.year,
      title: `Informe mensual - ${payload.month}/${payload.year}`,
      status: "draft",
      storage_path: storagePath,
      generated_at: new Date().toISOString()
    },
    { onConflict: "client_id,month,year" }
  );

  return json({
    ok: true,
    metric_id: metric.id,
    storage_path: storagePath,
    note: "PDF rendering is handled by the Next.js route until the final template is moved to this Edge Function."
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
