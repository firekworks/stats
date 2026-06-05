import "server-only";

import { NextResponse } from "next/server";
import { canAccessClient, getRequestProfile } from "@/lib/api-auth";
import type { RequestProfile } from "@/lib/api-auth";
import type { Role } from "@/lib/types";

const writeRoles = new Set<Role>(["admin", "sales"]);

export type InternalAuthResult =
  | { profile: RequestProfile }
  | { response: NextResponse };

export async function requireInternalRequest({
  allowViewer = false
}: {
  allowViewer?: boolean;
} = {}): Promise<InternalAuthResult> {
  const profile = await getRequestProfile();

  if (!profile) {
    return {
      response: NextResponse.json({ error: "Sesion interna requerida" }, { status: 401 })
    };
  }

  const allowed = allowViewer ? profile.isInternal : writeRoles.has(profile.role);

  if (!allowed) {
    return {
      response: NextResponse.json(
        { error: allowViewer ? "Rol interno requerido" : "Rol admin o ventas requerido" },
        { status: 403 }
      )
    };
  }

  return { profile };
}

export function requireClientAccess(profile: RequestProfile, clientId: string) {
  if (!canAccessClient(profile, clientId)) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  return null;
}

export function missingEnvResponse(missing: string[]) {
  return NextResponse.json(
    {
      error: "Configuracion incompleta",
      missing
    },
    { status: 503 }
  );
}

export function okJson<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}
