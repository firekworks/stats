import { NextStepsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientNextStepsPage() {
  const profile = await getCurrentProfile("client");
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Próximos pasos"
        title="Plan de accion"
        description="Tareas compartidas para mantener la ejecucion sin bloqueos."
      />
      <NextStepsModule tasks={data.tasks} />
    </>
  );
}
