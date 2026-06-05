import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdminClient>>;

export type RequestProfile = {
  admin: AdminClient;
  userId: string;
  role: Role;
  clientId: string | null;
  isInternal: boolean;
};

export async function getRequestProfile(): Promise<RequestProfile | null> {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return null;
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return null;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_active) {
    return null;
  }

  const role = profile.role as Role;
  const isInternal = ["admin", "sales", "viewer"].includes(role);

  if (isInternal) {
    return { admin, userId: user.id, role, clientId: null, isInternal };
  }

  if (role !== "client") {
    return null;
  }

  const { data: clientUser } = await admin
    .from("client_users")
    .select("client_id, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!clientUser?.client_id) {
    return null;
  }

  return {
    admin,
    userId: user.id,
    role,
    clientId: clientUser.client_id as string,
    isInternal: false
  };
}

export function canAccessClient(profile: RequestProfile, clientId: string) {
  return profile.isInternal || profile.clientId === clientId;
}
