import { IntegrationsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";
import {
  getIntegrationEnvChecklist,
  getIntegrationOverview
} from "@/lib/integrations/overview";

export default async function AdminIntegrationsPage() {
  const data = await getAdminPortalData();
  const overview = await getIntegrationOverview(data.clients.map((client) => client.id));

  return (
    <>
      <PageHeader
        eyebrow="Integraciones"
        title="APIs externas"
        description="Conecta cuentas externas, selecciona activos y sincroniza datos reales sin exponer tokens."
      />
      <IntegrationsModule
        assets={overview.assets}
        clients={data.clients}
        envChecklist={getIntegrationEnvChecklist()}
        integrations={overview.integrations}
      />
    </>
  );
}
