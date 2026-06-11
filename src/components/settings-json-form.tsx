"use client";

import { Save } from "lucide-react";
import { useState } from "react";

export function SettingsJsonForm({
  title,
  settingKey,
  value,
  rows = 10
}: {
  title: string;
  settingKey: string;
  value: string;
  rows?: number;
}) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/settings-json", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: settingKey, value: draft })
    }).catch(() => null);
    const body = (await response?.json().catch(() => ({}))) as { error?: string };

    setSaving(false);
    setMessage(response?.ok ? "Guardado." : body.error ?? "No se pudo guardar.");
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span>{title}</span>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={rows}
          spellCheck={false}
        />
      </label>
      <button className="button button-secondary" disabled={saving} type="submit">
        <Save size={16} />
        {saving ? "Guardando..." : "Guardar"}
      </button>
      {message ? <span className="form-message">{message}</span> : null}
    </form>
  );
}
