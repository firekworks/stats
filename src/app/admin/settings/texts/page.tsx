import { AppTextsForm } from "@/components/app-texts-form";
import { PageHeader } from "@/components/ui";
import { getStatsEditableTexts } from "@/lib/app-texts";

export default async function AdminSettingsTextsPage() {
  const { entries, pendingMigration } = await getStatsEditableTexts();

  return (
    <>
      <PageHeader
        eyebrow="Ajustes"
        title="Textos del portal"
        description="Copy editable de Stats para login y mensajes visibles al cliente."
      />
      <AppTextsForm entries={entries} pendingMigration={pendingMigration} />
    </>
  );
}
