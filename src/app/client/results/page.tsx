import { RetentionValue } from "@/components/dashboard";
import { MetricsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientResultsPage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Resultados"
        title="Evolucion mensual"
        description="Metricas clave, ROI estimado y valor acumulado de la colaboracion."
      />
      <div className="grid">
        <RetentionValue data={data} />
        <MetricsModule metrics={data.metrics} />
      </div>
    </>
  );
}
