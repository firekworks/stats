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
    .select("user_id, role, full_name, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.is_active && ["admin", "sales", "viewer"].includes(profile.role)) {
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
    redirect("/login");
  }

  return {
    id: user.id,
    role: "client",
    clientId: clientUser.client_id,
    fullName: user.user_metadata?.full_name ?? user.email ?? "Cliente"
  } satisfies SessionProfile;
}

export async function requireRole(role: Role) {
  const profile = await getCurrentProfile(role);

  if (profile.role !== role) {
    redirect(["admin", "sales", "viewer"].includes(profile.role) ? "/admin" : "/client");
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
