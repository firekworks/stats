"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import type { CampaignPlan, ContentIdea } from "@/lib/types";

export function ContentIdeaGenerator({
  clientId,
  clientName
}: {
  clientId: string;
  clientName: string;
}) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [created, setCreated] = useState<{ campaign: number; content: number; events: number } | null>(null);
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [month, setMonth] = useState(defaultCampaignMonth());
  const [pack, setPack] = useState<"390" | "590">("390");
  const [objective, setObjective] = useState("Captar más clientes locales cualificados");
  const [offer, setOffer] = useState("");
  const [mainPain, setMainPain] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [visualStyle, setVisualStyle] = useState("");
  const [adBudget, setAdBudget] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/admin/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        adBudget,
        audience,
        mainPain,
        month,
        objective,
        offer,
        pack,
        tone,
        visualStyle
      })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }

    const payload = (await response.json()) as {
      ideas?: ContentIdea[];
      plan?: CampaignPlan;
      created?: { campaign: number; content: number; events: number };
    };
    setIdeas(payload.ideas ?? []);
    setPlan(payload.plan ?? null);
    setCreated(payload.created ?? null);
    setState("done");
  }

  return (
    <div className="grid gap-3">
      <form className="campaign-generator-form" onSubmit={generate}>
        <div className="form-grid">
          <label className="field">
            <span>Mes</span>
            <input
              onChange={(event) => setMonth(event.target.value)}
              type="month"
              value={month}
            />
          </label>
          <label className="field">
            <span>Pack</span>
            <select
              onChange={(event) => setPack(event.target.value as "390" | "590")}
              value={pack}
            >
              <option value="390">Pack 390</option>
              <option value="590">Pack 590</option>
            </select>
          </label>
          <label className="field">
            <span>Objetivo del mes</span>
            <input
              onChange={(event) => setObjective(event.target.value)}
              value={objective}
            />
          </label>
          <label className="field">
            <span>Oferta principal</span>
            <input
              onChange={(event) => setOffer(event.target.value)}
              placeholder="Ej. reserva / valoración / clase de prueba"
              value={offer}
            />
          </label>
          <label className="field">
            <span>Dolor principal</span>
            <input
              onChange={(event) => setMainPain(event.target.value)}
              placeholder="Ej. no saber qué elegir"
              value={mainPain}
            />
          </label>
          <label className="field">
            <span>Público objetivo</span>
            <input
              onChange={(event) => setAudience(event.target.value)}
              placeholder="Clientes locales de la zona"
              value={audience}
            />
          </label>
          <label className="field">
            <span>Tono</span>
            <input
              onChange={(event) => setTone(event.target.value)}
              placeholder="Cercano, premium, educativo..."
              value={tone}
            />
          </label>
          <label className="field">
            <span>Estilo visual</span>
            <input
              onChange={(event) => setVisualStyle(event.target.value)}
              placeholder="Producto real, equipo, local..."
              value={visualStyle}
            />
          </label>
          <label className="field">
            <span>Ads recomendados</span>
            <input
              onChange={(event) => setAdBudget(event.target.value)}
              placeholder={pack === "590" ? "90-150 EUR" : "60-90 EUR"}
              value={adBudget}
            />
          </label>
        </div>
        <button
          className="button"
          disabled={state === "loading"}
          type="submit"
        >
          {state === "loading" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Sparkles size={16} />
          )}
          Generar campaña interna
        </button>
      </form>
      {state === "error" ? (
        <div className="notice-card">
          <strong>No se pudo generar</strong>
          <span className="mt-2 block text-sm">
            Revisa la sesión admin. El generador solo escribe datos internos.
          </span>
        </div>
      ) : null}
      {state === "done" && created ? (
        <div className="notice-card notice-success">
          <strong>Campaña interna creada</strong>
          <span className="mt-2 block text-sm">
            {created.content} piezas y {created.events} eventos añadidos. Nada se muestra al cliente hasta marcarlo visible.
          </span>
        </div>
      ) : null}
      {plan ? (
        <div className="strategy-grid">
          <div className="small-stat">
            <span className="metric-label">Pack</span>
            <strong>{plan.packName}</strong>
          </div>
          <div className="small-stat">
            <span className="metric-label">Objetivo</span>
            <strong>{plan.objective}</strong>
          </div>
          <div className="small-stat">
            <span className="metric-label">Oferta</span>
            <strong>{plan.offer}</strong>
          </div>
          <div className="small-stat">
            <span className="metric-label">Ads</span>
            <strong>{plan.recommendedAdBudget}</strong>
          </div>
        </div>
      ) : null}
      {ideas.length ? (
        <div className="strategy-ideas">
          <span className="metric-label">Plan interno para {clientName}</span>
          {ideas.map((idea) => (
            <details
              className="strategy-idea"
              key={`${idea.code}-${idea.title}-${idea.cta}`}
              open={approved[idea.title]}
            >
              <summary>
                <span>
                  <strong>{idea.code ? `${idea.code} · ` : ""}{idea.title}</strong>
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
                  <span>Caption editable</span>
                  <textarea defaultValue={idea.caption} rows={3} />
                </label>
                <label className="field">
                  <span>Guion AIDA interno</span>
                  <textarea defaultValue={idea.copyBase} rows={3} />
                </label>
                <div className="strategy-grid">
                  <div className="small-stat">
                    <span className="metric-label">Dolor</span>
                    <strong>{idea.pain}</strong>
                  </div>
                  <div className="small-stat">
                    <span className="metric-label">Gancho</span>
                    <strong>{idea.hook}</strong>
                  </div>
                  <div className="small-stat">
                    <span className="metric-label">Visual</span>
                    <strong>{idea.visualBrief}</strong>
                  </div>
                  <div className="small-stat">
                    <span className="metric-label">Por qué</span>
                    <strong>{idea.strategicReason}</strong>
                  </div>
                </div>
                <details className="compact-disclosure">
                  <summary>Guion, planos y recursos</summary>
                  <div className="script-grid">
                    <span><strong>Atención</strong>{idea.aida.attention}</span>
                    <span><strong>Interés</strong>{idea.aida.interest}</span>
                    <span><strong>Deseo</strong>{idea.aida.desire}</span>
                    <span><strong>Acción</strong>{idea.aida.action}</span>
                    <span><strong>Texto</strong>{idea.screenText}</span>
                    <span><strong>Voz</strong>{idea.voiceover}</span>
                    <span><strong>Plano 1</strong>{idea.shot1}</span>
                    <span><strong>Plano 2</strong>{idea.shot2}</span>
                    <span><strong>Plano 3</strong>{idea.shot3}</span>
                    <span><strong>B-roll</strong>{idea.broll}</span>
                    <span><strong>Recursos</strong>{idea.resources}</span>
                    <span><strong>Ads</strong>{idea.adsSuggestion ?? "No promocionar de inicio"}</span>
                  </div>
                </details>
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

function defaultCampaignMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
