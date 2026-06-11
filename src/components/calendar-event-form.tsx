"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import type { Campaign, Client, ContentItem } from "@/lib/types";

type FormState = "idle" | "loading" | "done" | "error";
type CalendarKind = "task" | "event" | "content";

const subtypeOptions: Record<CalendarKind, string[]> = {
  task: ["Aprobación", "Entrega material", "Revisión interna", "Factura", "Seguimiento"],
  event: ["Reunión", "Grabación", "Entrega", "Llamada", "Google Business"],
  content: ["Publicación", "Story", "Reel", "Carrusel", "Anuncio"]
};

export function CalendarEventForm({
  clients,
  campaigns,
  content,
  initialDate
}: {
  clients: Client[];
  campaigns: Campaign[];
  content: ContentItem[];
  initialDate?: string;
}) {
  const firstClient = clients[0]?.id ?? "";
  const [clientId, setClientId] = useState(firstClient);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CalendarKind>("content");
  const [subtype, setSubtype] = useState("Publicación");
  const [status, setStatus] = useState("pending");
  const [startDate, setStartDate] = useState(() => defaultDateParts(initialDate).date);
  const [startTime, setStartTime] = useState(() => defaultDateParts(initialDate).time);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [contentItemId, setContentItemId] = useState("");
  const [notes, setNotes] = useState("");
  const [syncGoogle, setSyncGoogle] = useState(false);
  const [state, setState] = useState<FormState>("idle");

  const filteredContent = useMemo(
    () => content.filter((item) => item.clientId === clientId),
    [clientId, content]
  );
  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.clientId === clientId),
    [clientId, campaigns]
  );

  useEffect(() => {
    if (!initialDate) return;
    setStartDate(initialDate);
    setEndDate((current) => current || initialDate);
  }, [initialDate]);

  useEffect(() => {
    const nextSubtype = subtypeOptions[kind][0];
    setSubtype(nextSubtype);
  }, [kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const startAt = combineLocalDateTime(startDate, startTime);
    const endAt = endDate && endTime ? combineLocalDateTime(endDate, endTime) : null;

    const response = await fetch("/api/admin/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        title,
        type: subtype,
        status,
        startAt,
        endAt,
        contentItemId: contentItemId || null,
        notes: buildNotes(kind, notes),
        syncGoogle,
        campaignId: campaignId || null
      })
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }

    setState("done");
    setTitle("");
    setNotes("");
    setCampaignId("");
    setContentItemId("");
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
          <span>Clase</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as CalendarKind)}>
            <option value="content">Contenido</option>
            <option value="event">Evento</option>
            <option value="task">Tarea</option>
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Subtipo</span>
          <select value={subtype} onChange={(event) => setSubtype(event.target.value)}>
            {subtypeOptions[kind].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="done">Hecho</option>
            <option value="cancelled">Cancelado</option>
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
          <span>Fecha inicio</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Hora inicio</span>
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </label>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Fecha fin</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Hora fin</span>
          <input
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </label>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Campaña vinculada</span>
          <select
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
          >
            <option value="">Sin campaña</option>
            {filteredCampaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
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
      <label className="field">
        <span>Descripción interna</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Notas internas, enlace Drive/Canva o contexto para el equipo."
        />
      </label>
      <label className="check-field">
        <input
          checked={syncGoogle}
          onChange={(event) => setSyncGoogle(event.target.checked)}
          type="checkbox"
        />
        <span>Sincronizar con Google Calendar si OAuth está conectado</span>
      </label>
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
            Se ha guardado en Stats. Si marcaste Google Calendar y está conectado,
            también queda sincronizado.
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

function defaultDateParts(initialDate?: string) {
  const date = initialDate ? parseDateKey(initialDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setHours(10, 0, 0, 0);

  return {
    date: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-"),
    time: "10:00"
  };
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function combineLocalDateTime(date: string, time: string) {
  return `${date}T${time || "10:00"}`;
}

function buildNotes(kind: CalendarKind, notes: string) {
  const prefix =
    kind === "task"
      ? "Clase: tarea"
      : kind === "event"
        ? "Clase: evento"
        : "Clase: contenido";

  return [prefix, notes.trim()].filter(Boolean).join("\n\n");
}
