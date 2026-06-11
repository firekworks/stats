"use client";

import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { NewClientForm } from "@/components/admin-forms";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { ButtonLink, Card, CardHeader, StatusBadge } from "@/components/ui";
import type { CalendarEvent, Client, PortalData, Task } from "@/lib/types";

export function ClientsHub({ data }: { data: PortalData }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredClients = useMemo(() => {
    const normalizedQuery = normalize(query);

    return data.clients.filter((client) => {
      const pack = client.monthlyFee >= 540 ? "590" : "390";
      const haystack = normalize(
        [
          client.publicName,
          client.legalName,
          client.industry,
          client.city,
          client.status,
          client.planName,
          client.source,
          client.isDemo ? "demo" : "real",
          pack
        ].join(" ")
      );
      const matchesText = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "demo" && client.isDemo) ||
        client.status === statusFilter;

      return matchesText && matchesStatus;
    });
  }, [data.clients, query, statusFilter]);

  return (
    <Card className="client-list-card">
      <CardHeader
        title="Clientes"
        description={`${filteredClients.length} de ${data.clients.length} visibles`}
        action={<NewClientForm />}
      />
      <div className="client-toolbar mt-5">
        <label className="field client-search">
          <span>Buscar</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, sector, ciudad, estado, pack o tipo"
            type="search"
            value={query}
          />
        </label>
        <div className="filter-chips" aria-label="Filtros rápidos">
          {[
            ["all", "Todos"],
            ["active", "Activo"],
            ["paused", "Pausado"],
            ["churned", "Baja"],
            ["demo", "Demo"]
          ].map(([value, label]) => (
            <button
              className={statusFilter === value ? "filter-chip-active" : ""}
              key={value}
              onClick={() => setStatusFilter(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="client-list mt-5">
        {filteredClients.length ? (
          filteredClients.map((client) => (
            <ClientRow
              client={client}
              events={data.calendarEvents}
              key={client.id}
              tasks={data.tasks}
            />
          ))
        ) : (
          <div className="notice-card">
            <strong>Sin resultados</strong>
            <span className="mt-2 block text-sm">
              Prueba con nombre, ciudad, sector, estado, pack 390/590 o tipo demo.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function ClientRow({
  client,
  events,
  tasks
}: {
  client: Client;
  events: CalendarEvent[];
  tasks: Task[];
}) {
  const task = nextClientTask(tasks, client.id);
  const event = nextClientEvent(events, client.id);
  const nextStep = task?.title ?? event?.title ?? "Definir campaña del mes";
  const nextDate = event?.startAt ? formatDateShort(event.startAt) : task?.dueDate ?? "Sin fecha";

  return (
    <div className="client-row">
      <div className="client-name-cell">
        <strong>{client.publicName}</strong>
        <span>
          {client.industry || "Sin sector"} · {client.city || "Sin ciudad"}
        </span>
      </div>
      <div className="client-status-cell">
        {client.isDemo ? (
          <span className="badge badge-blue">Demo</span>
        ) : (
          <StatusBadge status={client.status} />
        )}
        <span>Pack {client.monthlyFee >= 540 ? "590" : "390"}</span>
      </div>
      <div className="client-summary">
        <span className="metric-label">Próximo paso</span>
        <strong>{nextStep}</strong>
        <span>{client.convertedFromLead ? "Desde Leads" : client.planName}</span>
      </div>
      <div className="client-summary">
        <span className="metric-label">Próxima fecha</span>
        <strong>{nextDate}</strong>
        <span>{event ? "Evento" : task ? "Tarea" : "Pendiente"}</span>
      </div>
      <div className="client-row-actions">
        <ButtonLink href={`/admin/clients/${client.id}`} variant="secondary">
          <ExternalLink size={16} />
          Abrir
        </ButtonLink>
        <ButtonLink
          href={client.isDemo ? `/demo/${client.slug}` : `/admin/clients/${client.id}#portal`}
          variant="ghost"
        >
          Portal
        </ButtonLink>
        <PdfDownloadButton
          href={`/api/admin/reports/monthly/pdf?clientId=${client.id}`}
          label="Informe"
          variant="secondary"
        />
        <ButtonLink href={`/admin/clients/${client.id}#facturas`} variant="ghost">
          Factura
        </ButtonLink>
      </div>
    </div>
  );
}

function nextClientTask(tasks: Task[], clientId: string) {
  return tasks
    .filter((task) => task.clientId === clientId && task.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
}

function nextClientEvent(events: CalendarEvent[], clientId: string) {
  const now = new Date().getTime();

  return events
    .filter(
      (event) =>
        event.clientId === clientId && new Date(event.startAt).getTime() >= now
    )
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];
}

function formatDateShort(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
