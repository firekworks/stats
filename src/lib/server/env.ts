import "server-only";

export function readServerEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : null;
}

export function requireServerEnv(name: string) {
  const value = readServerEnv(name);

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function getMissingServerEnv(names: string[]) {
  return names.filter((name) => !readServerEnv(name));
}

export function getPublicAppUrl(request?: Request) {
  const configured = readServerEnv("NEXT_PUBLIC_APP_URL");

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (request) {
    return new URL(request.url).origin;
  }

  return "http://localhost:3000";
}

export function getSupabaseServiceEnv() {
  return {
    url: readServerEnv("SUPABASE_URL") ?? readServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey:
      readServerEnv("SUPABASE_ANON_KEY") ??
      readServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: readServerEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}
