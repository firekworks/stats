import { ScoreModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminClientScorePage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Client Score"
        title="Firekworks Level"
        description="Puntuacion interna ponderada por pago, aprobaciones, colaboracion, rentabilidad y riesgo."
      />
      <ScoreModule scores={data.scores} clients={data.clients} />
    </>
  );
}
