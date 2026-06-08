import { CalendarModule } from "@/components/workflow-modules";
import { PageHeader } from "@/components/ui";
import { getAdminPortalData } from "@/lib/data-access";

export default async function AdminCalendarPage() {
  const data = await getAdminPortalData();

  return (
    <>
      <PageHeader
        eyebrow="Calendario"
        title="Producción y entregas"
        description="Publicaciones, grabaciones, revisiones, reuniones y eventos vinculados a campañas o piezas."
      />
      <CalendarModule
        campaigns={data.campaigns}
        clients={data.clients}
        content={data.content}
        events={data.calendarEvents}
      />
    </>
  );
}
