import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileBarChart,
  FolderKanban,
  LayoutGrid,
  Link2,
  Megaphone,
  Palette,
  Route,
  Sparkles,
  WandSparkles
} from "lucide-react";
import { CalendarEventForm } from "@/components/calendar-event-form";
import { ContentIdeaGenerator } from "@/components/content-idea-generator";
import { CopyLinkButton } from "@/components/copy-link-button";
import { IntegrationActionButton } from "@/components/integration-action-button";
import {
  CampaignsModule,
  MetricsModule,
  ReportsModule
} from "@/components/modules";
import { ButtonLink, Card, CardHeader, MetricCard, StatusBadge } from "@/components/ui";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercent,
  statusLabel
} from "@/lib/format";
import type {
  CalendarEvent,
  Campaign,
  Client,
  ContentItem,
  PortalData
} from "@/lib/types";

export function DemosModule({
  data,
  appUrl
}: {
  data: PortalData;
  appUrl: string;
}) {
  const demos = data.clients.filter((client) => client.isDemo);

  return (
    <div className="grid">
      <section className="grid grid-4">
        <MetricCard
          icon={WandSparkles}
          label="Demos activas"
          value={String(demos.length)}
          helper="Restaurante, clínica y gimnasio"
          tone="blue"
        />
        <MetricCard
          icon={Megaphone}
          label="Campañas demo"
          value={String(data.campaigns.filter((campaign) => campaign.isDemo).length)}
          helper="Con embudo y checklist"
          tone="mint"
        />
        <MetricCard
          icon={Palette}
          label="Piezas demo"
          value={String(data.content.filter((item) => item.isDemo).length)}
          helper="Códigos REEL/POST/CAR"
          tone="green"
        />
        <MetricCard
          icon={CalendarDays}
          label="Eventos demo"
          value={String(data.calendarEvents.filter((event) => event.isDemo).length)}
          helper="Calendario interno"
          tone="orange"
        />
      </section>

      <Card>
        <CardHeader
          title="Seed y reset controlado"
          description="Datos ficticios"
          action={
            <div className="toolbar">
              <IntegrationActionButton
                endpoint="/api/admin/demos/seed"
                body={{ mode: "seed" }}
                label="Crear demos"
                variant="secondary"
              />
              <IntegrationActionButton
                endpoint="/api/admin/demos/reset"
                body={{ mode: "reset" }}
                label="Reset demos"
                variant="ghost"
              />
            </div>
          }
        />
        <div className="notice-card notice-success">
          <strong>No borra datos reales</strong>
          <span className="mt-2 block text-sm">
            Estos botones solo hacen upsert de clientes marcados como demo. Los
            clientes reales quedan intactos.
          </span>
        </div>
      </Card>

      <section className="grid grid-3">
        {demos.map((client) => {
          const metric = data.metrics.find((item) => item.clientId === client.id);
          const contentCount = data.content.filter(
            (item) => item.clientId === client.id
          ).length;
          const campaignCount = data.campaigns.filter(
            (campaign) => campaign.clientId === client.id
          ).length;
          const demoUrl = `${appUrl}/demo/${client.slug}`;

          return (
            <Card key={client.id}>
              <CardHeader
                title={client.publicName}
                description={`${client.industry} · ${client.city}`}
                action={<span className="badge badge-blue">{client.demoLabel ?? "Demo"}</span>}
              />
              <div className="mt-5 grid gap-4">
                <div className="brand-swatches">
                  {(client.brandColors ?? []).slice(0, 4).map((color) => (
                    <span key={color} style={{ background: color }} />
                  ))}
                </div>
                <p className="m-0 text-sm text-[#6e6e73]">
                  {client.objective}
                </p>
                <div className="grid grid-2">
                  <SmallWorkflowStat
                    label="Alcance"
                    value={formatCompactNumber(metric?.reach ?? 0)}
                  />
                  <SmallWorkflowStat
                    label="Leads"
                    value={formatNumber(metric?.leads ?? 0)}
                  />
                  <SmallWorkflowStat label="Campañas" value={String(campaignCount)} />
                  <SmallWorkflowStat label="Piezas" value={String(contentCount)} />
                </div>
                <div className="toolbar justify-start">
                  <ButtonLink href={`/demo/${client.slug}`} variant="secondary">
                    <ExternalLink size={16} />
                    Ver demo
                  </ButtonLink>
                  <ButtonLink href={`/admin/clients/${client.id}`} variant="ghost">
                    <FolderKanban size={16} />
                    Editar
                  </ButtonLink>
                  <CopyLinkButton value={demoUrl} />
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

export function CalendarModule({
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
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = events.filter((event) => new Date(event.startAt) >= now);
  const weekEvents = upcoming.filter((event) => new Date(event.startAt) <= nextWeek);
  const pending = events.filter((event) => event.status === "pending");

  return (
    <div className="grid">
      <section className="grid grid-4">
        <MetricCard
          icon={CalendarDays}
          label="Próximos eventos"
          value={String(upcoming.length)}
          helper="Publicaciones, revisiones y reuniones"
          tone="blue"
        />
        <MetricCard
          icon={Clock3}
          label="Esta semana"
          value={String(weekEvents.length)}
          helper="Plan operativo"
          tone="mint"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Confirmados"
          value={String(events.filter((event) => event.status === "confirmed").length)}
          helper="Listos para ejecutar"
          tone="green"
        />
        <MetricCard
          icon={Route}
          label="Pendientes"
          value={String(pending.length)}
          helper="Requieren revisión"
          tone="orange"
        />
      </section>

      <section className="split">
        <Card>
          <CardHeader title="Crear evento" description="Calendario interno" />
          <div className="mt-5">
            <CalendarEventForm clients={clients} campaigns={campaigns} content={content} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Fallbacks" description="Google/Drive/Canva" />
          <div className="mt-5 list">
            <FallbackRow
              title="Google Calendar"
              text="Si no hay OAuth, Stats guarda el evento internamente."
            />
            <FallbackRow
              title="Google Drive"
              text="Las carpetas quedan como ids/campos preparados hasta conectar Drive."
            />
            <FallbackRow
              title="Canva"
              text="Los diseños guardan enlaces si existen; si no, hay mockup interno."
            />
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader title="Agenda" description="Próximos 80 eventos" />
        <div className="mt-5 calendar-list">
          {events.length ? (
            events.map((event) => (
              <CalendarEventRow
                clients={clients}
                content={content}
                event={event}
                key={event.id}
              />
            ))
          ) : (
            <EmptyWorkflowState text="No hay eventos todavía." />
          )}
        </div>
      </Card>
    </div>
  );
}

export function CampaignWorkflowModule({
  campaigns,
  clients
}: {
  campaigns: Campaign[];
  clients: Client[];
}) {
  if (!campaigns.length) {
    return <CampaignsModule campaigns={campaigns} admin />;
  }

  return (
    <div className="grid">
      <section className="grid grid-3">
        {campaigns.map((campaign) => {
          const client = clients.find((item) => item.id === campaign.clientId);

          return (
            <Card key={campaign.id}>
              <CardHeader
                title={campaign.name}
                description={`${client?.publicName ?? "Cliente"} · ${campaign.platform}`}
                action={<StatusBadge status={campaign.status} />}
              />
              <div className="mt-5 grid gap-4">
                <div className="funnel-strip">
                  {["Diagnóstico", "Atracción", "Confianza", "Conversión"].map(
                    (stage) => (
                      <span
                        className={
                          campaign.funnelStage?.toLowerCase().includes(stage.toLowerCase())
                            ? "funnel-step funnel-step-active"
                            : "funnel-step"
                        }
                        key={stage}
                      >
                        {stage}
                      </span>
                    )
                  )}
                </div>
                <p className="m-0 text-sm text-[#6e6e73]">
                  {campaign.offer ?? campaign.visibleSummary}
                </p>
                <div className="grid grid-2">
                  <SmallWorkflowStat label="Objetivo" value={campaign.objective} />
                  <SmallWorkflowStat
                    label="Presupuesto"
                    value={formatCurrency(campaign.budget)}
                  />
                  <SmallWorkflowStat label="Leads" value={formatNumber(campaign.leads)} />
                  <SmallWorkflowStat
                    label="CPL"
                    value={formatCurrency(campaign.costPerLead)}
                  />
                </div>
                {campaign.recommendations ? (
                  <div className="notice-card">
                    <strong>Recomendación</strong>
                    <span className="mt-2 block text-sm">
                      {campaign.recommendations}
                    </span>
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </section>
      <CampaignsModule campaigns={campaigns} admin />
    </div>
  );
}

export function ContentWorkflowModule({
  content,
  clients,
  campaigns,
  admin = false
}: {
  content: ContentItem[];
  clients: Client[];
  campaigns: Campaign[];
  admin?: boolean;
}) {
  const pending = content.filter((item) =>
    ["idea", "recorded", "editing", "pending_approval"].includes(item.status)
  );
  const scheduled = content.filter((item) => item.status === "scheduled");
  const published = content.filter((item) => item.status === "published");
  const defaultClient = clients[0];

  return (
    <div className="grid">
      {admin ? (
        <section className="grid grid-4">
          <MetricCard
            icon={Palette}
            label="En producción"
            value={String(pending.length)}
            helper="Ideas, grabación, edición y aprobación"
            tone="blue"
          />
          <MetricCard
            icon={CalendarDays}
            label="Programado"
            value={String(scheduled.length)}
            helper="Listo para publicar"
            tone="mint"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Publicado"
            value={String(published.length)}
            helper="Visible o entregado"
            tone="green"
          />
          <MetricCard
            icon={Sparkles}
            label="Reutilizable"
            value={String(content.filter((item) => item.reusable).length)}
            helper="Banco creativo"
            tone="orange"
          />
        </section>
      ) : null}

      {admin && defaultClient ? (
        <section className="split">
          <Card>
            <CardHeader
              title="Generador de estrategia"
              description="IA interna con fallback"
            />
            <div className="mt-5">
              <ContentIdeaGenerator
                clientId={defaultClient.id}
                clientName={defaultClient.publicName}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Estados de producción" description="Flujo interno" />
            <div className="mt-5 production-board">
              {["idea", "recorded", "editing", "pending_approval", "scheduled", "published"].map(
                (status) => (
                  <span key={status}>
                    <strong>
                      {content.filter((item) => item.status === status).length}
                    </strong>
                    {statusLabel(status)}
                  </span>
                )
              )}
            </div>
          </Card>
        </section>
      ) : null}

      <Card>
        <CardHeader
          title={admin ? "Biblioteca operativa" : "Contenido entregado"}
          description={admin ? "Calendario, kanban y lista" : "Piezas publicadas"}
          action={
            admin ? (
              <div className="settings-tabs m-0">
                <a href="#calendario">Calendario</a>
                <a href="#kanban">Kanban</a>
                <a href="#lista">Lista</a>
              </div>
            ) : null
          }
        />
        <div className="mt-5 content-workflow-list" id="lista">
          {content.length ? (
            content.map((item) => {
              const client = clients.find((entry) => entry.id === item.clientId);
              const campaign = campaigns.find((entry) => entry.id === item.campaignId);

              return (
                <div className="content-workflow-row" key={item.id}>
                  <ContentPreviewMockup item={item} client={client} compact />
                  <div className="content-workflow-main">
                    <div className="toolbar justify-start">
                      <span className="badge badge-blue">
                        {item.contentCode ?? item.type}
                      </span>
                      <StatusBadge status={item.status} />
                      {item.isDemo ? (
                        <span className="badge badge-gray">Demo</span>
                      ) : null}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.hook ?? item.learning}</p>
                    <div className="content-meta-grid">
                      <SmallWorkflowStat
                        label="Cliente"
                        value={client?.publicName ?? "Sin cliente"}
                      />
                      <SmallWorkflowStat label="Formato" value={item.type} />
                      <SmallWorkflowStat
                        label="Embudo"
                        value={item.funnelStage ?? "Sin fase"}
                      />
                      <SmallWorkflowStat
                        label="Publicación"
                        value={formatDate(item.publishDate)}
                      />
                      <SmallWorkflowStat
                        label="Campaña"
                        value={campaign?.name ?? "Sin campaña"}
                      />
                      <SmallWorkflowStat
                        label="Engagement"
                        value={formatPercent(item.engagementRate)}
                      />
                    </div>
                    <div className="toolbar justify-start">
                      {admin ? (
                        <ButtonLink href={`/admin/content/${item.id}`} variant="secondary">
                          <LayoutGrid size={16} />
                          Previsualizar
                        </ButtonLink>
                      ) : null}
                      {item.canvaViewUrl ? (
                        <ButtonLink href={item.canvaViewUrl} variant="ghost">
                          <ExternalLink size={16} />
                          Canva
                        </ButtonLink>
                      ) : (
                        <span className="badge badge-gray">
                          <Link2 size={14} />
                          Canva pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyWorkflowState text="No hay contenido registrado todavía." />
          )}
        </div>
      </Card>
    </div>
  );
}

export function ContentPreviewMockup({
  item,
  client,
  compact = false
}: {
  item: ContentItem;
  client?: Client;
  compact?: boolean;
}) {
  const swatches = client?.brandColors?.length
    ? client.brandColors
    : ["#1d1d1f", "#0071e3", "#0f9f8f"];

  return (
    <div className={compact ? "mockup mockup-compact" : "mockup"}>
      <div className="mockup-top">
        <span
          className="mockup-avatar"
          style={{ background: swatches[0] ?? "#1d1d1f" }}
        />
        <div>
          <strong>{client?.publicName ?? "Firekworks Stats"}</strong>
          <span>{item.platform}</span>
        </div>
      </div>
      <div
        className="mockup-visual"
        style={{
          background: `linear-gradient(135deg, ${swatches[0] ?? "#1d1d1f"}, ${
            swatches[1] ?? "#0071e3"
          })`
        }}
      >
        <span>{item.contentCode ?? item.type}</span>
        <strong>{item.hook ?? item.title}</strong>
      </div>
      <p>{item.caption ?? item.visualBrief ?? item.learning}</p>
      <div className="mockup-actions">
        <span>{formatCompactNumber(item.views + (item.plays ?? 0))} vistas</span>
        <span>{formatPercent(item.engagementRate)}</span>
      </div>
    </div>
  );
}

export function ClientInternalDetail({
  data
}: {
  data: PortalData;
}) {
  const client = data.selectedClient;
  const score = data.scores.find((item) => item.clientId === client.id);
  const clientEvents = data.calendarEvents.filter(
    (event) => event.clientId === client.id
  );

  return (
    <div className="grid">
      <section className="grid grid-4">
        <MetricCard
          icon={FileBarChart}
          label="Fee mensual"
          value={formatCurrency(client.monthlyFee)}
          helper={client.planName}
          tone="blue"
        />
        <MetricCard
          icon={Sparkles}
          label="Firekworks Level"
          value={score?.levelName ?? "Nuevo"}
          helper={`${score?.score ?? 0}/100`}
          tone="mint"
        />
        <MetricCard
          icon={Megaphone}
          label="Campañas"
          value={String(data.campaigns.length)}
          helper="Activas y planificadas"
          tone="green"
        />
        <MetricCard
          icon={CalendarDays}
          label="Calendario"
          value={String(clientEvents.length)}
          helper="Eventos del cliente"
          tone="orange"
        />
      </section>

      <nav className="settings-tabs">
        <a href="#resumen">Resumen</a>
        <a href="#metricas">Métricas</a>
        <a href="#contenido">Contenido</a>
        <a href="#campanas">Campañas</a>
        <a href="#calendario">Calendario</a>
        <a href="#portal">Portal</a>
      </nav>

      <section className="split" id="resumen">
        <Card>
          <CardHeader
            title="Perfil del cliente"
            description={`${client.industry} · ${client.city}`}
            action={<StatusBadge status={client.status} />}
          />
          <div className="mt-5 grid gap-3">
            <SmallWorkflowStat label="Objetivo" value={client.objective ?? "Sin objetivo"} />
            <SmallWorkflowStat
              label="Audiencia"
              value={client.targetAudience ?? "Sin audiencia"}
            />
            <SmallWorkflowStat
              label="Origen"
              value={client.convertedFromLead ? "Convertido desde Leads" : "Stats"}
            />
            <SmallWorkflowStat
              label="Fiscal"
              value={client.taxId ? "Datos fiscales completos" : "Pendiente asesoría"}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Servicios" description="Scope activo" />
          <div className="mt-5 toolbar justify-start">
            {(client.services ?? []).length ? (
              client.services?.map((service) => (
                <span className="badge badge-blue" key={service}>
                  {service}
                </span>
              ))
            ) : (
              <span className="badge badge-gray">Sin servicios configurados</span>
            )}
          </div>
          <div className="notice-card mt-5">
            <strong>Facturación</strong>
            <span className="mt-2 block text-sm">
              Estructura preparada para normativa española futura. La emisión
              fiscal definitiva debe validarse con asesoría.
            </span>
          </div>
        </Card>
      </section>

      <section id="metricas">
        <MetricsModule metrics={data.metrics} />
      </section>
      <section id="contenido">
        <ContentWorkflowModule
          admin
          campaigns={data.campaigns}
          clients={[client]}
          content={data.content}
        />
      </section>
      <section id="campanas">
        <CampaignWorkflowModule campaigns={data.campaigns} clients={[client]} />
      </section>
      <section id="calendario">
        <CalendarModule
          campaigns={data.campaigns}
          clients={[client]}
          content={data.content}
          events={clientEvents}
        />
      </section>
      <section id="portal">
        <ReportsModule reports={data.reports} clientId={client.id} admin />
      </section>
    </div>
  );
}

function CalendarEventRow({
  event,
  clients,
  content
}: {
  event: CalendarEvent;
  clients: Client[];
  content: ContentItem[];
}) {
  const client = clients.find((item) => item.id === event.clientId);
  const linkedContent = content.find((item) => item.id === event.contentItemId);

  return (
    <div className="calendar-row">
      <div className="calendar-date">
        <strong>{formatDay(event.startAt)}</strong>
        <span>{formatTime(event.startAt)}</span>
      </div>
      <div className="list-item-main">
        <strong>{event.title}</strong>
        <span>
          {client?.publicName ?? "General"} · {event.type}
          {linkedContent ? ` · ${linkedContent.contentCode ?? linkedContent.type}` : ""}
        </span>
      </div>
      <StatusBadge status={event.status} />
    </div>
  );
}

function FallbackRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="list-item">
      <span className="metric-icon bg-[rgba(0,113,227,0.1)] text-[#0071e3]">
        <CheckCircle2 size={20} />
      </span>
      <div className="list-item-main">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function SmallWorkflowStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="small-stat">
      <span className="metric-label">{label}</span>
      <strong className="block text-[1.08rem] leading-tight">{value}</strong>
    </div>
  );
}

function EmptyWorkflowState({ text }: { text: string }) {
  return (
    <div className="notice-card">
      <strong>Sin datos</strong>
      <span className="mt-2 block text-sm">{text}</span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short"
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
