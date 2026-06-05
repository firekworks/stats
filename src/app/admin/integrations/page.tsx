import { IntegrationsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";

export default function AdminIntegrationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Integraciones"
        title="APIs externas"
        description="Preparado para Meta Ads, Instagram Graph, Facebook Pages, WhatsApp Cloud y Google Business Profile."
      />
      <IntegrationsModule />
    </>
  );
}
