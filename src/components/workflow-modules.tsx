import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Eye,
  ExternalLink,
  FileBarChart,
  FileText,
  FolderKanban,
  Megaphone,
  MessageCircle,
  Palette,
  ReceiptText,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { CalendarPlanner } from "@/components/calendar-planner";
import { CalendarEventForm } from "@/components/calendar-event-form";
import { ContentIdeaGenerator } from "@/components/content-idea-generator";
import { CopyLinkButton } from "@/components/copy-link-button";
import {
  ClientSettingsForm,
  DriveAssetsPanel,
  NewContentPieceForm,
  NewInvoiceForm
} from "@/components/admin-forms";
import { IntegrationActionButton } from "@/components/integration-action-button";
import { CampaignsModule } from "@/components/modules";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { ButtonLink, Card, CardHeader, MetricCard, StatusBadge } from "@/components/ui";
import {
  formatCompactNumber,
  formatCurrency,
  formatDecimal,
  formatMonth,
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
      <Card className="demo-brief-card">
        <CardHeader
          title="Portales demo"
          description="Vista pública/anónima"
          action={
            <IntegrationActionButton
              endpoint="/api/admin/demos/seed"
              body={{ mode: "seed" }}
              label="Actualizar demos"
              variant="secondary"
            />
          }
        />
        <p>
          Enseña exactamente lo que verá un cliente: resumen, resultados,
          contenido, calendario e informe. No incluye Leads, Radar ni datos reales.
        </p>
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
                    Ver portal demo
                  </ButtonLink>
                  <ButtonLink href={`/admin/clients?duplicate=${client.id}`} variant="ghost">
                    Duplicar como real
                  </ButtonLink>
                  <ButtonLink href={`/admin/clients/${client.id}`} variant="ghost">
                    <FolderKanban size={16} />
                    Editar demo
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
  return (
    <CalendarPlanner
      campaigns={campaigns}
      clients={clients}
      content={content}
      events={events}
    />
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
  admin = false
}: {
  content: ContentItem[];
  clients: Client[];
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
          description={admin ? "Grid visual" : "Piezas publicadas"}
          action={
            admin ? (
              <div className="settings-tabs m-0">
                <a href="#kanban">Estados</a>
                <a href="#lista">Biblioteca</a>
              </div>
            ) : null
          }
        />
        <div id="lista">
          <ContentLibraryGrid
            clients={clients}
            content={content}
            showInternal={admin}
          />
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
  const platformLabel = getPublicPlatformLabel(item.platform);

  return (
    <div className={compact ? "mockup mockup-compact" : "mockup"}>
      <div className="mockup-top">
        <span
          className="mockup-avatar"
          style={{ background: swatches[0] ?? "#1d1d1f" }}
        />
        <div>
          <strong>{client?.publicName ?? "Firekworks Stats"}</strong>
          <span>{platformLabel}</span>
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

export function ContentLibraryGrid({
  content,
  clients,
  showInternal = false
}: {
  content: ContentItem[];
  clients: Client[];
  showInternal?: boolean;
}) {
  if (!content.length) {
    return <EmptyWorkflowState text="No hay piezas registradas todavía." />;
  }

  return (
    <div className="mt-5 grid gap-5">
      {showInternal ? (
        <div className="content-filters">
          <select aria-label="Filtrar por estado" defaultValue="">
            <option value="">Estado</option>
            <option value="idea">Idea</option>
            <option value="recorded">Grabar</option>
            <option value="editing">Editar</option>
            <option value="pending_approval">Revisar</option>
            <option value="scheduled">Programado</option>
            <option value="published">Publicado</option>
          </select>
          <select aria-label="Filtrar por formato" defaultValue="">
            <option value="">Formato</option>
            <option value="Reel">Reel</option>
            <option value="Carrusel">Carrusel</option>
            <option value="Post">Post</option>
            <option value="Story">Story</option>
            <option value="GBP">GBP</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
          <input aria-label="Filtrar por mes o campaña" placeholder="Mes o campaña" />
        </div>
      ) : null}
      <div className="content-library-grid">
        {content.map((item) => {
        const client = clients.find((entry) => entry.id === item.clientId);

        return (
          <article className="content-library-card" key={item.id}>
            <ContentPreviewMockup item={item} client={client} compact />
            <div className="content-library-body">
              <div className="toolbar justify-start">
                <span className="badge badge-blue">{item.contentCode ?? item.type}</span>
                <StatusBadge status={publicContentStatus(item.status)} />
                {item.isPromoted ? <span className="badge badge-orange">Promocionado</span> : null}
              </div>
              <h3>{item.title}</h3>
              <span className="metric-label">
                {item.type} · {formatDate(item.publishDate)}
              </span>
              <div className="content-meta-grid compact-content-meta">
                <SmallWorkflowStat label="Alcance" value={formatCompactNumber(item.reach)} />
                <SmallWorkflowStat label="Vistas" value={formatCompactNumber(item.views + (item.plays ?? 0))} />
                <SmallWorkflowStat label="Engagement" value={formatPercent(item.engagementRate)} />
              </div>
              <div className="toolbar justify-start">
                {item.driveFileUrl ? (
                  <ButtonLink href={item.driveFileUrl} variant="ghost">
                    <ExternalLink size={16} />
                    Drive
                  </ButtonLink>
                ) : showInternal ? (
                  <span className="badge badge-gray">Drive pendiente</span>
                ) : null}
                {item.canvaViewUrl ? (
                  <ButtonLink href={item.canvaEditUrl ?? item.canvaViewUrl} variant="ghost">
                    <ExternalLink size={16} />
                    Canva
                  </ButtonLink>
                ) : showInternal ? (
                  <span className="badge badge-gray">Canva pendiente</span>
                ) : null}
              </div>
              {showInternal ? <InternalScriptDetails item={item} /> : null}
            </div>
          </article>
        );
        })}
      </div>
    </div>
  );
}

function InternalScriptDetails({ item }: { item: ContentItem }) {
  const script = scriptFromPreview(item);

  return (
    <details className="compact-disclosure mt-4">
      <summary>Abrir pieza</summary>
      <div className="script-tabs">
        <details open>
          <summary>Resumen</summary>
          <p>{item.objective ?? "Objetivo pendiente"}</p>
        </details>
        <details>
          <summary>Guion</summary>
          <div className="script-grid">
            <span><strong>Fase</strong>{item.funnelStage ?? "Sin fase"}</span>
            <span><strong>Gancho</strong>{item.hook ?? "Pendiente"}</span>
            <span><strong>Atención</strong>{script.aida?.attention ?? "Pendiente"}</span>
            <span><strong>Interés</strong>{script.aida?.interest ?? "Pendiente"}</span>
            <span><strong>Deseo</strong>{script.aida?.desire ?? "Pendiente"}</span>
            <span><strong>Acción</strong>{script.aida?.action ?? item.cta ?? "Pendiente"}</span>
          </div>
        </details>
        <details>
          <summary>Grabación</summary>
          <div className="script-grid">
            {(script.shots ?? []).map((shot, index) => (
              <span key={shot}><strong>Plano {index + 1}</strong>{shot}</span>
            ))}
            <span><strong>B-roll</strong>{script.broll ?? item.visualBrief ?? "Pendiente"}</span>
          </div>
        </details>
        <details>
          <summary>Copy</summary>
          <p>{item.caption ?? item.learning ?? "Copy pendiente"}</p>
        </details>
        <details>
          <summary>Ads</summary>
          <p>{script.adsSuggestion ?? (item.isPromoted ? "Promocionar" : "Sin promoción inicial")}</p>
        </details>
        <details>
          <summary>Estado</summary>
          <p>{statusLabel(item.status)} · {item.clientVisible ? "Visible en portal" : "Interna"}</p>
        </details>
      </div>
    </details>
  );
}

function scriptFromPreview(item: ContentItem) {
  const data = item.previewData ?? {};

  return {
    aida: readObject(data, "aida") as
      | { attention?: string; interest?: string; desire?: string; action?: string }
      | null,
    shots: Array.isArray(data.shots) ? data.shots.map(String) : [],
    broll: typeof data.broll === "string" ? data.broll : null,
    adsSuggestion:
      typeof data.adsSuggestion === "string" ? data.adsSuggestion : null
  };
}

function readObject(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

function publicContentStatus(status: string) {
  if (status === "pending_approval") return "pending_approval";
  if (["idea", "recorded", "editing"].includes(status)) return "pending";
  return status;
}

function getPublicPlatformLabel(platform: string) {
  if (platform === "Meta Ads") return "Anuncios";
  if (platform === "Facebook") return "Redes sociales";
  return platform;
}

export function ClientPortalView({
  data,
  demo = false
}: {
  data: PortalData;
  demo?: boolean;
}) {
  const client = data.selectedClient;
  const latest = data.metrics[0];
  const campaign = data.campaigns[0];
  const visibleContent = data.content.filter((item) =>
    item.clientVisible !== false &&
    ["pending_approval", "scheduled", "published"].includes(item.status)
  );
  const upcomingEvents = data.calendarEvents.filter((event) => {
    const linkedContent = data.content.find((item) => item.id === event.contentItemId);

    if (linkedContent) {
      return visibleContent.some((item) => item.id === linkedContent.id);
    }

    return event.status === "confirmed" && !event.notes?.toLowerCase().includes("intern");
  });
  const reportHref = `/api/reports/monthly?clientId=${client.id}${
    latest ? `&month=${latest.month}&year=${latest.year}` : ""
  }`;

  return (
    <main className="portal-client-page">
      <section className="portal-client-hero" id="resumen">
        <div>
          <span className="eyebrow">{demo ? "Demo Firekworks" : "Portal cliente"}</span>
          <h1>{client.publicName}</h1>
          <p>
            {client.industry} · {client.city} · {client.planName}
          </p>
        </div>
        <nav className="portal-client-nav" aria-label="Portal cliente">
          <a href="#resumen">Resumen</a>
          <a href="#proximas">Próximas publicaciones</a>
          <a href="#contenido">Contenido entregado</a>
          <a href="#resultados">Resultados</a>
          <a href="#informe">Informe</a>
          <a href="#facturas">Facturas</a>
        </nav>
      </section>

      <section className="grid grid-4">
        <MetricCard
          icon={Eye}
          label="Alcance"
          value={formatCompactNumber(latest?.reach ?? 0)}
          helper="Mes actual"
          tone="blue"
        />
        <MetricCard
          icon={Megaphone}
          label="Impresiones"
          value={formatCompactNumber(latest?.impressions ?? 0)}
          helper="Visibilidad local"
          tone="mint"
        />
        <MetricCard
          icon={MessageCircle}
          label="Mensajes"
          value={formatNumber(latest?.messages ?? 0)}
          helper={`${formatNumber(latest?.leads ?? 0)} oportunidades`}
          tone="green"
        />
        <MetricCard
          icon={TrendingUp}
          label={latest?.roiMode === "real" ? "ROI real" : "ROI estimado"}
          value={latest?.estimatedRoi ? `${formatDecimal(latest.estimatedRoi, 2)}x` : "Sin datos"}
          helper="Marcado según datos disponibles"
          tone="orange"
        />
      </section>

      <section className="portal-client-summary" id="proximas">
        <Card className="hero-result">
          <span className="metric-label">Campaña del mes</span>
          <strong className="portal-campaign-title">
            {campaign?.offer ?? campaign?.name ?? "Plan mensual"}
          </strong>
          <p>{campaign?.visibleSummary ?? latest?.summary ?? "Trabajo mensual en curso."}</p>
        </Card>
        <Card>
          <CardHeader title="Próximas publicaciones" description="Plan visible" />
          <div className="mt-5 list">
            {visibleContent.slice(0, 3).map((item) => (
              <div className="list-item" key={item.id}>
                <div className="list-item-main">
                  <strong>{item.title}</strong>
                  <span>{item.contentCode ?? item.type} · {formatDate(item.publishDate)}</span>
                </div>
                <StatusBadge status={publicContentStatus(item.status)} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="detail-section" id="resultados">
        <Card>
          <CardHeader
            title="Resultados"
            description={latest ? formatMonth(latest.month, latest.year) : "Mes actual"}
          />
          <div className="strategy-grid mt-5">
            <SmallWorkflowStat
              label="Interacciones"
              value={formatNumber(
                (latest?.websiteClicks ?? 0) + (latest?.whatsappClicks ?? 0) + (latest?.calls ?? 0)
              )}
            />
            <SmallWorkflowStat label="Reservas / conversiones" value={formatNumber(latest?.bookings ?? 0)} />
            <SmallWorkflowStat label="Inversión en anuncios" value={formatCurrency(latest?.adSpend ?? 0)} />
            <SmallWorkflowStat label="Retorno estimado" value={formatCurrency(latest?.estimatedRevenue ?? 0)} />
            <SmallWorkflowStat label="Diagnóstico" value={latest?.diagnosis ?? "Pendiente"} />
            <SmallWorkflowStat label="Siguiente paso" value={latest?.nextMonthPlan ?? "Preparar plan"} />
          </div>
        </Card>
      </section>

      <section className="detail-section" id="contenido">
        <Card>
          <CardHeader title="Contenido" description="Entregado y programado" />
          <ContentLibraryGrid clients={[client]} content={visibleContent} />
        </Card>
      </section>

      <section className="detail-section" id="calendario">
        <Card className="calendar-board-card">
          <CardHeader title="Calendario" description="Publicaciones y entregas" />
          <CalendarBoard clients={[client]} content={data.content} events={upcomingEvents} />
        </Card>
      </section>

      <section className="detail-section" id="informe">
        <Card>
          <CardHeader
            title="Informe mensual"
            description={latest ? formatMonth(latest.month, latest.year) : "PDF"}
            action={<PdfDownloadButton href={reportHref} label="Descargar informe" />}
          />
          <p className="m-0 mt-4 text-[#6e6e73]">
            El ROI se marca como real solo cuando el cliente confirma ventas o reservas.
          </p>
        </Card>
      </section>

      <section className="detail-section" id="facturas">
        <Card>
          <CardHeader title="Facturas" description="Documentos descargables" />
          <div className="mt-5 list">
            {data.invoices.length ? (
              data.invoices.map((invoice) => (
                <div className="list-item" key={invoice.id}>
                  <CreditCard size={21} />
                  <div className="list-item-main">
                    <strong>{invoice.invoiceNumber}</strong>
                    <span>
                      {invoice.issueDate} · {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  <StatusBadge status={invoice.status} />
                  <PdfDownloadButton
                    href={`/api/invoices/${invoice.id}/pdf`}
                    label="PDF"
                    variant="secondary"
                  />
                </div>
              ))
            ) : (
              <EmptyWorkflowState text="No hay facturas publicadas todavía." />
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

export function ClientInternalDetail({
  data
}: {
  data: PortalData;
}) {
  const client = data.selectedClient;
  const clientEvents = data.calendarEvents.filter(
    (event) => event.clientId === client.id
  );
  const latestMetric = data.metrics[0];
  const currentCampaign =
    data.campaigns.find((campaign) =>
      ["active", "learning"].includes(campaign.status)
    ) ?? data.campaigns[0];
  const nextTask = data.tasks
    .filter((task) => task.status !== "done")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0];
  const nextEvent = clientEvents
    .filter((event) => new Date(event.startAt).getTime() >= new Date().getTime())
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
  const lastDelivery =
    data.content
      .filter((item) => item.status === "published")
      .sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      )[0] ?? data.content[0];
  const activeAlerts = data.alerts.filter((alert) =>
    ["critical", "warning"].includes(alert.severity)
  );
  const portalHref = client.isDemo ? `/demo/${client.slug}` : "/client";
  const nextAction = nextTask?.title ?? "Definir siguiente paso";
  const monthResult = latestMetric
    ? `${formatNumber(latestMetric.leads)} leads · ${formatCompactNumber(latestMetric.reach)} alcance`
    : "Sin resultado mensual";

  return (
    <div className="grid">
      <section className="client-detail-hero">
        <div>
          <span className="eyebrow">{client.industry} · {client.city}</span>
          <h2>{client.publicName}</h2>
          <div className="toolbar justify-start">
            <StatusBadge status={client.status} />
            {client.isDemo ? <span className="badge badge-blue">Demo</span> : null}
            <span className="badge badge-gray">{client.planName}</span>
          </div>
        </div>
        <div className="toolbar">
          <ButtonLink href={portalHref} variant="secondary">
            <ExternalLink size={16} />
            Ver portal cliente
          </ButtonLink>
          <a className="button button-ghost" href="#calendario">
            <CalendarDays size={16} />
            Crear evento
          </a>
          <a className="button button-ghost" href="#contenido">
            <Palette size={16} />
            Nueva pieza
          </a>
          <a className="button button-ghost" href="#facturas">
            <ReceiptText size={16} />
            Nueva factura
          </a>
        </div>
      </section>

      <nav className="detail-tabs">
        <a href="#resumen">Resumen</a>
        <a href="#campana">Campaña del mes</a>
        <a href="#calendario">Calendario</a>
        <a href="#contenido">Contenido</a>
        <a href="#resultados">Resultados e informe</a>
        <a href="#facturas">Facturas</a>
        <a href="#portal">Portal</a>
        <a href="#ajustes">Ajustes</a>
      </nav>

      <section className={activeAlerts.length ? "detail-section split" : "detail-section"} id="resumen">
        <Card>
          <CardHeader
            title="Resumen operativo"
            description={`${client.industry} · ${client.city}`}
            action={<StatusBadge status={client.status} />}
          />
          <div className="mt-5 grid gap-3">
            <SmallWorkflowStat label="Pack activo" value={client.planName} />
            <SmallWorkflowStat
              label="Objetivo del mes"
              value={currentCampaign?.objective ?? client.objective ?? "Definir objetivo"}
            />
            <SmallWorkflowStat
              label="Próxima acción"
              value={nextAction}
            />
            <SmallWorkflowStat
              label="Próximo evento"
              value={nextEvent ? `${nextEvent.title} · ${formatDate(nextEvent.startAt)}` : "Sin evento"}
            />
            <SmallWorkflowStat
              label="Última entrega"
              value={lastDelivery?.title ?? "Sin contenido entregado"}
            />
            <SmallWorkflowStat
              label="Último resultado"
              value={monthResult}
            />
            <SmallWorkflowStat label="Estado general" value={statusLabel(client.status)} />
          </div>
        </Card>
        {activeAlerts.length ? (
          <Card>
            <CardHeader title="Alertas" description="Solo señales reales" />
            <div className="mt-5 list">
              {activeAlerts.map((alert) => (
                <div className="list-item" key={alert.id}>
                  <AlertTriangle size={21} />
                  <div className="list-item-main">
                    <strong>{alert.title}</strong>
                    <span>{statusLabel(alert.severity)}</span>
                  </div>
                  <span
                    className={`badge ${
                      alert.severity === "critical" ? "badge-red" : "badge-orange"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </section>

      <section className="detail-section" id="campana">
        <section className="split">
          <Card>
            <CardHeader
              title="Campaña del mes"
              description={currentCampaign?.name ?? "Sin campaña activa"}
              action={
                currentCampaign ? <StatusBadge status={currentCampaign.status} /> : null
              }
            />
            <div className="strategy-grid mt-5">
              <SmallWorkflowStat
                label="Objetivo mensual"
                value={currentCampaign?.objective ?? client.objective ?? "Captación local"}
              />
              <SmallWorkflowStat
                label="Oferta"
                value={currentCampaign?.offer ?? "Oferta por definir"}
              />
              <SmallWorkflowStat
                label="Audiencia"
                value={
                  currentCampaign?.targetAudience ??
                  client.targetAudience ??
                  "Audiencia local"
                }
              />
              <SmallWorkflowStat
                label="Dolor principal"
                value={client.objective ?? "Necesidad no documentada"}
              />
              <SmallWorkflowStat
                label="Estilo de contenido"
                value={client.brandVoice ?? "Claro, local y directo"}
              />
              <SmallWorkflowStat
                label="Presupuesto"
                value={formatCurrency(currentCampaign?.budget ?? 0)}
              />
            </div>
            {currentCampaign?.recommendations ? (
              <div className="notice-card">
                <strong>Recomendación interna</strong>
                <span className="mt-2 block text-sm">
                  {currentCampaign.recommendations}
                </span>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Generar campaña interna" description="Solo admin" />
            <div className="mt-5">
              <ContentIdeaGenerator
                clientId={client.id}
                clientName={client.publicName}
              />
            </div>
          </Card>
        </section>

        <Card className="mt-5">
          <CardHeader title="Piezas planificadas" description="Kanban compacto" />
          <div className="status-board-compact mt-5">
            {[
              "idea",
              "recorded",
              "editing",
              "pending_approval",
              "scheduled",
              "published"
            ].map((status) => (
              <div className="status-column" key={status}>
                <span>{statusLabel(status)}</span>
                <strong>
                  {data.content.filter((item) => item.status === status).length}
                </strong>
              </div>
            ))}
          </div>
          <div className="mt-5 content-mini-list">
            {data.content.length ? (
              data.content.slice(0, 8).map((item) => (
                <div className="content-mini-card" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.contentCode ?? item.type} · {item.funnelStage ?? "Sin fase"} · {item.clientVisible ? "Portal" : "Interna"}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <EmptyWorkflowState text="No hay piezas planificadas para este cliente." />
            )}
          </div>
        </Card>
      </section>

      <section className="detail-section split" id="calendario">
        <Card>
          <CardHeader title="Crear evento" description="Calendario del cliente" />
          <div className="mt-5">
            <CalendarEventForm
              clients={[client]}
              campaigns={data.campaigns}
              content={data.content}
            />
          </div>
        </Card>
        <Card className="calendar-board-card">
          <CardHeader title="Calendario del cliente" description="Mes" />
          <CalendarBoard clients={[client]} content={data.content} events={clientEvents} />
        </Card>
      </section>

      <section className="detail-section" id="contenido">
        <Card>
          <CardHeader
            title="Contenido"
            description="Biblioteca visual"
            action={<NewContentPieceForm campaigns={data.campaigns} client={client} />}
          />
          <ContentLibraryGrid
            clients={[client]}
            content={data.content}
            showInternal
          />
        </Card>
      </section>

      <section className="detail-section" id="resultados">
        <Card>
          <CardHeader
            title="Resultados e informe"
            description={latestMetric ? formatMonth(latestMetric.month, latestMetric.year) : "Sin mes"}
            action={
              <select
                aria-label="Mes del informe"
                className="compact-select"
                defaultValue={
                  latestMetric
                    ? `${latestMetric.year}-${String(latestMetric.month).padStart(2, "0")}`
                    : ""
                }
              >
                {data.metrics.map((metric) => (
                  <option
                    key={metric.id}
                    value={`${metric.year}-${String(metric.month).padStart(2, "0")}`}
                  >
                    {formatMonth(metric.month, metric.year)}
                  </option>
                ))}
              </select>
            }
          />
          <div className="strategy-grid mt-5">
            <SmallWorkflowStat
              label="Alcance"
              value={formatCompactNumber(latestMetric?.reach ?? 0)}
            />
            <SmallWorkflowStat
              label="Leads/mensajes"
              value={formatNumber((latestMetric?.leads ?? 0) + (latestMetric?.messages ?? 0))}
            />
            <SmallWorkflowStat
              label="Inversión"
              value={formatCurrency(latestMetric?.totalInvestment ?? 0)}
            />
            <SmallWorkflowStat
              label={latestMetric?.roiMode === "real" ? "ROI real" : "ROI estimado"}
              value={
                latestMetric?.estimatedRoi
                  ? `${formatDecimal(latestMetric.estimatedRoi, 2)}x`
                  : "Sin datos"
              }
            />
            <SmallWorkflowStat
              label="Reservas"
              value={formatNumber(latestMetric?.bookings ?? 0)}
            />
          </div>
          <div className="notice-card mt-5">
            <strong>ROI estimado</strong>
            <span className="mt-2 block text-sm">
              Si no hay ventas confirmadas por el cliente, Stats marca el ROI
              como estimado o datos insuficientes.
            </span>
          </div>
          <div className="toolbar mt-5 justify-start">
            <PdfDownloadButton
              href={`/api/admin/reports/monthly/pdf?clientId=${client.id}${
                latestMetric
                  ? `&month=${latestMetric.month}&year=${latestMetric.year}`
                  : ""
              }`}
              label="Generar informe mensual"
            />
          </div>
        </Card>

        <Card className="table-card mt-5">
          <div className="p-[22px]">
            <CardHeader title="Histórico compacto" description="Máximo foco" />
          </div>
          <div className="table-scroll">
            <table className="data-table compact-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Alcance</th>
                  <th>Leads</th>
                  <th>Ads</th>
                  <th>ROI</th>
                  <th>Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {data.metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td>{formatMonth(metric.month, metric.year)}</td>
                    <td>{formatNumber(metric.reach)}</td>
                    <td>{formatNumber(metric.leads)}</td>
                    <td>{formatCurrency(metric.adSpend)}</td>
                    <td>
                      {metric.estimatedRoi
                        ? `${formatDecimal(metric.estimatedRoi, 2)}x`
                        : "Sin datos"}
                    </td>
                    <td>{metric.diagnosis || "Sin diagnóstico"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="detail-section" id="facturas">
        <Card>
          <CardHeader
            title="Facturas"
            description="Cliente"
            action={<NewInvoiceForm client={client} />}
          />
          <div className="mt-5 list">
            {data.invoices.length ? (
              data.invoices.map((invoice) => (
                <div className="list-item" key={invoice.id}>
                  <CreditCard size={21} />
                  <div className="list-item-main">
                    <strong>{invoice.invoiceNumber}</strong>
                    <span>
                      {invoice.issueDate} · vence {invoice.dueDate} ·{" "}
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                  <StatusBadge status={invoice.status} />
                  <PdfDownloadButton
                    href={`/api/admin/invoices/${invoice.id}/pdf`}
                    label="PDF"
                    variant="secondary"
                  />
                </div>
              ))
            ) : (
              <EmptyWorkflowState text="No hay facturas registradas para este cliente." />
            )}
          </div>
          <div className="notice-card mt-5">
            <strong>Nota fiscal interna</strong>
            <span className="mt-2 block text-sm">
              La estructura está preparada para adaptarse a normativa española
              futura, pero la emisión fiscal definitiva debe validarse con asesoría.
            </span>
          </div>
        </Card>
      </section>

      <section className="detail-section split" id="portal">
        <Card>
          <CardHeader
            title="Portal cliente"
            description={client.isDemo ? "Demo pública" : "Portal privado"}
            action={<FileText size={22} />}
          />
          <div className="portal-preview mt-5">
            <strong>{client.publicName}</strong>
            <span>{client.planName} · {client.planStatus}</span>
            <p>
              El cliente ve resumen, resultados, contenido, calendario e informe
              sin Leads, Radar ni información interna.
            </p>
          </div>
          <div className="toolbar mt-5 justify-start">
            <ButtonLink href={portalHref} variant="secondary">
              <ExternalLink size={16} />
              Abrir portal
            </ButtonLink>
            {client.isDemo ? <CopyLinkButton value={`/demo/${client.slug}`} /> : null}
          </div>
        </Card>
        <Card>
          <CardHeader title="Informes disponibles" description="PDF" />
          <div className="mt-5 list">
            {data.reports.length ? (
              data.reports.map((report) => (
                <div className="list-item" key={report.id}>
                  <FileBarChart size={21} />
                  <div className="list-item-main">
                    <strong>{report.title}</strong>
                    <span>{formatMonth(report.month, report.year)}</span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
              ))
            ) : (
              <EmptyWorkflowState text="Todavía no hay informes guardados." />
            )}
          </div>
        </Card>
      </section>

      <section className="detail-section split" id="ajustes">
        <Card>
          <CardHeader title="Ajustes del cliente" description="Portal, fiscal y plan" />
          <div className="mt-5">
            <ClientSettingsForm client={client} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Drive y portal" description="Archivos del cliente" />
          <div className="mt-5 grid gap-4">
            <SmallWorkflowStat
              label="Carpeta Drive"
              value={client.driveFolderUrl ?? client.driveFolderId ?? "Pendiente"}
            />
            <SmallWorkflowStat
              label="Carpeta Canva"
              value={client.canvaFolderUrl ?? "Pendiente"}
            />
            <SmallWorkflowStat
              label="Portal"
              value={client.isDemo ? `/demo/${client.slug}` : `/portal/${client.slug}`}
            />
            <div className="toolbar justify-start">
              {client.driveFolderUrl ? (
                <ButtonLink href={client.driveFolderUrl} variant="ghost">
                  <ExternalLink size={16} />
                  Drive
                </ButtonLink>
              ) : null}
              {client.canvaFolderUrl ? (
                <ButtonLink href={client.canvaFolderUrl} variant="ghost">
                  <ExternalLink size={16} />
                  Canva
                </ButtonLink>
              ) : null}
            </div>
            <DriveAssetsPanel client={client} />
          </div>
        </Card>
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

export function CalendarBoard({
  events,
  clients,
  content
}: {
  events: CalendarEvent[];
  clients: Client[];
  content: ContentItem[];
}) {
  const baseDate = events[0]?.startAt ? new Date(events[0].startAt) : new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
  ];
  const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="calendar-board mt-5" id="mes">
      <div className="calendar-board-head">
        <strong>
          {new Intl.DateTimeFormat("es-ES", {
            month: "long",
            year: "numeric"
          }).format(firstDay)}
        </strong>
        <span>{events.length} eventos</span>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-month-grid">
        {cells.map((day, index) => {
          const dayEvents = day
            ? events.filter((event) => {
                const date = new Date(event.startAt);
                return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
              })
            : [];

          return (
            <div className={day ? "calendar-day" : "calendar-day calendar-day-empty"} key={`${day ?? "empty"}-${index}`}>
              {day ? <span className="calendar-day-number">{day}</span> : null}
              {dayEvents.slice(0, 3).map((event) => {
                const client = clients.find((item) => item.id === event.clientId);
                const linkedContent = content.find((item) => item.id === event.contentItemId);

                return (
                  <div className={`calendar-pill ${calendarTypeClass(event.type)}`} key={event.id}>
                    <strong>{event.title}</strong>
                    <span>
                      {formatTime(event.startAt)} · {client?.publicName ?? linkedContent?.contentCode ?? "Firekworks"}
                    </span>
                  </div>
                );
              })}
              {dayEvents.length > 3 ? (
                <span className="calendar-more">+{dayEvents.length - 3}</span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="calendar-week-strip" id="semana">
        {events.slice(0, 7).map((event) => (
          <CalendarEventRow clients={clients} content={content} event={event} key={event.id} />
        ))}
      </div>
    </div>
  );
}

function calendarTypeClass(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("grab")) return "calendar-pill-recording";
  if (normalized.includes("edici")) return "calendar-pill-edit";
  if (normalized.includes("revisi")) return "calendar-pill-review";
  if (normalized.includes("public")) return "calendar-pill-publish";
  if (normalized.includes("fact")) return "calendar-pill-invoice";
  return "calendar-pill-default";
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
