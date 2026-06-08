"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import type { Campaign, Client, ContentItem } from "@/lib/types";

type FormState = "idle" | "loading" | "done" | "error";

export function CalendarEventForm({
  clients,
  campaigns,
  content
}: {
  clients: Client[];
  campaigns: Campaign[];
  content: ContentItem[];
}) {
  const firstClient = clients[0]?.id ?? "";
  const [clientId, setClientId] = useState(firstClient);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Publicación");
  const [startAt, setStartAt] = useState(defaultDateTime());
  const [contentItemId, setContentItemId] = useState("");
  const [state, setState] = useState<FormState>("idle");

  const filteredContent = useMemo(
    () => content.filter((item) => item.clientId === clientId),
    [clientId, content]
  );
  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.clientId === clientId),
    [clientId, campaigns]
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");

    const response = await fetch("/api/admin/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        title,
        type,
        startAt,
        contentItemId: contentItemId || null,
        campaignId:
          filteredCampaigns.find((campaign) => campaign.clientId === clientId)
            ?.id ?? null
      })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }

    setState("done");
    setTitle("");
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <label className="field">
          <span>Cliente</span>
          <select value={clientId} onChange={(event) => setClientId(event.target.value)}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.publicName}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Tipo</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option>Publicación</option>
            <option>Grabación</option>
            <option>Revisión cliente</option>
            <option>Entrega</option>
            <option>Reunión</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>Título</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Publicación REEL-002"
          required
        />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Fecha y hora</span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Pieza vinculada</span>
          <select
            value={contentItemId}
            onChange={(event) => setContentItemId(event.target.value)}
          >
            <option value="">Sin vincular</option>
            {filteredContent.map((item) => (
              <option key={item.id} value={item.id}>
                {item.contentCode ?? item.type} · {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <CalendarPlus size={16} />
        )}
        Crear evento
      </button>
      {state === "done" ? (
        <div className="notice-card notice-success">
          <strong>Evento creado</strong>
          <span className="mt-2 block text-sm">
            Se ha guardado en Stats. Si Google Calendar no está configurado,
            queda como calendario interno.
          </span>
        </div>
      ) : null}
      {state === "error" ? (
        <div className="notice-card">
          <strong>No se pudo crear</strong>
          <span className="mt-2 block text-sm">
            Revisa la sesión admin y que la migración del calendario esté aplicada.
          </span>
        </div>
      ) : null}
    </form>
  );
}

function defaultDateTime() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
}
