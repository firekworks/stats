import {
  Eye,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  TrendingUp
} from "lucide-react";
import { CampaignWorkflowModule, ContentWorkflowModule } from "@/components/workflow-modules";
import { ButtonLink, Card, CardHeader, MetricCard, PageHeader, StatusBadge } from "@/components/ui";
import { getDemoPortalDataBySlug } from "@/lib/data-access";
import {
  formatCompactNumber,
  formatCurrency,
  formatDecimal,
  formatNumber
} from "@/lib/format";
import { notFound } from "next/navigation";

export default async function DemoClientPortalPage({
  params
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const data = await getDemoPortalDataBySlug(clientSlug);

  if (!data) {
    notFound();
  }

  const client = data.selectedClient;
  const latest = data.metrics[0];

  return (
    <main className="main">
      <PageHeader
        eyebrow={client.demoLabel ?? "Demo Firekworks"}
        title={client.publicName}
        description="Portal público de demostración con datos ficticios. No muestra leads, prospección ni información de clientes reales."
      >
        <ButtonLink href="/login" variant="secondary">
          Entrar en Stats
        </ButtonLink>
      </PageHeader>

      <div className="grid">
        <Card>
          <CardHeader
            title="Datos ficticios para demostración"
            description={`${client.industry} · ${client.city}`}
            action={<StatusBadge status="active" />}
          />
          <p className="m-0 mt-4 max-w-[860px] text-[#6e6e73]">
            Esta vista enseña cómo un cliente de Firekworks vería métricas,
            campañas, contenido, próximos pasos y evolución mensual dentro de
            Stats. Los números no pertenecen a ningún negocio real.
          </p>
        </Card>

        <section className="grid grid-4">
          <MetricCard
            icon={Eye}
            label="Alcance"
            value={formatCompactNumber(latest?.reach ?? 0)}
            helper="Mes demo"
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
            label="Leads y mensajes"
            value={formatNumber(latest?.leads ?? 0)}
            helper={`${formatNumber(latest?.messages ?? 0)} mensajes`}
            tone="green"
          />
          <MetricCard
            icon={TrendingUp}
            label="ROI estimado"
            value={
              latest?.estimatedRoi
                ? `${formatDecimal(latest.estimatedRoi, 2)}x`
                : "Sin datos"
            }
            helper="Basado en ticket medio"
            tone="orange"
          />
        </section>

        <section className="split">
          <Card className="hero-result">
            <span className="metric-label">Resultado destacado</span>
            <strong className="metric-value">
              {formatCurrency(latest?.estimatedRevenue ?? 0)}
            </strong>
            <p>
              Retorno estimado a partir de oportunidades, reservas y ticket
              medio. Firekworks puede marcar ROI real cuando el cliente confirma ventas.
            </p>
          </Card>
          <Card>
            <CardHeader title="Próximas acciones" description="Plan visible" />
            <div className="mt-5 list">
              {data.tasks.slice(0, 4).map((task) => (
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
        </section>

        <ContentWorkflowModule
          campaigns={data.campaigns}
          clients={[client]}
          content={data.content}
        />
        <CampaignWorkflowModule campaigns={data.campaigns} clients={[client]} />

        <Card>
          <CardHeader title="Privacidad" description="Portal cliente" />
          <div className="mt-5 list">
            <div className="list-item">
              <MousePointerClick size={22} />
              <div className="list-item-main">
                <strong>Sin prospección ni Leads/Radar</strong>
                <span>El cliente solo ve sus propios resultados y rankings anonimizados.</span>
              </div>
            </div>
            <div className="list-item">
              <TrendingUp size={22} />
              <div className="list-item-main">
                <strong>ROI claramente marcado</strong>
                <span>Stats diferencia ROI estimado, real y datos insuficientes.</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
