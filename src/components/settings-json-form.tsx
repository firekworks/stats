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
  const previewItems = readPreviewItems(draft);

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
      {previewItems.length ? (
        <div className="settings-accordions">
          {previewItems.slice(0, 16).map((item) => (
            <details className="compact-disclosure" key={item.title}>
              <summary>{item.title}</summary>
              <div className="settings-preview-grid">
                {item.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : null}
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

function readPreviewItems(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      .map((item) => {
        const title =
          string(item.label) ||
          string(item.sector) ||
          string(item.id) ||
          "Configuración";
        const lines = [
          string(item.focus),
          string(item.usualObjective),
          string(item.recommendedTone),
          string(item.recommendedCalendar),
          arrayLine("Dolores", item.pains),
          arrayLine("Objetivos", item.typicalObjectives),
          arrayLine("TOFU", item.tofuIdeas),
          arrayLine("MOFU", item.mofuIdeas),
          arrayLine("BOFU", item.bofuIdeas),
          arrayLine("CTAs", item.ctas)
        ].filter(Boolean);

        return { title, lines };
      });
  } catch {
    return [];
  }
}

function string(value: unknown) {
  return typeof value === "string" ? value : "";
}

function arrayLine(label: string, value: unknown) {
  if (!Array.isArray(value) || !value.length) return "";

  return `${label}: ${value.slice(0, 3).map(String).join(", ")}`;
}
