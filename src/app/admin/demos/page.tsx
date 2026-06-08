import { DemosModule } from "@/components/workflow-modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";
import { headers } from "next/headers";

export default async function AdminDemosPage() {
  const data = await getAdminPortalData();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (host ? `${protocol}://${host}` : "http://localhost:3000");

  return (
    <>
      <PageHeader
        eyebrow="Demos"
        title="Portales demo"
        description="Clientes ficticios para enseñar Stats sin exponer leads, prospección ni datos reales."
      />
      <DemosModule appUrl={appUrl} data={data} />
    </>
  );
}
