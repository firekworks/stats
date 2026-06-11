import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  ExternalLink,
  FileText,
  LockKeyhole,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Unplug,
  UploadCloud
} from "lucide-react";
import { IntegrationAssetSelector } from "@/components/integration-asset-selector";
import { IntegrationActionButton } from "@/components/integration-action-button";
import { ClientsHub } from "@/components/clients-hub";
import { ButtonLink, Card, CardHeader, StatusBadge } from "@/components/ui";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import {
  formatCurrency,
  formatDecimal,
  formatMonth,
  formatNumber,
  formatPercent,
  statusLabel
} from "@/lib/format";
import type {
  ConnectedAssetOverviewRow,
  IntegrationEnvGroup,
  IntegrationOverviewRow
} from "@/lib/integrations/overview";
import type {
  Campaign,
  Client,
  ClientScore,
  ContentItem,
  Invoice,
  LeaderboardEntry,
  MonthlyMetric,
  PortalData,
  Report,
  Task
} from "@/lib/types";

export function CampaignsModule({
  campaigns,
  admin = false
}: {
  campaigns: Campaign[];
  admin?: boolean;
}) {
  if (!campaigns.length) {
    return (
      <Card>
        <CardHeader
          title="Campañas"
          description={admin ? "Gestion interna" : "Actividad actual"}
          action={admin ? <span className="badge badge-gray">Sin datos</span> : null}
        />
        <EmptyState
          title="No hay campañas conectadas"
          text="Conecta Meta o crea una campaña planificada para empezar a ver rendimiento real."
        />
      </Card>
    );
  }

  return (
    <Card className="table-card">
      <div className="p-[22px]">
        <CardHeader
          title="Campañas"
          description={admin ? "Gestion interna" : "Actividad actual"}
          action={
            admin ? (
              <button className="button" type="button">
                <Plus size={17} />
                Campaña
              </button>
            ) : null
          }
        />
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Plataforma</th>
              <th>Objetivo</th>
              <th>Presupuesto</th>
              <th>Gasto</th>
              <th>Estado</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>CPM</th>
              <th>Leads</th>
              <th>Mensajes</th>
              <th>Conversiones</th>
              <th>CPL</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <strong>{campaign.name}</strong>
                  <span className="block text-[#6e6e73]">
                    {campaign.visibleSummary}
                  </span>
                </td>
                <td>{campaign.platform}</td>
                <td>{campaign.objective}</td>
                <td>{formatCurrency(campaign.budget)}</td>
                <td>{formatCurrency(campaign.spend)}</td>
                <td>
                  <StatusBadge status={campaign.status} />
                </td>
                <td>{formatPercent(campaign.ctr)}</td>
                <td>{formatCurrency(campaign.cpc)}</td>
                <td>{formatCurrency(campaign.cpm)}</td>
                <td>{formatNumber(campaign.leads)}</td>
                <td>{formatNumber(campaign.messages ?? 0)}</td>
                <td>{formatNumber(campaign.conversions ?? 0)}</td>
                <td>{formatCurrency(campaign.costPerLead)}</td>
                <td>
                  {campaign.roas ? `${formatDecimal(campaign.roas, 2)}x` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ContentModule({
  content,
  admin = false
}: {
  content: ContentItem[];
  admin?: boolean;
}) {
  if (!content.length) {
    return (
      <Card>
        <CardHeader
          title="Contenido"
          description={admin ? "Biblioteca interna" : "Entregas"}
          action={<span className="badge badge-gray">Sin datos</span>}
        />
        <EmptyState
          title="No hay contenido sincronizado"
          text="Cuando se publiquen reels, posts o carruseles conectados apareceran aqui."
        />
      </Card>
    );
  }

  return (
    <section className="grid grid-3">
      {content.map((item) => (
        <Card key={item.id}>
          <div className="content-preview">
            <strong>{item.title}</strong>
          </div>
          <div className="mt-5 grid gap-3">
            <CardHeader
              title={item.type}
              description={`${item.platform} · ${item.publishDate}`}
              action={<StatusBadge status={item.status} />}
            />
            <div className="grid grid-2">
              <SmallStat label="Alcance" value={formatNumber(item.reach)} />
              <SmallStat label="Vistas/plays" value={formatNumber(item.views || item.plays || 0)} />
              <SmallStat label="Engagement" value={formatPercent(item.engagementRate)} />
              <SmallStat label="Guardados" value={formatNumber(item.saves)} />
            </div>
            <p className="m-0 text-sm text-[#6e6e73]">{item.learning}</p>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-blue">{item.performance}</span>
              {item.reusable ? (
                <span className="badge badge-green">Reutilizable</span>
              ) : null}
              {admin ? <span className="badge badge-gray">Storage listo</span> : null}
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}

export function MetricsModule({ metrics }: { metrics: MonthlyMetric[] }) {
  if (!metrics.length) {
    return (
      <Card>
        <CardHeader title="Metricas mensuales" description="Historico" />
        <EmptyState
          title="Sin datos sincronizados todavía"
          text="La evolución mensual se completara cuando haya metricas reales de campañas, contenido o carga manual."
        />
      </Card>
    );
  }

  return (
    <Card className="table-card">
      <div className="p-[22px]">
        <CardHeader title="Metricas mensuales" description="Historico" />
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Alcance</th>
              <th>Impresiones</th>
              <th>Mensajes</th>
              <th>Leads</th>
              <th>Reservas</th>
              <th>Ads</th>
              <th>Fee</th>
              <th>ROI</th>
              <th>Modo ROI</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.id}>
                <td>{formatMonth(metric.month, metric.year)}</td>
                <td>{formatNumber(metric.reach)}</td>
                <td>{formatNumber(metric.impressions)}</td>
                <td>{formatNumber(metric.messages)}</td>
                <td>{formatNumber(metric.leads)}</td>
                <td>{formatNumber(metric.bookings)}</td>
                <td>{formatCurrency(metric.adSpend)}</td>
                <td>{formatCurrency(metric.serviceFee)}</td>
                <td>
                  {metric.estimatedRoi
                    ? `${formatDecimal(metric.estimatedRoi, 2)}x`
                    : "Sin datos"}
                </td>
                <td>
                  <span className="badge badge-gray">{metric.roiMode}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ReportsModule({
  reports,
  clientId,
  admin = false
}: {
  reports: Report[];
  clientId: string;
  admin?: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title="Informes PDF"
        description={admin ? "Generacion mensual" : "Descargas"}
        action={
          <PdfDownloadButton
            href={`/api/admin/reports/monthly/pdf?clientId=${clientId}`}
            label={admin ? "Generar informe mensual" : "Descargar informe"}
          />
        }
      />
      <div className="mt-5 list">
        {reports.length ? (
          reports.map((report) => (
            <div className="list-item" key={report.id}>
              <FileText size={22} />
              <div className="list-item-main">
                <strong>{report.title}</strong>
                <span>{formatMonth(report.month, report.year)}</span>
              </div>
              <StatusBadge status={report.status} />
            </div>
          ))
        ) : (
          <EmptyState
            title="Sin informes generados"
            text="Genera el primer informe cuando haya metricas reales del periodo."
          />
        )}
      </div>
    </Card>
  );
}

export function InvoicesModule({
  invoices,
  admin = false
}: {
  invoices: Invoice[];
  admin?: boolean;
}) {
  if (!invoices.length) {
    return (
      <Card>
        <CardHeader
          title="Facturas"
          description={admin ? "Modulo interno" : "Facturacion"}
          action={admin ? <span className="badge badge-gray">Sin datos</span> : null}
        />
        <EmptyState
          title="Sin facturas"
          text="Las facturas apareceran aqui cuando se creen desde el modulo interno."
        />
      </Card>
    );
  }

  return (
    <Card className="table-card">
      <div className="p-[22px]">
        <CardHeader
          title="Facturas"
          description={admin ? "Modulo interno" : "Facturacion"}
          action={
            admin ? (
              <button className="button" type="button">
                <Plus size={17} />
                Factura
              </button>
            ) : null
          }
        />
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Emision</th>
              <th>Vencimiento</th>
              <th>Base</th>
              <th>IVA</th>
              <th>Retencion</th>
              <th>Total</th>
              <th>Estado</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <strong>{invoice.invoiceNumber}</strong>
                  <span className="block text-[#6e6e73]">
                    {invoice.paymentMethod}
                  </span>
                </td>
                <td>{invoice.issueDate}</td>
                <td>{invoice.dueDate}</td>
                <td>{formatCurrency(invoice.taxableBase)}</td>
                <td>{formatPercent(invoice.vatRate)}</td>
                <td>{formatPercent(invoice.withholdingRate)}</td>
                <td>{formatCurrency(invoice.total)}</td>
                <td>
                  <StatusBadge status={invoice.status} />
                </td>
                <td>
                  <PdfDownloadButton
                    href={`/api/admin/invoices/${invoice.id}/pdf`}
                    label="PDF"
                    variant="secondary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function LeaderboardsModule({
  entries,
  admin = false
}: {
  entries: LeaderboardEntry[];
  admin?: boolean;
}) {
  const categories = Array.from(new Set(entries.map((entry) => entry.category)));

  return (
    <section className="grid grid-2">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader
            title={category}
            description={admin ? "Global" : "Anonimizado"}
            action={<Trophy size={22} />}
          />
          <div className="mt-5 list">
            {entries
              .filter((entry) => entry.category === category)
              .sort((a, b) => a.rank - b.rank)
              .map((entry) => (
                <div
                  className={`list-item ${
                    entry.isCurrentClient ? "border-[#0071e3]" : ""
                  }`}
                  key={entry.id}
                >
                  <span className="metric-icon bg-[rgba(0,113,227,0.1)] text-[#0071e3]">
                    #{entry.rank}
                  </span>
                  <div className="list-item-main">
                    <strong>{entry.displayName}</strong>
                    <span>{entry.metricLabel}</span>
                  </div>
                  {entry.isCurrentClient ? (
                    <span className="badge badge-blue">Tu posicion</span>
                  ) : null}
                </div>
              ))}
          </div>
        </Card>
      ))}
    </section>
  );
}

export function ScoreModule({
  scores,
  clients
}: {
  scores: ClientScore[];
  clients: Client[];
}) {
  return (
    <section className="grid grid-3">
      {scores.map((score) => {
        const client = clients.find((item) => item.id === score.clientId);

        return (
          <Card key={score.clientId}>
            <CardHeader
              title={client?.publicName ?? "Cliente"}
              description="Client Score"
              action={<span className="badge badge-blue">{score.levelName}</span>}
            />
            <div className="mt-5 grid gap-4">
              <strong className="metric-value">{score.score}</strong>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${score.score}%` }} />
              </div>
              <ScoreRow label="Comunicacion" value={score.communication} />
              <ScoreRow label="Rapidez aprobando" value={score.approvalsSpeed} />
              <ScoreRow label="Facilidad de trabajo" value={score.collaboration} />
              <ScoreRow label="Rentabilidad" value={score.profitability} />
              <ScoreRow label="Potencial de crecimiento" value={score.growth} />
              <ScoreRow label="Riesgo de baja" value={score.churnRisk} inverted />
              <p className="m-0 text-sm text-[#6e6e73]">{score.action}</p>
            </div>
          </Card>
        );
      })}
    </section>
  );
}

export function NextStepsModule({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardHeader title="Proximos pasos" description="Acciones coordinadas" />
      <div className="mt-5 list">
        {tasks
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
  );
}

export function IntegrationsModule({
  clients,
  integrations,
  assets,
  envChecklist
}: {
  clients: Client[];
  integrations: IntegrationOverviewRow[];
  assets: ConnectedAssetOverviewRow[];
  envChecklist: IntegrationEnvGroup[];
}) {
  return (
    <div className="grid gap-6">
      <section className="grid grid-2">
        <Card>
          <CardHeader
            title="Conectores"
            description="APIs externas"
            action={<Cable size={22} />}
          />
          <div className="mt-5 list">
            {envChecklist.map((group) => (
              <ConnectorStatus
                key={group.id}
                missing={group.missing}
                optional={group.optional}
                ready={group.ready}
                required={group.required}
                text={group.description}
                title={group.title}
              />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Seguridad" description="Tokens y API keys" />
          <div className="mt-5 list">
            <SecurityItem
              icon={<ShieldCheck size={21} />}
              title="Tokens cifrados"
              text="Los access tokens se cifran con AES-256-GCM usando ENCRYPTION_KEY."
            />
            <SecurityItem
              icon={<UploadCloud size={21} />}
              title="Backend seguro"
              text="Las llamadas a APIs externas pasan por Route Handlers o cron server-side."
            />
            <SecurityItem
              icon={<AlertTriangle size={21} />}
              title="Sin metricas inventadas"
              text="Los dashboards solo agregan datos importados o datos manuales existentes."
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-5">
        {clients.length ? (
          clients.map((client) => (
            <IntegrationClientCard
              assets={assets.filter((asset) => asset.clientId === client.id)}
              client={client}
              integrations={integrations.filter(
                (integration) => integration.clientId === client.id
              )}
              key={client.id}
            />
          ))
        ) : (
          <Card>
            <EmptyState
              title="No hay clientes reales"
              text="Crea un cliente en Stats antes de conectar activos de Meta."
            />
          </Card>
        )}
      </section>
    </div>
  );
}

function IntegrationClientCard({
  client,
  integrations,
  assets
}: {
  client: Client;
  integrations: IntegrationOverviewRow[];
  assets: ConnectedAssetOverviewRow[];
}) {
  const meta = integrations.find((integration) => integration.provider === "meta");
  const google = integrations.find(
    (integration) => integration.provider === "google_business"
  );
  const whatsapp = integrations.find(
    (integration) => integration.provider === "whatsapp"
  );

  return (
    <Card>
      <CardHeader
        title={client.publicName}
        description={`${client.industry} · ${client.city}`}
        action={<StatusBadge status={client.status} />}
      />
      <div className="mt-5 grid gap-4">
        <IntegrationProviderRow
          clientId={client.id}
          integration={meta}
          assets={assets.filter((asset) => asset.provider === "meta")}
          provider="meta"
          title="Meta"
          text="Ads, Instagram y Facebook Pages"
        />
        <IntegrationProviderRow
          clientId={client.id}
          integration={google}
          assets={assets.filter((asset) => asset.provider === "google_business")}
          provider="google_business"
          title="Google Calendar / Drive"
          text="Calendario, Drive y Business Profile"
        />
        <IntegrationProviderRow
          clientId={client.id}
          integration={whatsapp}
          assets={assets.filter((asset) => asset.provider === "whatsapp")}
          provider="whatsapp"
          title="WhatsApp"
          text="Mensajes y conversaciones por webhook"
        />
      </div>
    </Card>
  );
}

function IntegrationProviderRow({
  clientId,
  integration,
  assets,
  provider,
  title,
  text
}: {
  clientId: string;
  integration?: IntegrationOverviewRow;
  assets: ConnectedAssetOverviewRow[];
  provider: "meta" | "google_business" | "whatsapp";
  title: string;
  text: string;
}) {
  const connected = integration?.status === "connected";

  return (
    <div className="list-item">
      <span
        className={`metric-icon ${
          connected
            ? "bg-[rgba(47,158,68,0.1)] text-[#2f9e44]"
            : "bg-[rgba(110,110,115,0.1)] text-[#6e6e73]"
        }`}
      >
        {connected ? <CheckCircle2 size={20} /> : <LockKeyhole size={20} />}
      </span>
      <div className="list-item-main">
        <strong>{title}</strong>
        <span>{providerStatusText(integration, text)}</span>
        {assets.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {assets.slice(0, 5).map((asset) => (
              <span
                className={asset.isSelected ? "badge badge-blue" : "badge badge-gray"}
                key={asset.id}
              >
                {assetLabel(asset)}
              </span>
            ))}
            {assets.length > 5 ? (
              <span className="badge badge-gray">+{assets.length - 5}</span>
            ) : null}
          </div>
        ) : null}
        {integration?.errorMessage ? (
          <span className="mt-2 block text-sm text-[#d92d20]">
            {integration.errorMessage}
          </span>
        ) : null}
        {provider === "meta" && connected ? (
          <IntegrationAssetSelector assets={assets} clientId={clientId} />
        ) : null}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {provider === "meta" ? (
          <>
            <ButtonLink href={`/api/integrations/meta/start?clientId=${clientId}`}>
              <ExternalLink size={16} />
              {connected ? "Reconectar" : "Conectar"}
            </ButtonLink>
            {connected ? (
              <>
                <IntegrationActionButton
                  endpoint="/api/integrations/meta/assets"
                  body={{ clientId, refresh: true }}
                  label="Activos"
                />
                <IntegrationActionButton
                  endpoint="/api/integrations/meta/sync"
                  body={{ clientId, mode: "all" }}
                  label="Sync"
                />
                <IntegrationActionButton
                  endpoint="/api/integrations/meta/disconnect"
                  body={{ clientId }}
                  label="Desconectar"
                  variant="ghost"
                />
              </>
            ) : null}
          </>
        ) : null}
        {provider === "google_business" ? (
          <ButtonLink href={`/api/integrations/google/start?clientId=${clientId}`} variant="secondary">
            <ExternalLink size={16} />
            {connected ? "Reconectar" : "Conectar"}
          </ButtonLink>
        ) : null}
        {provider === "whatsapp" ? (
          connected ? (
            <IntegrationActionButton
              endpoint="/api/integrations/whatsapp/disconnect"
              body={{ clientId }}
              label="Desconectar"
              variant="ghost"
            />
          ) : (
            <span className="badge badge-gray">Preparado</span>
          )
        ) : null}
      </div>
    </div>
  );
}

function ConnectorStatus({
  title,
  text,
  ready = false,
  required = [],
  optional = [],
  missing = []
}: {
  title: string;
  text: string;
  ready?: boolean;
  required?: string[];
  optional?: string[];
  missing?: string[];
}) {
  return (
    <div className="list-item">
      <span
        className={`metric-icon ${
          ready
            ? "bg-[rgba(0,113,227,0.1)] text-[#0071e3]"
            : "bg-[rgba(110,110,115,0.1)] text-[#6e6e73]"
        }`}
      >
        {ready ? <RefreshCw size={20} /> : <Unplug size={20} />}
      </span>
      <div className="list-item-main">
        <strong>{title}</strong>
        <span>{text}</span>
        <span className="mt-2 block text-sm">
          {missing.length
            ? `Faltan: ${missing.join(", ")}`
            : required.length
              ? `Requeridas listas: ${required.join(", ")}`
              : "No requiere credenciales para operar ahora."}
        </span>
        {optional.length ? (
          <span className="mt-1 block text-sm text-[#6e6e73]">
            Opcionales: {optional.join(", ")}
          </span>
        ) : null}
      </div>
      <span className={ready ? "badge badge-blue" : "badge badge-gray"}>
        {ready ? "Configurado" : "Pendiente de configurar"}
      </span>
    </div>
  );
}

function providerStatusText(
  integration: IntegrationOverviewRow | undefined,
  fallback: string
) {
  if (!integration) {
    return fallback;
  }

  const account = integration.externalAccountName ?? integration.providerUserName;
  const lastSync = integration.lastSyncAt
    ? ` · sync ${formatDateShort(integration.lastSyncAt)}`
    : "";

  return `${statusLabel(integration.status)}${account ? ` · ${account}` : ""}${lastSync}`;
}

function assetLabel(asset: ConnectedAssetOverviewRow) {
  const selected = asset.isSelected ? "seleccionado" : asset.status;
  return `${asset.name} · ${asset.assetType.replace(/_/g, " ")} · ${selected}`;
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function ClientsModule({ data }: { data: PortalData }) {
  return <ClientsHub data={data} />;
}

function nextClientTask(tasks: Task[], clientId: string) {
  return tasks
    .filter((task) => task.clientId === clientId && task.status !== "done")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0];
}

function nextClientEvent(events: PortalData["calendarEvents"], clientId: string) {
  const now = new Date().getTime();

  return events
    .filter(
      (event) =>
        event.clientId === clientId && new Date(event.startAt).getTime() >= now
    )
    .sort(
      (a, b) =>
        new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
}

function latestClientInvoice(invoices: Invoice[], clientId: string) {
  return invoices
    .filter((invoice) => invoice.clientId === clientId)
    .sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    )[0];
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="small-stat">
      <span className="metric-label">{label}</span>
      <strong className="block text-[1.35rem] leading-tight">{value}</strong>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="notice-card">
      <strong>{title}</strong>
      <span className="mt-2 block text-sm text-[#6e6e73]">{text}</span>
    </div>
  );
}

function ScoreRow({
  label,
  value,
  inverted = false
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  const width = `${(value / 5) * 100}%`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-[#6e6e73]">
        <span>{label}</span>
        <strong>{value}/5</strong>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width,
            background: inverted
              ? "linear-gradient(90deg, #f97316, #d92d20)"
              : undefined
          }}
        />
      </div>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="list-item">
      <span className="metric-icon bg-[rgba(47,158,68,0.1)] text-[#2f9e44]">
        {icon}
      </span>
      <div className="list-item-main">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <CheckCircle2 size={18} />
    </div>
  );
}
