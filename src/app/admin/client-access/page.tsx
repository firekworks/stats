import { ClientAccessForm } from "@/components/client-access-form";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminClientAccessPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Accesos"
        title="Usuarios cliente"
        description="Crea accesos por usuario y contrasena sin exponer emails tecnicos ni datos internos."
      />
      <ClientAccessForm clients={data.clients} />
    </>
  );
}
