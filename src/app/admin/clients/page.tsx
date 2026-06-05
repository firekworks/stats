import { ClientsModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminClientsPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Clientes"
        title="Cartera de clientes"
        description="Clientes, planes, estado, nivel de colaboracion y rendimiento reciente."
      />
      <ClientsModule data={data} />
    </>
  );
}
