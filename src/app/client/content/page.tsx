import { ContentModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientContentPage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Contenido"
        title="Biblioteca entregada"
        description="Reels, posts, carruseles, creatividades y aprendizajes de rendimiento."
      />
      <ContentModule content={data.content} />
    </>
  );
}
