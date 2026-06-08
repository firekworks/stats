"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import type { ContentIdea } from "@/lib/types";

export function ContentIdeaGenerator({
  clientId,
  clientName
}: {
  clientId: string;
  clientName: string;
}) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function generate() {
    setState("loading");
    const response = await fetch("/api/admin/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        objective: "captacion local",
        count: 6
      })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }

    const payload = (await response.json()) as { ideas?: ContentIdea[] };
    setIdeas(payload.ideas ?? []);
    setState("done");
  }

  return (
    <div className="grid gap-3">
      <button
        className="button"
        type="button"
        onClick={generate}
        disabled={state === "loading"}
      >
        {state === "loading" ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Sparkles size={16} />
        )}
        Generar estrategia
      </button>
      {state === "error" ? (
        <div className="notice-card">
          <strong>No se pudo generar</strong>
          <span className="mt-2 block text-sm">
            Revisa la sesion admin o las variables de IA. El fallback interno no
            expone datos del cliente.
          </span>
        </div>
      ) : null}
      {ideas.length ? (
        <div className="strategy-ideas">
          <span className="metric-label">Ideas para {clientName}</span>
          {ideas.map((idea) => (
            <details
              className="strategy-idea"
              key={`${idea.title}-${idea.cta}`}
              open={approved[idea.title]}
            >
              <summary>
                <span>
                  <strong>{idea.title}</strong>
                  <small>
                    {idea.format} · {idea.funnelStage} · {idea.cta}
                  </small>
                </span>
                <span
                  className={approved[idea.title] ? "badge badge-green" : "badge badge-blue"}
                >
                  {approved[idea.title] ? "Aprobada" : idea.objective}
                </span>
              </summary>
              <div className="strategy-idea-body">
                <label className="field">
                  <span>Copy base editable</span>
                  <textarea defaultValue={idea.copyBase} rows={3} />
                </label>
                <div className="strategy-grid">
                  <div className="small-stat">
                    <span className="metric-label">Visual</span>
                    <strong>{idea.visualBrief}</strong>
                  </div>
                  <div className="small-stat">
                    <span className="metric-label">Por qué</span>
                    <strong>{idea.strategicReason}</strong>
                  </div>
                </div>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setApproved((current) => ({
                      ...current,
                      [idea.title]: !current[idea.title]
                    }))
                  }
                >
                  <CheckCircle2 size={16} />
                  {approved[idea.title] ? "Quitar aprobación" : "Aprobar bloque"}
                </button>
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}
