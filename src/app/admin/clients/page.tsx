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
        description="El hub principal: estado, próximo hito, resultado clave, informe, factura y portal."
      />
      <ClientsModule data={data} />
    </>
  );
}
