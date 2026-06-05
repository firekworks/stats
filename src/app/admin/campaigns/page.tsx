import { CampaignsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
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
      <CampaignsModule campaigns={data.campaigns} admin />
    </>
  );
}
