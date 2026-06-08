import { PageHeader } from "@/components/ui";
import { ClientInternalDetail } from "@/components/workflow-modules";
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
    reports: data.reports.filter((item) => item.clientId === client.id),
    invoices: data.invoices.filter((item) => item.clientId === client.id),
    alerts: data.alerts.filter((item) => item.clientId === client.id),
    tasks: data.tasks.filter((item) => item.clientId === client.id),
    calendarEvents: data.calendarEvents.filter((item) => item.clientId === client.id)
  };

  return (
    <>
      <PageHeader
        eyebrow="Cliente"
        title={client.publicName}
        description="Ficha interna con metricas, campanas, contenido e informes."
      />
      <ClientInternalDetail data={clientData} />
    </>
  );
}
