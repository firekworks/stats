import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  FileBarChart,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  ReceiptText,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  WalletCards
} from "lucide-react";
import { MonthlyTrendChart } from "@/components/charts";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import {
  ButtonLink,
  Card,
  CardHeader,
  MetricCard,
  StatusBadge,
  TrendBadge
} from "@/components/ui";
import {
  formatCompactNumber,
  formatCurrency,
  formatDecimal,
  formatMonth,
  formatNumber,
  formatPercent
} from "@/lib/format";
import { percentageChange } from "@/lib/calculations";
import type { PortalData } from "@/lib/types";

export function ClientDashboard({ data }: { data: PortalData }) {
  const latest = data.metrics[0];

  if (!latest) {
    return <ClientDashboardEmpty data={data} />;
  }

  const previous = data.metrics[1];
  const bestContent = data.content.find(
    (item) => item.id === latest.bestContentId
  );
  const reachTrend = previous
    ? percentageChange(latest.reach, previous.reach)
    : 0;
  const leadTrend = previous
    ? percentageChange(latest.leads, previous.leads)
    : 0;
  const cpl =
    latest.leads > 0 ? latest.adSpend / latest.leads : latest.adSpend;

  return (
    <div className="grid">
      <section className="split">
        <Card className="hero-result">
          <span className="metric-label">Resultado destacado</span>
          <strong className="metric-value">
            {formatCompactNumber(latest.reach)}
          </strong>
          <p className="max-w-[620px] text-lg">
            Alcance total en {formatMonth(latest.month, latest.year)} con{" "}
            {formatNumber(latest.leads)} oportunidades registradas.
          </p>
          <footer className="metric-foot">
            <TrendBadge value={reachTrend} />
            <span>Comparado con el mes anterior</span>
          </footer>
        </Card>

        <Card>
          <CardHeader
            title="Resumen del mes"
            description={formatMonth(latest.month, latest.year)}
            action={<StatusBadge status="active" />}
          />
          <div className="mt-6 grid gap-4">
            <div className="list-item">
              <span className="metric-icon bg-[rgba(0,113,227,0.1)] text-[#0071e3]">
                <Sparkles size={20} />
              </span>
              <div className="list-item-main">
                <strong>{latest.summary}</strong>
                <span>{latest.diagnosis}</span>
              </div>
            </div>
            <div className="list-item">
              <span className="metric-icon bg-[rgba(47,158,68,0.1)] text-[#2f9e44]">
                <CheckCircle2 size={20} />
              </span>
              <div className="list-item-main">
                <strong>Estado del plan: {data.selectedClient.planStatus}</strong>
                <span>{data.selectedClient.planName}</span>
              </div>
            </div>
            <div className="list-item">
              <span className="metric-icon bg-[rgba(249,115,22,0.12)] text-[#f97316]">
                <CalendarClock size={20} />
              </span>
              <div className="list-item-main">
                <strong>Siguiente mes preparado</strong>
                <span>{latest.nextMonthPlan || "Plan mensual en seguimiento."}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-4">
        <MetricCard
          icon={Eye}
          label="Alcance"
          value={formatCompactNumber(latest.reach)}
          trend={reachTrend}
          helper="Personas alcanzadas"
          tone="blue"
        />
        <MetricCard
          icon={MousePointerClick}
          label="Clics"
          value={formatNumber(latest.websiteClicks + latest.whatsappClicks)}
          helper={`${formatNumber(latest.websiteClicks)} web + ${formatNumber(
            latest.whatsappClicks
          )} WhatsApp`}
          tone="mint"
        />
        <MetricCard
          icon={MessageCircle}
          label="Leads y mensajes"
          value={formatNumber(latest.leads)}
          trend={leadTrend}
          helper={`${formatNumber(latest.messages)} mensajes`}
          tone="green"
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Coste por lead"
          value={formatCurrency(cpl)}
          helper={`${formatCurrency(latest.adSpend)} invertidos en ads`}
          tone="orange"
        />
      </section>

      <section className="grid grid-4">
        <MetricCard
          icon={Megaphone}
          label="Impresiones"
          value={formatCompactNumber(latest.impressions)}
          helper="Frecuencia y visibilidad"
          tone="gray"
        />
        <MetricCard
          icon={WalletCards}
          label="Inversion total"
          value={formatCurrency(latest.totalInvestment)}
          helper={`${formatCurrency(latest.serviceFee)} fee agencia`}
          tone="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label={latest.roiMode === "real" ? "ROI real" : "ROI estimado"}
          value={
            latest.estimatedRoi
              ? `${formatDecimal(latest.estimatedRoi, 2)}x`
              : "Sin datos"
          }
          helper={
            latest.roiMode === "insufficient_data"
              ? "Faltan ventas confirmadas"
              : "Basado en ticket medio"
          }
          tone="green"
        />
        <MetricCard
          icon={Target}
          label="Reservas estimadas"
          value={formatNumber(latest.bookings)}
          helper={`${formatCurrency(latest.estimatedRevenue)} retorno estimado`}
          tone="mint"
        />
      </section>

      <RealDataBlocks data={data} />

      <section className="split">
        <Card className="chart-card">
          <CardHeader
            title="Evolucion mensual"
            description="Alcance y leads"
          />
          <div className="chart-wrap">
            <MonthlyTrendChart metrics={data.metrics} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Mejor contenido"
            description={bestContent?.type ?? "Contenido"}
          />
          <div className="content-preview mt-5">
            <strong>{bestContent?.title ?? "Contenido destacado"}</strong>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="list-item">
              <div className="list-item-main">
                <strong>{formatCompactNumber(bestContent?.views ?? 0)}</strong>
                <span>Visualizaciones</span>
              </div>
              <span className="badge badge-green">
                {formatPercent(bestContent?.engagementRate ?? 0)}
              </span>
            </div>
            <p className="m-0 text-sm text-[#6e6e73]">{bestContent?.learning}</p>
          </div>
        </Card>
      </section>

      <section className="grid grid-2">
        <Card>
          <CardHeader title="Proximas acciones" description="Plan operativo" />
          <div className="mt-5 list">
            {data.tasks
              .filter((task) => task.visibleToClient)
              .map((task) => (
                <div className="list-item" key={task.id}>
                  <div className="list-item-main">
                    <strong>{task.title}</strong>
                    <span>Fecha objetivo: {task.dueDate}</span>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Informes y facturas"
            description="Documentos"
            action={
              <PdfDownloadButton
                href={`/api/admin/reports/monthly/pdf?clientId=${data.selectedClient.id}`}
                label="Informe"
              />
            }
          />
          <div className="mt-5 list">
            <div className="list-item">
              <FileBarChart size={22} />
              <div className="list-item-main">
                <strong>{data.reports[0]?.title ?? "Informe mensual"}</strong>
                <span>PDF listo para cliente</span>
              </div>
              <ArrowRight size={18} />
            </div>
            <div className="list-item">
              <ReceiptText size={22} />
              <div className="list-item-main">
                <strong>
                  {data.invoices[0]?.invoiceNumber ?? "Factura pendiente"}
                </strong>
                <span>{formatCurrency(data.invoices[0]?.total ?? 0)}</span>
              </div>
              <StatusBadge status={data.invoices[0]?.status ?? "draft"} />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function ClientDashboardEmpty({ data }: { data: PortalData }) {
  return (
    <div className="grid">
      <section className="split">
        <Card className="hero-result">
          <span className="metric-label">Resultado destacado</span>
          <strong className="metric-value">Sin datos</strong>
          <p className="max-w-[620px] text-lg">
            Todavia no hay metricas reales importadas o registradas para{" "}
            {data.selectedClient.publicName}.
          </p>
          <footer className="metric-foot">
            <span className="badge badge-gray">Pendiente</span>
            <span>Conecta integraciones o registra metricas manuales.</span>
          </footer>
        </Card>

        <Card>
          <CardHeader
            title="Resumen del mes"
            description="Datos pendientes"
            action={<StatusBadge status={data.selectedClient.status} />}
          />
          <div className="mt-6 grid gap-4">
            <div className="list-item">
              <span className="metric-icon bg-[rgba(0,113,227,0.1)] text-[#0071e3]">
                <CalendarClock size={20} />
              </span>
              <div className="list-item-main">
                <strong>Portal listo para recibir datos reales.</strong>
                <span>No se muestran leads ni metricas ficticias al cliente.</span>
              </div>
            </div>
            <div className="list-item">
              <span className="metric-icon bg-[rgba(47,158,68,0.1)] text-[#2f9e44]">
                <CheckCircle2 size={20} />
              </span>
              <div className="list-item-main">
                <strong>Estado del plan: {data.selectedClient.planStatus}</strong>
                <span>{data.selectedClient.planName}</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-4">
        <MetricCard icon={Eye} label="Alcance" value="Sin datos" tone="blue" />
        <MetricCard icon={Megaphone} label="Impresiones" value="Sin datos" tone="gray" />
        <MetricCard icon={MessageCircle} label="Leads y mensajes" value="Sin datos" tone="green" />
        <MetricCard icon={TrendingUp} label="ROI" value="Sin datos" tone="orange" />
      </section>

      <RealDataBlocks data={data} />

      <section className="grid grid-2">
        <Card>
          <CardHeader title="Proximas acciones" description="Plan operativo" />
          <div className="mt-5 list">
            {data.tasks
              .filter((task) => task.visibleToClient)
              .map((task) => (
                <div className="list-item" key={task.id}>
                  <div className="list-item-main">
                    <strong>{task.title}</strong>
                    <span>Fecha objetivo: {task.dueDate}</span>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Informes" description="PDF mensual" />
          <div className="mt-5 list">
            <div className="list-item">
              <FileBarChart size={22} />
              <div className="list-item-main">
                <strong>Informe pendiente</strong>
                <span>Se activara cuando existan metricas del periodo.</span>
              </div>
              <StatusBadge status="pending" />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function RealDataBlocks({ data }: { data: PortalData }) {
  const campaignTotals = data.campaigns.reduce(
    (total, campaign) => ({
      spend: total.spend + campaign.spend,
      impressions: total.impressions + (campaign.impressions ?? 0),
      clicks: total.clicks + (campaign.clicks ?? 0),
      leads: total.leads + campaign.leads,
      messages: total.messages + (campaign.messages ?? 0),
      conversions: total.conversions + (campaign.conversions ?? 0)
    }),
    {
      spend: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      messages: 0,
      conversions: 0
    }
  );
  const bestCampaign = data.campaigns
    .slice()
    .sort((a, b) => b.leads - a.leads || b.spend - a.spend)[0];
  const contentTotals = data.content.reduce(
    (total, item) => ({
      reach: total.reach + item.reach,
      impressions: total.impressions + (item.impressions ?? 0),
      views: total.views + item.views + (item.plays ?? 0),
      likes: total.likes + item.likes,
      comments: total.comments + item.comments,
      shares: total.shares + item.shares,
      saves: total.saves + item.saves
    }),
    {
      reach: 0,
      impressions: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0
    }
  );
  const bestContent = data.content
    .slice()
    .sort((a, b) => b.engagementRate - a.engagementRate || b.views - a.views)[0];
  const meta = data.integrations.find((integration) => integration.provider === "meta");
  const selectedAssets = data.connectedAssets.filter((asset) => asset.isSelected);
  const lastLog = data.syncLogs[0];

  return (
    <section className="grid grid-2">
      <Card>
        <CardHeader
          title="Campañas activas"
          description={data.campaigns.length ? "Actividad conectada" : "Sin datos"}
          action={<StatusBadge status={data.campaigns.length ? "active" : "pending"} />}
        />
        <div className="mt-5 grid gap-3">
          {data.campaigns.length ? (
            <>
              <div className="grid grid-2">
                <SmallDashboardStat label="Inversion" value={formatCurrency(campaignTotals.spend)} />
                <SmallDashboardStat label="Impresiones" value={formatCompactNumber(campaignTotals.impressions)} />
                <SmallDashboardStat label="Clics" value={formatNumber(campaignTotals.clicks)} />
                <SmallDashboardStat label="Leads" value={formatNumber(campaignTotals.leads)} />
                <SmallDashboardStat label="Mensajes" value={formatNumber(campaignTotals.messages)} />
                <SmallDashboardStat label="Conversiones" value={formatNumber(campaignTotals.conversions)} />
              </div>
              <div className="list-item">
                <div className="list-item-main">
                  <strong>{bestCampaign?.name ?? "Sin campaña destacada"}</strong>
                  <span>Mejor campaña por leads y gasto real.</span>
                </div>
                <span className="badge badge-blue">
                  {formatNumber(bestCampaign?.leads ?? 0)} leads
                </span>
              </div>
            </>
          ) : (
            <DashboardEmpty title="No hay campañas visibles" text="Cuando haya campañas activas aparecerán aquí." />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Contenido publicado"
          description={data.content.length ? "Facebook e Instagram" : "Sin datos"}
          action={<StatusBadge status={data.content.length ? "published" : "pending"} />}
        />
        <div className="mt-5 grid gap-3">
          {data.content.length ? (
            <>
              <div className="grid grid-2">
                <SmallDashboardStat label="Piezas" value={formatNumber(data.content.length)} />
                <SmallDashboardStat label="Alcance" value={formatCompactNumber(contentTotals.reach)} />
                <SmallDashboardStat label="Impresiones" value={formatCompactNumber(contentTotals.impressions)} />
                <SmallDashboardStat label="Vistas/plays" value={formatCompactNumber(contentTotals.views)} />
                <SmallDashboardStat label="Interacciones" value={formatNumber(contentTotals.likes + contentTotals.comments + contentTotals.shares + contentTotals.saves)} />
              </div>
              <div className="list-item">
                <div className="list-item-main">
                  <strong>{bestContent?.title ?? "Sin contenido destacado"}</strong>
                  <span>Mejor contenido por engagement.</span>
                </div>
                <span className="badge badge-green">
                  {formatPercent(bestContent?.engagementRate ?? 0)}
                </span>
              </div>
            </>
          ) : (
            <DashboardEmpty title="No hay contenido sincronizado" text="Los reels/posts apareceran cuando Meta permita leerlos." />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Leads y eventos"
          description={data.leadEvents.length ? "Entradas reales" : "Sin eventos"}
          action={<MessageCircle size={22} />}
        />
        <div className="mt-5 list">
          {data.leadEvents.length ? (
            data.leadEvents.slice(0, 4).map((event) => (
              <div className="list-item" key={event.id}>
                <div className="list-item-main">
                  <strong>{event.contactName ?? "Lead sin nombre"}</strong>
                  <span>
                    {event.provider} · {event.channel} · {formatDateShort(event.occurredAt)}
                  </span>
                </div>
                <span className="badge badge-blue">Entrada</span>
              </div>
            ))
          ) : (
            <DashboardEmpty title="Sin leads sincronizados todavía" text="Los eventos de formularios, mensajes o conversiones entraran por Meta/WhatsApp." />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Integraciones"
          description={meta?.status === "connected" ? "Datos conectados" : "Pendiente"}
          action={<StatusBadge status={meta?.status ?? "pending"} />}
        />
        <div className="mt-5 list">
          <div className="list-item">
            <div className="list-item-main">
              <strong>{meta?.externalAccountName ?? meta?.providerUserName ?? "Fuente pendiente"}</strong>
              <span>
                {meta?.lastSyncAt
                  ? `Ultima sincronizacion: ${formatDateShort(meta.lastSyncAt)}`
                  : "Datos manuales o sincronizacion pendiente"}
              </span>
            </div>
            <span className="badge badge-gray">
              {formatNumber(selectedAssets.length)} activos
            </span>
          </div>
          {lastLog ? (
            <div className="list-item">
              <div className="list-item-main">
                <strong>Ultimo job: {lastLog.provider}</strong>
                <span>{lastLog.errorMessage ?? formatDateShort(lastLog.startedAt)}</span>
              </div>
              <StatusBadge status={lastLog.status} />
            </div>
          ) : null}
          {meta?.errorMessage ? (
            <div className="notice-card">
              <strong>Ultimo error</strong>
              <span className="mt-2 block text-sm text-[#d92d20]">
                {meta.errorMessage}
              </span>
            </div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

function SmallDashboardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="small-stat">
      <span className="metric-label">{label}</span>
      <strong className="block text-[1.35rem] leading-tight">{value}</strong>
    </div>
  );
}

function DashboardEmpty({ title, text }: { title: string; text: string }) {
  return (
    <div className="notice-card">
      <strong>{title}</strong>
      <span className="mt-2 block text-sm text-[#6e6e73]">{text}</span>
    </div>
  );
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function AdminDashboard({ data }: { data: PortalData }) {
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextTask = data.tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  const nextEvents = data.calendarEvents
    .filter((event) => new Date(event.startAt).getTime() >= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  const nextEvent = nextEvents[0];
  const pendingApprovals = data.content.filter(
    (item) => item.status === "pending_approval"
  );
  const productionPending = data.content.filter((item) =>
    ["idea", "recorded", "editing", "pending_approval"].includes(item.status)
  );
  const invoicesToWatch = data.invoices
    .filter((invoice) => {
      if (["paid", "cancelled"].includes(invoice.status)) return false;
      const due = new Date(invoice.dueDate);
      const days = daysBetween(now, due);

      return invoice.status === "overdue" || days <= 14;
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  const nextEventClient = nextEvent
    ? data.clients.find((client) => client.id === nextEvent.clientId)
    : null;
  const nextInvoiceTotal = invoicesToWatch.reduce(
    (sum, invoice) => sum + invoice.total,
    0
  );
  const weekAgenda = nextEvents.filter(
    (event) => new Date(event.startAt).getTime() <= weekEnd.getTime()
  );

  return (
    <div className="grid">
      <section className="grid grid-4">
        <OperationalCard
          icon={CheckCircle2}
          label="Próxima tarea"
          title={nextTask?.title ?? "Sin tarea urgente"}
          text={
            nextTask
              ? `Vence ${nextTask.dueDate}`
              : "No hay tareas abiertas pendientes."
          }
          tone="blue"
          badge={nextTask?.status ?? "ok"}
          href={nextTask ? `/admin/clients/${nextTask.clientId}` : "/admin/clients"}
        />
        <OperationalCard
          icon={CalendarClock}
          label="Próximo evento"
          title={nextEvent?.title ?? "Sin evento próximo"}
          text={
            nextEvent
              ? `${nextEventClient?.publicName ?? "Firekworks"} · ${formatDateShort(
                  nextEvent.startAt
                )}`
              : "Agenda limpia."
          }
          tone="mint"
          badge={nextEvent?.status ?? "ok"}
          href="/admin/calendar"
        />
        <OperationalCard
          icon={FileBarChart}
          label="Contenido pendiente"
          title={`${productionPending.length} pieza${
            productionPending.length === 1 ? "" : "s"
          }`}
          text={productionPending[0]?.title ?? "Producción al día."}
          tone="orange"
          badge={pendingApprovals.length ? `${pendingApprovals.length} revisar` : "sin bloqueo"}
          href="/admin/calendar"
        />
        <OperationalCard
          icon={ReceiptText}
          label="Cobros próximos"
          title={invoicesToWatch.length ? formatCurrency(nextInvoiceTotal) : "0 €"}
          text={
            invoicesToWatch[0]
              ? `${invoicesToWatch[0].invoiceNumber} · vence ${formatDateShort(
                  invoicesToWatch[0].dueDate
                )}`
              : "No hay cobros urgentes en los próximos 14 días."
          }
          tone="red"
          badge={invoicesToWatch[0]?.status ?? "ok"}
          href="/admin/clients"
        />
      </section>

      <section className="grid grid-2">
        <Card>
          <CardHeader
            title="Agenda de la semana"
            description="Próximos 5"
            action={
              <ButtonLink href="/admin/calendar" variant="ghost">
                Ver calendario
                <ArrowRight size={15} />
              </ButtonLink>
            }
          />
          <div className="mt-5 list">
            {weekAgenda.length ? (
              weekAgenda.slice(0, 5).map((event) => {
                const client = data.clients.find((item) => item.id === event.clientId);

                return (
                  <div className="list-item" key={event.id}>
                    <div className="list-item-main">
                      <strong>{event.title}</strong>
                      <span>
                        {client?.publicName ?? "Firekworks"} · {formatDateShort(event.startAt)}
                      </span>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                );
              })
            ) : (
              <DashboardEmpty title="Semana limpia" text="No hay eventos próximos." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Accesos rápidos" description="Crear" />
          <div className="quick-actions">
            <ButtonLink href="/admin/clients">
              <UserPlus size={16} />
              Nuevo cliente
            </ButtonLink>
            <ButtonLink href="/admin/calendar" variant="secondary">
              <CalendarClock size={16} />
              Crear evento
            </ButtonLink>
            <ButtonLink href="/admin/demos" variant="ghost">
              Ver demos
            </ButtonLink>
          </div>
        </Card>
      </section>
    </div>
  );
}

function OperationalCard({
  icon: Icon,
  label,
  title,
  text,
  tone,
  badge,
  href
}: {
  icon: typeof CalendarClock;
  label: string;
  title: string;
  text: string;
  tone: "blue" | "mint" | "orange" | "red";
  badge: string;
  href: string;
}) {
  const toneClass = {
    blue: "ops-card-blue",
    mint: "ops-card-mint",
    orange: "ops-card-orange",
    red: "ops-card-red"
  }[tone];

  return (
    <Card className={`ops-card ${toneClass}`}>
      <div className="ops-card-top">
        <span className="metric-label">{label}</span>
        <span className="ops-card-icon">
          <Icon size={21} />
        </span>
      </div>
      <strong>{title}</strong>
      <p>{text}</p>
      <footer className="metric-foot">
        <span className="badge badge-gray">{badge}</span>
        <ButtonLink href={href} variant="ghost">
          Abrir
          <ArrowRight size={15} />
        </ButtonLink>
      </footer>
    </Card>
  );
}

function daysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
}

export function RetentionValue({ data }: { data: PortalData }) {
  const client = data.selectedClient;
  const months =
    (new Date().getFullYear() - new Date(client.onboardedAt).getFullYear()) *
      12 +
    new Date().getMonth() -
    new Date(client.onboardedAt).getMonth() +
    1;
  const totalReach = data.metrics.reduce((sum, item) => sum + item.reach, 0);
  const totalLeads = data.metrics.reduce((sum, item) => sum + item.leads, 0);
  const totalReturn = data.metrics.reduce(
    (sum, item) => sum + item.estimatedRevenue,
    0
  );

  return (
    <section className="grid grid-4">
      <MetricCard
        icon={CalendarClock}
        label="Meses trabajando"
        value={String(Math.max(months, 1))}
        helper="Historico conservado"
        tone="blue"
      />
      <MetricCard
        icon={Sparkles}
        label="Contenido publicado"
        value={String(data.content.length)}
        helper="Piezas registradas"
        tone="mint"
      />
      <MetricCard
        icon={MessageCircle}
        label="Leads acumulados"
        value={formatNumber(totalLeads)}
        helper={formatCompactNumber(totalReach) + " alcance"}
        tone="green"
      />
      <MetricCard
        icon={TrendingUp}
        label="Retorno estimado"
        value={formatCurrency(totalReturn)}
        helper="Sujeto a ventas confirmadas"
        tone="orange"
      />
    </section>
  );
}
