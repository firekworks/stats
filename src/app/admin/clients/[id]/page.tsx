import { CampaignsModule, ContentModule, MetricsModule, ReportsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminPortalData();
  const client = data.clients.find((item) => item.id === id) ?? data.selectedClient;
  const clientData = {
    ...data,
    selectedClient: client,
    metrics: data.metrics.filter((item) => item.clientId === client.id),
    campaigns: data.campaigns.filter((item) => item.clientId === client.id),
    content: data.content.filter((item) => item.clientId === client.id),
    reports: data.reports.filter((item) => item.clientId === client.id)
  };

  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title={client.publicName}
        description="Ficha interna con metricas, campanas, contenido e informes."
      />
      <div className="grid">
        <MetricsModule metrics={clientData.metrics} />
        <CampaignsModule campaigns={clientData.campaigns} admin />
        <ContentModule content={clientData.content} admin />
        <ReportsModule reports={clientData.reports} clientId={client.id} admin />
      </div>
    </>
  );
}
