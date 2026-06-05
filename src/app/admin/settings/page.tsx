import { IntegrationsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ajustes"
        title="Seguridad y operativa"
        description="Politicas de sesion, roles, RLS, almacenamiento y preparacion fiscal."
      />
      <IntegrationsModule />
    </>
  );
}
