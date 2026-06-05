import { InvoicesModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminInvoicesPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Facturas"
        title="Facturacion simple"
        description="Modulo interno preparado para evolucion fiscal española tras validacion con asesoria."
      />
      <InvoicesModule invoices={data.invoices} admin />
    </>
  );
}
