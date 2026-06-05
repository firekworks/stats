import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  LockKeyhole,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trophy,
  UploadCloud
} from "lucide-react";
import { ButtonLink, Card, CardHeader, StatusBadge } from "@/components/ui";
import {
  formatCurrency,
  formatDecimal,
  formatMonth,
  formatNumber,
  formatPercent
} from "@/lib/format";
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
              <SmallStat label="Vistas" value={formatNumber(item.views)} />
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
          <ButtonLink
            href={`/api/reports/monthly?clientId=${clientId}`}
            download
          >
            <Download size={17} />
            {admin ? "Generar informe mensual" : "Descargar informe"}
          </ButtonLink>
        }
      />
      <div className="mt-5 list">
        {reports.map((report) => (
          <div className="list-item" key={report.id}>
            <FileText size={22} />
            <div className="list-item-main">
              <strong>{report.title}</strong>
              <span>{formatMonth(report.month, report.year)}</span>
            </div>
            <StatusBadge status={report.status} />
          </div>
        ))}
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
                  <ButtonLink
                    href={`/api/invoices/${invoice.id}/pdf`}
                    variant="secondary"
                    download
                  >
                    <Download size={16} />
                    PDF
                  </ButtonLink>
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

export function IntegrationsModule() {
  const integrations = [
    {
      name: "Meta Ads",
      status: "Preparado",
      description: "Campañas, gasto, CTR, CPC, CPM y conversiones."
    },
    {
      name: "Instagram Graph API",
      status: "Preparado",
      description: "Reels, posts, alcance, interacciones y contenido."
    },
    {
      name: "Facebook Pages",
      status: "Preparado",
      description: "Contenido, mensajes, eventos y actividad de pagina."
    },
    {
      name: "WhatsApp Cloud API",
      status: "Preparado",
      description: "Mensajes, conversaciones y seguimiento comercial."
    },
    {
      name: "Google Business Profile",
      status: "Preparado",
      description: "Llamadas, clics, rutas, publicaciones y reseñas."
    }
  ];

  return (
    <section className="grid grid-2">
      <Card>
        <CardHeader
          title="Conexiones futuras"
          description="Backend seguro"
          action={<LockKeyhole size={22} />}
        />
        <div className="mt-5 list">
          {integrations.map((integration) => (
            <div className="list-item" key={integration.name}>
              <div className="list-item-main">
                <strong>{integration.name}</strong>
                <span>{integration.description}</span>
              </div>
              <span className="badge badge-blue">{integration.status}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Seguridad" description="Tokens y API keys" />
        <div className="mt-5 list">
          <SecurityItem
            icon={<ShieldCheck size={21} />}
            title="Tokens fuera del frontend"
            text="Las claves externas se guardan cifradas o en Supabase Vault y se consumen desde Edge Functions."
          />
          <SecurityItem
            icon={<UploadCloud size={21} />}
            title="Sin service_role en cliente"
            text="El service role queda limitado a rutas servidor y funciones internas."
          />
          <SecurityItem
            icon={<AlertTriangle size={21} />}
            title="Facturacion modular"
            text="La emision fiscal definitiva debe validarse con asesoria antes de produccion."
          />
        </div>
      </Card>
    </section>
  );
}

export function ClientsModule({ data }: { data: PortalData }) {
  return (
    <section className="grid grid-3">
      {data.clients.map((client) => {
        const metric = data.metrics.find((item) => item.clientId === client.id);
        const score = data.scores.find((item) => item.clientId === client.id);

        return (
          <Card key={client.id}>
            <CardHeader
              title={client.publicName}
              description={`${client.industry} · ${client.city}`}
              action={<StatusBadge status={client.status} />}
            />
            <div className="mt-5 grid gap-4">
              <SmallStat label="Plan" value={client.planName} />
              <SmallStat
                label="Fee mensual"
                value={formatCurrency(client.monthlyFee)}
              />
              <SmallStat
                label="Leads mes"
                value={formatNumber(metric?.leads ?? 0)}
              />
              <SmallStat label="Level" value={score?.levelName ?? "Nuevo"} />
              <ButtonLink href="/admin/clients" variant="secondary">
                <ExternalLink size={16} />
                Abrir ficha
              </ButtonLink>
            </div>
          </Card>
        );
      })}
    </section>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="metric-label">{label}</span>
      <strong className="block text-[1.35rem] leading-tight">{value}</strong>
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
