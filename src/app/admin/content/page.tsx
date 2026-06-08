import { PageHeader } from "@/components/ui";
import { ContentWorkflowModule } from "@/components/workflow-modules";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminContentPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Contenido"
        title="Biblioteca interna"
        description="Piezas entregadas, rendimiento, aprendizajes y estado de aprobacion."
      />
      <ContentWorkflowModule
        admin
        campaigns={data.campaigns}
        clients={data.clients}
        content={data.content}
      />
    </>
  );
}
