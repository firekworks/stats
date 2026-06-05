import { NextResponse } from "next/server";
import { okJson, requireInternalRequest } from "@/lib/integrations/http";
import { runMetaAdsSync } from "@/lib/integrations/meta/metaAdsSync";
import { runMetaSocialSync } from "@/lib/integrations/meta/metaSocialSync";
import { syncMetaAssetsForIntegration } from "@/lib/integrations/meta/metaService";
import { META_PROVIDER } from "@/lib/integrations/meta/metaTypes";
import { getIntegration } from "@/lib/integrations/store";
import { getMissingServerEnv } from "@/lib/server/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SyncBody = {
  clientId?: string;
  mode?: "assets" | "ads" | "social" | "all";
};

export async function POST(request: Request) {
  const auth = await requireInternalRequest();
  if ("response" in auth) return auth.response;

  const body = (await request.json().catch(() => ({}))) as SyncBody;
  const mode = body.mode ?? "all";
  const missing = getMissingServerEnv(["META_GRAPH_VERSION", "ENCRYPTION_KEY"]);

  if (missing.length) {
    return NextResponse.json({ error: "Configuracion Meta incompleta", missing }, { status: 503 });
  }

  if (mode === "assets") {
    if (!body.clientId) {
      return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
    }

    const integration = await getIntegration(auth.profile.admin, META_PROVIDER, body.clientId);

    if (!integration) {
      return NextResponse.json({ error: "Integracion Meta no conectada" }, { status: 404 });
    }

    const result = await syncMetaAssetsForIntegration({
      db: auth.profile.admin,
      integration
    });

    return okJson(result);
  }

  const ads = mode === "ads" || mode === "all"
    ? await runMetaAdsSync(auth.profile.admin)
    : null;
  const social = mode === "social" || mode === "all"
    ? await runMetaSocialSync(auth.profile.admin)
    : null;

  return okJson({ ads, social });
}
