import { ClientPortalView } from "@/components/workflow-modules";
import { getDemoPortalDataBySlug } from "@/lib/data-access";
import { notFound } from "next/navigation";

export default async function DemoClientPortalPage({
  params
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const data = await getDemoPortalDataBySlug(clientSlug);

  if (!data) {
    notFound();
  }

  return <ClientPortalView data={data} demo />;
}
