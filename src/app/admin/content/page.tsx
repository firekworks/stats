import { ContentModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
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
      <ContentModule content={data.content} admin />
    </>
  );
}
