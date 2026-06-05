import { AdminDashboard } from "@/components/dashboard";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminHomePage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Admin Firekworks"
        title="Dashboard general"
        description="Vista global de clientes, campañas, alertas internas y rendimiento mensual."
      />
      <AdminDashboard data={data} />
    </>
  );
}
