import { getSupabaseServerClient } from "@/lib/supabase/server";

const missingTableCodes = new Set(["42P01", "PGRST106", "PGRST205"]);

export const statsEditableTexts = [
  {
    key: "stats.login.badge",
    label: "Badge login",
    fallback: "Firekworks Stats"
  },
  {
    key: "stats.login.title",
    label: "Titulo login",
    fallback: "Portal privado de resultados"
  },
  {
    key: "stats.login.subtitle",
    label: "Subtitulo login",
    fallback: "Accede a tus métricas, informes y facturas desde un único panel."
  },
  {
    key: "stats.login.username_label",
    label: "Etiqueta usuario",
    fallback: "Usuario"
  },
  {
    key: "stats.login.password_label",
    label: "Etiqueta contrasena",
    fallback: "Contraseña"
  },
  {
    key: "stats.login.button",
    label: "Boton login",
    fallback: "Entrar"
  },
  {
    key: "stats.login.error_invalid",
    label: "Error login",
    fallback: "Usuario o contraseña incorrectos"
  }
] as const;

export type AppTextResult = {
  value: string;
  pendingMigration: boolean;
};

export async function getAppText(
  app: string,
  key: string,
  fallback: string
): Promise<AppTextResult> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { value: fallback, pendingMigration: false };
  }

  const { data, error } = await supabase
    .from("app_texts")
    .select("value")
    .eq("app", app)
    .eq("key", key)
    .maybeSingle();

  if (error) {
    return {
      value: fallback,
      pendingMigration: missingTableCodes.has(error.code)
    };
  }

  return {
    value: data?.value ?? fallback,
    pendingMigration: false
  };
}

export async function getStatsLoginTexts() {
  const entries = await Promise.all(
    statsEditableTexts.map((entry) => getAppText("stats", entry.key, entry.fallback))
  );

  return {
    texts: {
      badge: entries[0].value,
      title: entries[1].value,
      subtitle: entries[2].value,
      usernameLabel: entries[3].value,
      passwordLabel: entries[4].value,
      button: entries[5].value,
      errorInvalid: entries[6].value
    },
    pendingMigration: entries.some((entry) => entry.pendingMigration)
  };
}

export async function getStatsEditableTexts() {
  const entries = await Promise.all(
    statsEditableTexts.map(async (entry) => {
      const text = await getAppText("stats", entry.key, entry.fallback);

      return {
        ...entry,
        value: text.value,
        pendingMigration: text.pendingMigration
      };
    })
  );

  return {
    entries,
    pendingMigration: entries.some((entry) => entry.pendingMigration)
  };
}
