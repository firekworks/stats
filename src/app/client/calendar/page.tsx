import { CalendarBoard } from "@/components/workflow-modules";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";
import { getClientPortalData } from "@/lib/data-access";

export default async function ClientCalendarPage() {
  const profile = await getCurrentProfile();
  const data = await getClientPortalData(profile.clientId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Calendario"
        title="Publicaciones y entregas"
        description="Vista mensual del trabajo planificado para tu portal."
      />
      <Card className="calendar-board-card">
        <CardHeader title="Calendario" description="Mes" />
        <CalendarBoard
          clients={[data.selectedClient]}
          content={data.content}
          events={data.calendarEvents}
        />
      </Card>
    </>
  );
}
