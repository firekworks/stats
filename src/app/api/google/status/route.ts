import { getGoogleWorkspaceStatus } from "@/lib/integrations/google/workspaceService";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireInternalRequest({ allowViewer: true });
  if ("response" in auth) return auth.response;

  const { data: clients } = await auth.profile.admin
    .from("clients")
    .select("id")
    .order("created_at", { ascending: true });

  return Response.json(
    await getGoogleWorkspaceStatus(
      auth.profile.admin,
      (clients ?? []).map((client) => String(client.id))
    )
  );
}
