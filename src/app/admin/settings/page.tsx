import {
  BellRing,
  Building2,
  Database,
  FileText,
  Palette,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";
import { Card, CardHeader, ButtonLink, PageHeader } from "@/components/ui";
import { getBillingSettings } from "@/lib/billing-settings";

const settingsSections = [
  {
    title: "General",
    description: "Perfil operativo, nombre publico y datos base de Stats.",
    icon: SlidersHorizontal,
    status: "Preparado"
  },
  {
    title: "Marca",
    description: "Logo, identidad visual, recursos para PDFs y favicon.",
    icon: Palette,
    status: "Actualizado"
  },
  {
    title: "Facturacion",
    description: "Datos fiscales, serie, IVA, retencion y pie legal.",
    icon: ReceiptText,
    status: "Activo",
    href: "/admin/settings/billing"
  },
  {
    title: "Usuarios",
    description: "Accesos internos, usuarios cliente y permisos.",
    icon: UsersRound,
    status: "Con RLS",
    href: "/admin/client-access"
  },
  {
    title: "Textos",
    description: "Copys editables del login y mensajes de portal.",
    icon: FileText,
    status: "Editable",
    href: "/admin/settings/texts"
  },
  {
    title: "Notificaciones",
    description: "Alertas internas, avisos cliente y eventos importantes.",
    icon: BellRing,
    status: "Pendiente"
  },
  {
    title: "Seguridad",
    description: "RLS, service role server-side y tokens fuera del frontend.",
    icon: ShieldCheck,
    status: "Revisado"
  },
  {
    title: "Sistema",
    description: "Storage, auditoria, backups, exportaciones y jobs.",
    icon: Database,
    status: "Base lista"
  }
];

export default async function AdminSettingsPage() {
  const { settings, pendingMigration } = await getBillingSettings();

  return (
    <>
      <PageHeader
        eyebrow="Ajustes"
        title="Centro de control"
        description="Configuracion interna de Stats separada de integraciones externas."
      >
        <ButtonLink href="/admin/integrations" variant="secondary">
          Integraciones
        </ButtonLink>
        <ButtonLink href="/admin/settings/billing">
          Facturacion
        </ButtonLink>
      </PageHeader>

      <section className="settings-tabs" aria-label="Secciones de ajustes">
        {settingsSections.map((section) => (
          <a
            href={section.href ?? `#${section.title.toLowerCase()}`}
            key={section.title}
          >
            {section.title}
          </a>
        ))}
      </section>

      <section className="grid grid-2">
        <Card>
          <CardHeader
            title="Datos fiscales activos"
            description="Facturacion"
            action={<Building2 size={22} />}
          />
          <div className="mt-5 grid gap-3">
            {pendingMigration ? (
              <p className="notice-card">
                Tabla billing_settings pendiente de aplicar en Supabase.
              </p>
            ) : null}
            <SettingLine label="Marca" value={settings.businessName} />
            <SettingLine label="Razon social" value={settings.legalName} />
            <SettingLine label="NIF" value={settings.taxId} />
            <SettingLine label="Serie" value={settings.invoiceSeries} />
            <SettingLine
              label="Siguiente numero"
              value={String(settings.nextInvoiceNumber)}
            />
            <SettingLine label="IVA defecto" value={`${settings.defaultVatRate}%`} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Separacion operativa"
            description="Mapa interno"
            action={<ShieldCheck size={22} />}
          />
          <div className="mt-5 list">
            <div className="list-item">
              <div className="list-item-main">
                <strong>Ajustes</strong>
                <span>Marca, facturacion, usuarios, textos y seguridad.</span>
              </div>
              <span className="badge badge-green">Propio</span>
            </div>
            <div className="list-item">
              <div className="list-item-main">
                <strong>Integraciones</strong>
                <span>Meta, Instagram, WhatsApp, GBP y Calendar.</span>
              </div>
              <span className="badge badge-blue">Separado</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="settings-grid mt-5">
        {settingsSections.map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.title} className="settings-card">
              <span className="settings-card-icon">
                <Icon size={20} />
              </span>
              <CardHeader
                title={section.title}
                description={section.status}
                action={<span className="badge badge-gray">{section.status}</span>}
              />
              <p>{section.description}</p>
              {section.href ? (
                <ButtonLink href={section.href} variant="secondary">
                  Abrir
                </ButtonLink>
              ) : null}
            </Card>
          );
        })}
      </section>
    </>
  );
}

function SettingLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="settings-line">
      <span>{label}</span>
      <strong>{value || "Pendiente"}</strong>
    </div>
  );
}
