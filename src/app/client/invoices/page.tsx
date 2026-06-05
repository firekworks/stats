import { InvoicesModule } from "@/components/modules";
import { PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientInvoicesPage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Facturas"
        title="Facturacion"
        description="Facturas y PDFs descargables asociados al plan contratado."
      />
      <InvoicesModule invoices={data.invoices} />
    </>
  );
}
