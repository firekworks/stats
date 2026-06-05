import { ReportsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientReportsPage() {
  const profile = await getCurrentProfile("client");
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Informes"
        title="Informes mensuales"
        description="PDFs profesionales con resumen ejecutivo, metricas, diagnostico y plan."
      />
      <ReportsModule reports={data.reports} clientId={data.selectedClient.id} />
    </>
  );
}
