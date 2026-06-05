import { ClientDashboard } from "@/components/dashboard";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientHomePage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Inicio"
        title={`Hola, ${data.selectedClient.publicName}`}
        description="Resultados claros, evolucion mensual y proximos pasos en un unico portal."
      />
      <ClientDashboard data={data} />
    </>
  );
}
