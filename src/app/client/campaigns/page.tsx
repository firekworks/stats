import { CampaignsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientCampaignsPage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Campañas"
        title="Campañas activas"
        description="Presupuesto, rendimiento, coste por lead y resumen visible de cada accion."
      />
      <CampaignsModule campaigns={data.campaigns} />
    </>
  );
}
