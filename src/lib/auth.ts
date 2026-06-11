import { redirect } from "next/navigation";
import { getStatsAdminSession } from "@/lib/server/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export type SessionProfile = {
  id: string;
  role: Role;
  clientId: string | null;
  fullName: string;
};

export async function getCurrentProfile() {
  const profile = await getCurrentProfileOrNull();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export async function getCurrentProfileOrNull(): Promise<SessionProfile | null> {
  const statsAdmin = await getStatsAdminSession();

  if (statsAdmin) {
    return {
      id: statsAdmin.id,
      role: statsAdmin.role,
      clientId: null,
      fullName: statsAdmin.fullName
    } satisfies SessionProfile;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, role, full_name, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.is_active && ["admin", "team", "sales", "viewer", "demo_viewer"].includes(profile.role)) {
    return {
      id: profile.user_id,
      role: profile.role as Role,
      clientId: null,
      fullName: profile.full_name ?? user.email ?? "Usuario"
    } satisfies SessionProfile;
  }

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_id, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!clientUser?.client_id) {
    return null;
  }

  return {
    id: user.id,
    role: "client",
    clientId: clientUser.client_id,
    fullName: user.user_metadata?.full_name ?? user.email ?? "Cliente"
  } satisfies SessionProfile;
}

export async function requireRole(role: Role) {
  const profile = await getCurrentProfile();

  if (profile.role !== role) {
    redirect(["admin", "sales", "viewer"].includes(profile.role) ? "/admin" : "/client");
  }

  return profile;
}

export async function requireInternalRole() {
  const profile = await getCurrentProfile();

  if (!["admin", "team", "sales", "viewer"].includes(profile.role)) {
    redirect("/client");
  }

  return profile;
}

export async function requireAdminRole() {
  const profile = await getCurrentProfile();

  if (profile.role !== "admin") {
    redirect("/access-denied");
  }

  return profile;
}
