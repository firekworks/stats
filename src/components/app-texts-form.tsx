"use client";

import { Save } from "lucide-react";
import { useState } from "react";

export type EditableAppText = {
  key: string;
  label: string;
  fallback: string;
  value: string;
};

export function AppTextsForm({
  entries,
  pendingMigration
}: {
  entries: EditableAppText[];
  pendingMigration: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(entries.map((entry) => [entry.key, entry.value]))
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/app-texts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entries: entries.map((entry) => ({
          key: entry.key,
          value: values[entry.key] ?? entry.fallback
        }))
      })
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    setSaving(false);
    setMessage(response.ok ? "Textos guardados" : payload.error || "No se pudo guardar");
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      {pendingMigration ? (
        <p className="m-0 rounded-[18px] border border-[#e5e5ea] bg-[#fbfbfd] px-4 py-3 text-sm text-[#6e6e73]">
          La tabla app_texts aun no existe. La pagina usa textos por defecto hasta aplicar la migracion.
        </p>
      ) : null}

      {entries.map((entry) => (
        <div className="field" key={entry.key}>
          <label htmlFor={entry.key}>{entry.label}</label>
          <textarea
            id={entry.key}
            value={values[entry.key] ?? ""}
            onChange={(event) =>
              setValues((current) => ({ ...current, [entry.key]: event.target.value }))
            }
            rows={entry.key.includes("subtitle") || entry.key.includes("error") ? 3 : 2}
          />
          <span className="text-xs text-[#6e6e73]">{entry.key}</span>
        </div>
      ))}

      {message ? <p className="m-0 text-sm text-[#6e6e73]">{message}</p> : null}

      <button className="button justify-center" disabled={saving} type="submit">
        <Save size={18} />
        {saving ? "Guardando..." : "Guardar textos"}
      </button>
    </form>
  );
}
