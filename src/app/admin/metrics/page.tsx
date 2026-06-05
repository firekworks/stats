import { MetricsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminMetricsPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Metricas"
        title="Carga mensual"
        description="Entrada manual de metricas preparada para integraciones futuras."
      />
      <MetricsModule metrics={data.metrics} />
    </>
  );
}
