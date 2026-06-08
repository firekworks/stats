import { CalendarEventForm } from "@/components/calendar-event-form";
import { Card, CardHeader, PageHeader, StatusBadge } from "@/components/ui";
import { ContentPreviewMockup } from "@/components/workflow-modules";
import { getAdminPortalData } from "@/lib/data-access";
import { formatNumber, formatPercent } from "@/lib/format";
import { notFound } from "next/navigation";

export default async function AdminContentDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminPortalData();
  const item = data.content.find((entry) => entry.id === id);

  if (!item) {
    notFound();
  }

  const client = data.clients.find((entry) => entry.id === item.clientId);
  const clientCampaigns = data.campaigns.filter(
    (campaign) => campaign.clientId === item.clientId
  );
  const clientContent = data.content.filter(
    (contentItem) => contentItem.clientId === item.clientId
  );

  return (
    <>
      <PageHeader
        eyebrow={item.contentCode ?? item.type}
        title={item.title}
        description="Previsualización interna, estrategia, calendario y enlaces de producción."
      />
      <div className="split">
        <Card>
          <CardHeader
            title="Mockup interno"
            description={client?.publicName ?? "Cliente"}
            action={<StatusBadge status={item.status} />}
          />
          <div className="mt-5">
            <ContentPreviewMockup item={item} client={client} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Ficha estratégica" description={item.platform} />
          <div className="mt-5 grid gap-4">
            <Detail label="Objetivo" value={item.objective ?? "Sin objetivo"} />
            <Detail label="Fase del embudo" value={item.funnelStage ?? "Sin fase"} />
            <Detail label="Gancho" value={item.hook ?? "Sin gancho"} />
            <Detail label="CTA" value={item.cta ?? "Sin CTA"} />
            <Detail label="Brief visual" value={item.visualBrief ?? "Sin brief"} />
            <div className="grid grid-2">
              <Detail label="Alcance" value={formatNumber(item.reach)} />
              <Detail label="Engagement" value={formatPercent(item.engagementRate)} />
            </div>
          </div>
        </Card>
      </div>

      <section className="split mt-[18px]">
        <Card>
          <CardHeader title="Crear evento vinculado" description="Calendario" />
          <div className="mt-5">
            <CalendarEventForm
              campaigns={clientCampaigns}
              clients={client ? [client] : data.clients}
              content={clientContent}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Producción externa" description="Drive, Canva y Meta" />
          <div className="mt-5 list">
            <Detail label="Google Drive" value={item.googleDriveFolderId ?? "Pendiente"} />
            <Detail label="Canva" value={item.canvaDesignId ?? "Pendiente"} />
            <Detail label="Meta post id" value={item.metaPostId ?? "Pendiente"} />
            <Detail label="Notas internas" value={item.notes ?? "Sin notas"} />
          </div>
        </Card>
      </section>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="small-stat">
      <span className="metric-label">{label}</span>
      <strong className="block text-[1.05rem] leading-tight">{value}</strong>
    </div>
  );
}
