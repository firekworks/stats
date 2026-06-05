import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  const data = await getAdminPortalData();

  return (
    <PortalShell mode="admin" client={data.selectedClient}>
      {children}
    </PortalShell>
  );
}
