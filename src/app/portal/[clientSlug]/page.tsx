import { ClientPortalView } from "@/components/workflow-modules";
import { getCurrentProfileOrNull } from "@/lib/auth";
import { getAdminPortalData, getClientPortalData } from "@/lib/data-access";
import { notFound, redirect } from "next/navigation";

export default async function ClientSlugPortalPage({
  params
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const profile = await getCurrentProfileOrNull();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "client") {
    const data = await getClientPortalData(profile.clientId ?? undefined);

    if (data.selectedClient.slug !== clientSlug) {
      notFound();
    }

    return <ClientPortalView data={data} />;
  }

  const adminData = await getAdminPortalData();
  const client = adminData.clients.find((item) => item.slug === clientSlug);

  if (!client || client.isDemo) {
    notFound();
  }

  return (
    <ClientPortalView
      data={{
        ...adminData,
        selectedClient: client,
        metrics: adminData.metrics.filter((item) => item.clientId === client.id),
        campaigns: adminData.campaigns.filter((item) => item.clientId === client.id),
        content: adminData.content.filter((item) => item.clientId === client.id),
        reports: adminData.reports.filter((item) => item.clientId === client.id),
        invoices: adminData.invoices.filter((item) => item.clientId === client.id),
        alerts: adminData.alerts.filter((item) => item.clientId === client.id),
        tasks: adminData.tasks.filter((item) => item.clientId === client.id),
        calendarEvents: adminData.calendarEvents.filter((item) => item.clientId === client.id)
      }}
    />
  );
}
