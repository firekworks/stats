"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { ContentIdea } from "@/lib/types";

export function ContentIdeaGenerator({
  clientId,
  clientName
}: {
  clientId: string;
  clientName: string;
}) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
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
        <div className="list">
          <span className="metric-label">Ideas para {clientName}</span>
          {ideas.map((idea) => (
            <div className="list-item" key={`${idea.title}-${idea.cta}`}>
              <div className="list-item-main">
                <strong>{idea.title}</strong>
                <span>
                  {idea.format} · {idea.funnelStage} · {idea.cta}
                </span>
              </div>
              <span className="badge badge-blue">{idea.objective}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
