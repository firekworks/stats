import { LeaderboardsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminLeaderboardsPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Leaderboards"
        title="Rankings globales"
        description="Gamificacion con privacidad por defecto y nombres publicos opcionales."
      />
      <LeaderboardsModule entries={data.leaderboards} admin />
    </>
  );
}
