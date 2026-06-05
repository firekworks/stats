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
  Trophy,
  WalletCards
} from "lucide-react";
import { CampaignBars, MonthlyTrendChart } from "@/components/charts";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import {
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
  const score = data.scores.find(
    (item) => item.clientId === data.selectedClient.id
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
                <Trophy size={20} />
              </span>
              <div className="list-item-main">
                <strong>
                  Estado de colaboracion: {score?.levelName ?? "Partner"}
                </strong>
                <span>{score?.action ?? "Seguimiento activo."}</span>
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

export function AdminDashboard({ data }: { data: PortalData }) {
  const activeClients = data.clients.filter((client) => client.status === "active");
  const totalReach = data.metrics.reduce((sum, item) => sum + item.reach, 0);
  const totalLeads = data.metrics.reduce((sum, item) => sum + item.leads, 0);
  const totalManaged = data.metrics.reduce(
    (sum, item) => sum + item.totalInvestment,
    0
  );
  const campaignBars = data.campaigns.map((campaign) => ({
    name: campaign.name.split(" ").slice(0, 2).join(" "),
    leads: campaign.leads,
    spend: campaign.spend
  }));

  return (
    <div className="grid">
      <section className="grid grid-4">
        <MetricCard
          icon={Target}
          label="Clientes activos"
          value={String(activeClients.length)}
          helper={`${data.clients.length} en cartera`}
          tone="blue"
        />
        <MetricCard
          icon={Eye}
          label="Alcance gestionado"
          value={formatCompactNumber(totalReach)}
          helper="Ultimos registros mensuales"
          tone="mint"
        />
        <MetricCard
          icon={MessageCircle}
          label="Leads generados"
          value={formatNumber(totalLeads)}
          helper="Mensajes, leads y reservas"
          tone="green"
        />
        <MetricCard
          icon={WalletCards}
          label="Inversion gestionada"
          value={formatCurrency(totalManaged)}
          helper="Ads + fee + extras"
          tone="orange"
        />
      </section>

      <section className="split">
        <Card className="chart-card">
          <CardHeader title="Campañas por leads" description="Vista global" />
          <div className="chart-wrap">
            <CampaignBars data={campaignBars} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Alertas internas" description="Prioridad" />
          <div className="mt-5 list">
            {data.alerts.map((alert) => {
              const client = data.clients.find((item) => item.id === alert.clientId);

              return (
                <div className="list-item" key={alert.id}>
                  <div className="list-item-main">
                    <strong>{alert.title}</strong>
                    <span>{client?.publicName ?? "Cliente"}</span>
                  </div>
                  <span
                    className={`badge ${
                      alert.severity === "warning"
                        ? "badge-orange"
                        : alert.severity === "critical"
                          ? "badge-red"
                          : alert.severity === "success"
                            ? "badge-green"
                            : "badge-blue"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid grid-3">
        {data.clients.map((client) => {
          const metric = data.metrics.find((item) => item.clientId === client.id);
          const score = data.scores.find((item) => item.clientId === client.id);

          return (
            <Card key={client.id}>
              <CardHeader
                title={client.publicName}
                description={client.industry}
                action={<StatusBadge status={client.status} />}
              />
              <div className="mt-5 grid gap-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-[#6e6e73]">
                    <span>Firekworks Level</span>
                    <strong>{score?.levelName}</strong>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${score?.score ?? 50}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-2">
                  <div>
                    <span className="metric-label">Alcance</span>
                    <strong className="block text-2xl">
                      {formatCompactNumber(metric?.reach ?? 0)}
                    </strong>
                  </div>
                  <div>
                    <span className="metric-label">Leads</span>
                    <strong className="block text-2xl">
                      {formatNumber(metric?.leads ?? 0)}
                    </strong>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
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
