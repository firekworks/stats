import { LeaderboardsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientRankingPage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Ranking"
        title="Posicion local"
        description="Rankings anonimizados por defecto para comparar progreso sin exponer datos sensibles."
      />
      <LeaderboardsModule entries={data.leaderboards} />
    </>
  );
}
