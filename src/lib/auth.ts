import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export type SessionProfile = {
  id: string;
  role: Role;
  clientId: string | null;
  fullName: string;
};

const demoProfiles: Record<"admin" | "client", SessionProfile> = {
  admin: {
    id: "demo-admin",
    role: "admin",
    clientId: null,
    fullName: "Firekworks Admin"
  },
  client: {
    id: "demo-client",
    role: "client",
    clientId: "11111111-1111-4111-8111-111111111111",
    fullName: "Cliente Demo"
  }
};

export async function getCurrentProfile(preferredRole: Role = "client") {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return preferredRole === "client" ? demoProfiles.client : demoProfiles.admin;
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, role, full_name, client_users(client_id)")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const firstClientUser = Array.isArray(profile.client_users)
    ? profile.client_users[0]
    : profile.client_users;

  return {
    id: profile.user_id,
    role: profile.role as Role,
    clientId: firstClientUser?.client_id ?? null,
    fullName: profile.full_name ?? user.email ?? "Usuario"
  } satisfies SessionProfile;
}

export async function requireRole(role: Role) {
  const profile = await getCurrentProfile(role);

  if (profile.role !== role) {
    redirect(profile.role === "admin" ? "/admin" : "/client");
  }

  return profile;
}

export async function requireInternalRole() {
  const profile = await getCurrentProfile("admin");

  if (!["admin", "sales", "viewer"].includes(profile.role)) {
    redirect("/client");
  }

  return profile;
}
