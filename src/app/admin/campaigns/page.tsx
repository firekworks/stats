import { PageHeader } from "@/components/ui";
import { CampaignWorkflowModule } from "@/components/workflow-modules";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminCampaignsPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Campañas"
        title="Gestion de campañas"
        description="Campañas de Meta Ads, Instagram, Facebook, GBP, WhatsApp y landings."
      />
      <CampaignWorkflowModule campaigns={data.campaigns} clients={data.clients} />
    </>
  );
}
