import { AdminDashboard } from "@/components/dashboard";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminHomePage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Admin Firekworks"
        title="Dashboard"
        description="Resumen operativo: clientes, producción, campañas, cobros y próximas acciones."
      />
      <AdminDashboard data={data} />
    </>
  );
}
