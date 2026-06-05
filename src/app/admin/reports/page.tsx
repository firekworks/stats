import { ReportsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminReportsPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Informes"
        title="Generador PDF"
        description="Informes mensuales con portada, resumen, campañas, contenido, ROI y plan."
      />
      <ReportsModule
        reports={data.reports}
        clientId={data.selectedClient.id}
        admin
      />
    </>
  );
}
