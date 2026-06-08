import { ClientPortalView } from "@/components/workflow-modules";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientHomePage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return <ClientPortalView data={data} />;
}
