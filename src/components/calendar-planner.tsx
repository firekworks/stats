"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  ListChecks,
  Plus
} from "lucide-react";
import { CalendarEventForm } from "@/components/calendar-event-form";
import { Card, CardHeader, MetricCard, StatusBadge } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import type { CalendarEvent, Campaign, Client, ContentItem } from "@/lib/types";

type CalendarMode = "month" | "week" | "list";
type AgendaItem = {
  id: string;
  clientId: string | null;
  title: string;
  label: string;
  status: string;
  startsAt: string;
  kind: "event" | "content";
};

const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

export function CalendarPlanner({
  clients,
  campaigns,
  content,
  events
}: {
  clients: Client[];
  campaigns: Campaign[];
  content: ContentItem[];
  events: CalendarEvent[];
}) {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const agenda = useMemo(() => buildAgenda(events, content), [events, content]);
  const upcoming = useMemo(
    () =>
      agenda
        .filter((item) => new Date(item.startsAt).getTime() >= startOfDay(new Date()).getTime())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [agenda]
  );
  const selectedItems = useMemo(
    () => agenda.filter((item) => dateKey(new Date(item.startsAt)) === selectedDate),
    [agenda, selectedDate]
  );
  const weekStart = startOfWeek(cursor);
  const visibleDays =
    mode === "week"
      ? Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
      : buildMonthCells(cursor);
  const publishedContent = content.filter((item) => item.status === "published").length;
  const pendingContent = content.filter((item) =>
    ["idea", "recorded", "editing", "pending_approval", "scheduled"].includes(item.status)
  ).length;

  function move(step: number) {
    setCursor((current) => (mode === "week" ? addDays(current, step * 7) : addMonths(current, step)));
  }

  function goToday() {
    const today = new Date();
    setCursor(mode === "week" ? startOfWeek(today) : startOfMonth(today));
    setSelectedDate(dateKey(today));
  }

  return (
    <div className="grid">
      <section className="calendar-command">
        <MetricCard
          icon={CheckCircle2}
          label="Contenido subido"
          value={formatNumber(publishedContent)}
          helper="Piezas publicadas"
          tone="green"
        />
        <MetricCard
          icon={ListChecks}
          label="Contenido pendiente"
          value={formatNumber(pendingContent)}
          helper="Idea, producción o programado"
          tone="orange"
        />
        <MetricCard
          icon={Clock3}
          label="Próximos eventos"
          value={formatNumber(upcoming.length)}
          helper="Desde hoy"
          tone="blue"
        />
        <Card className="calendar-connect-card">
          <CardHeader
            title="Google Calendar"
            description="OAuth preparado"
            action={
              <a className="button button-secondary" href="/api/integrations/google/auth">
                <ExternalLink size={16} />
                Conectar
              </a>
            }
          />
          <span className="badge badge-gray">Revisa variables en Integraciones</span>
        </Card>
      </section>

      <section className="calendar-layout calendar-planner-layout">
        <Card className="calendar-board-card">
          <CardHeader
            title={mode === "list" ? "Agenda" : calendarTitle(cursor, mode)}
            description={mode === "month" ? "Mes" : mode === "week" ? "Semana" : "Lista"}
            action={
              <div className="calendar-toolbar">
                <div className="settings-tabs m-0">
                  {(["month", "week", "list"] as CalendarMode[]).map((item) => (
                    <button
                      className={mode === item ? "active-tab" : ""}
                      key={item}
                      onClick={() => setMode(item)}
                      type="button"
                    >
                      {item === "month" ? "Mes" : item === "week" ? "Semana" : "Lista"}
                    </button>
                  ))}
                </div>
                <button className="icon-button" onClick={() => move(-1)} type="button" aria-label="Anterior">
                  <ChevronLeft size={17} />
                </button>
                <button className="button button-ghost" onClick={goToday} type="button">
                  Hoy
                </button>
                <button className="icon-button" onClick={() => move(1)} type="button" aria-label="Siguiente">
                  <ChevronRight size={17} />
                </button>
              </div>
            }
          />

          {mode === "list" ? (
            <div className="calendar-list mt-5">
              {upcoming.length ? (
                upcoming.slice(0, 24).map((item) => (
                  <AgendaRow item={item} clients={clients} key={item.id} />
                ))
              ) : (
                <EmptyCalendar text="No hay eventos o publicaciones próximas." />
              )}
            </div>
          ) : (
            <div className="calendar-board mt-5">
              <div className="calendar-weekdays">
                {weekdays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar-month-grid">
                {visibleDays.map((day, index) => {
                  const empty = !day;
                  const key = day ? dateKey(day) : `empty-${index}`;
                  const items = day
                    ? agenda.filter((item) => dateKey(new Date(item.startsAt)) === key)
                    : [];
                  const active = key === selectedDate;

                  return (
                    <button
                      className={[
                        "calendar-day",
                        empty ? "calendar-day-empty" : "",
                        active ? "calendar-day-active" : "",
                        day && isToday(day) ? "calendar-day-today" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={empty}
                      key={key}
                      onClick={() => day && setSelectedDate(key)}
                      type="button"
                    >
                      {day ? <span className="calendar-day-number">{day.getDate()}</span> : null}
                      {items.slice(0, 3).map((item) => (
                        <span className={`calendar-pill ${calendarTypeClass(item.label)}`} key={item.id}>
                          <strong>{item.title}</strong>
                          <span>{formatTime(item.startsAt)}</span>
                        </span>
                      ))}
                      {items.length > 3 ? (
                        <span className="calendar-more">+{items.length - 3}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <aside className="calendar-side-panel">
          <Card>
            <CardHeader
              title={formatLongDate(selectedDate)}
              description="Día seleccionado"
              action={<CalendarDays size={21} />}
            />
            <div className="mt-5 calendar-list">
              {selectedItems.length ? (
                selectedItems.map((item) => (
                  <AgendaRow item={item} clients={clients} key={item.id} compact />
                ))
              ) : (
                <EmptyCalendar text="Selecciona un día o crea una nueva acción." />
              )}
            </div>
            <div className="calendar-quick-actions mt-5">
              <a className="button button-secondary" href="#crear-evento">
                <Plus size={16} />
                Evento
              </a>
              <a className="button button-ghost" href="/admin/content">
                Contenido
              </a>
              <a className="button button-ghost" href="/admin/clients">
                Tarea
              </a>
            </div>
          </Card>

          <Card id="crear-evento">
            <CardHeader title="Crear acción" description="Tarea, evento o contenido" />
            <div className="mt-5">
              <CalendarEventForm
                campaigns={campaigns}
                clients={clients}
                content={content}
                initialDate={selectedDate}
              />
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function AgendaRow({
  item,
  clients,
  compact = false
}: {
  item: AgendaItem;
  clients: Client[];
  compact?: boolean;
}) {
  const client = clients.find((entry) => entry.id === item.clientId);

  return (
    <div className={compact ? "calendar-row calendar-row-compact" : "calendar-row"}>
      <div className="calendar-date">
        <strong>{formatDay(item.startsAt)}</strong>
        <span>{formatTime(item.startsAt)}</span>
      </div>
      <div className="list-item-main">
        <strong>{item.title}</strong>
        <span>
          {client?.publicName ?? "Firekworks"} · {item.label}
        </span>
      </div>
      <StatusBadge status={item.status} />
    </div>
  );
}

function EmptyCalendar({ text }: { text: string }) {
  return (
    <div className="notice-card">
      <strong>Sin datos</strong>
      <span className="mt-2 block text-sm">{text}</span>
    </div>
  );
}

function buildAgenda(events: CalendarEvent[], content: ContentItem[]) {
  const eventItems: AgendaItem[] = events.map((event) => ({
    id: `event-${event.id}`,
    clientId: event.clientId,
    title: event.title,
    label: event.type || "Evento",
    status: event.status,
    startsAt: event.startAt,
    kind: "event"
  }));
  const contentItems: AgendaItem[] = content
    .filter((item) => item.publishDate)
    .map((item) => ({
      id: `content-${item.id}`,
      clientId: item.clientId,
      title: item.title,
      label: item.contentCode ?? item.type,
      status: item.status,
      startsAt: item.publishDate,
      kind: "content"
    }));

  return [...eventItems, ...contentItems].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
}

function buildMonthCells(cursor: Date) {
  const first = startOfMonth(cursor);
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) =>
      new Date(first.getFullYear(), first.getMonth(), index + 1)
    )
  ];
}

function calendarTitle(cursor: Date, mode: CalendarMode) {
  const target = mode === "week" ? startOfWeek(cursor) : cursor;

  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric"
  }).format(target);
}

function formatLongDate(value: string) {
  const date = parseDateKey(value);

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(date);
}

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short"
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function calendarTypeClass(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("grab")) return "calendar-pill-recording";
  if (normalized.includes("edici")) return "calendar-pill-edit";
  if (normalized.includes("revisi") || normalized.includes("aprob")) return "calendar-pill-review";
  if (normalized.includes("public") || normalized.includes("reel") || normalized.includes("post")) {
    return "calendar-pill-publish";
  }
  if (normalized.includes("fact")) return "calendar-pill-invoice";
  return "calendar-pill-default";
}

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = (start.getDay() + 6) % 7;
  return addDays(start, -day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isToday(date: Date) {
  return dateKey(date) === dateKey(new Date());
}
