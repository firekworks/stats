import { PortalShell } from "@/components/portal-shell";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile("client");
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <PortalShell mode="client" client={data.selectedClient}>
      {children}
    </PortalShell>
  );
}
