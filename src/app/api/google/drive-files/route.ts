import { NextResponse } from "next/server";
import { listGoogleDriveFilesForClient } from "@/lib/integrations/google/workspaceService";
import { requireInternalRequest } from "@/lib/integrations/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalRequest({ allowViewer: true });
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  const folderId = url.searchParams.get("folderId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await listGoogleDriveFilesForClient({
        db: auth.profile.admin,
        clientId,
        folderId
      })
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo listar Drive" },
      { status: 500 }
    );
  }
}
