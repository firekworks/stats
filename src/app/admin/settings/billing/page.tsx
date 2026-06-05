import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Save } from "lucide-react";
import { z } from "zod";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { getBillingSettings } from "@/lib/billing-settings";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

const billingSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  legalName: z.string().trim().max(180),
  taxId: z.string().trim().max(40),
  fiscalAddress: z.string().trim().max(500),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(40),
  iban: z.string().trim().max(80),
  invoiceSeries: z.string().trim().min(1).max(20),
  nextInvoiceNumber: z.coerce.number().int().min(1),
  defaultVatRate: z.coerce.number().min(0).max(100),
  defaultRetentionRate: z.coerce.number().min(0).max(100),
  footerText: z.string().trim().max(1000),
  logoUrl: z.string().trim().max(300)
});

export default async function BillingSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { settings, pendingMigration } = await getBillingSettings();

  return (
    <>
      <PageHeader
        eyebrow="Ajustes"
        title="Facturacion"
        description="Datos fiscales de Firekworks para facturas, PDFs y futuras validaciones."
      />

      <Card>
        <CardHeader
          title="Configuracion fiscal"
          description="Uso interno"
          action={<span className="badge badge-orange">Validar con asesoria</span>}
        />
        {saved ? (
          <p className="notice-card notice-success">Ajustes guardados.</p>
        ) : null}
        {pendingMigration ? (
          <p className="notice-card">
            La tabla billing_settings aun no esta aplicada en Supabase. El formulario se
            mostrara con valores por defecto.
          </p>
        ) : null}
        <form action={saveBillingSettings} className="form mt-5">
          <div className="form-grid">
            <Field label="Nombre comercial" name="businessName" defaultValue={settings.businessName} />
            <Field label="Razon social" name="legalName" defaultValue={settings.legalName} />
            <Field label="NIF" name="taxId" defaultValue={settings.taxId} />
            <Field label="Email" name="email" defaultValue={settings.email} />
            <Field label="Telefono" name="phone" defaultValue={settings.phone} />
            <Field label="IBAN" name="iban" defaultValue={settings.iban} />
            <Field label="Serie factura" name="invoiceSeries" defaultValue={settings.invoiceSeries} />
            <Field
              label="Siguiente numero"
              name="nextInvoiceNumber"
              type="number"
              defaultValue={settings.nextInvoiceNumber}
            />
            <Field
              label="IVA por defecto"
              name="defaultVatRate"
              type="number"
              defaultValue={settings.defaultVatRate}
            />
            <Field
              label="Retencion por defecto"
              name="defaultRetentionRate"
              type="number"
              defaultValue={settings.defaultRetentionRate}
            />
            <Field label="Logo" name="logoUrl" defaultValue={settings.logoUrl} />
          </div>

          <label className="field">
            <span>Direccion fiscal</span>
            <textarea name="fiscalAddress" defaultValue={settings.fiscalAddress} rows={3} />
          </label>

          <label className="field">
            <span>Texto pie factura</span>
            <textarea name="footerText" defaultValue={settings.footerText} rows={3} />
          </label>

          <button className="button justify-center" type="submit">
            <Save size={17} />
            Guardar ajustes
          </button>
        </form>
      </Card>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} />
    </label>
  );
}

async function saveBillingSettings(formData: FormData) {
  "use server";

  const auth = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!auth || !admin) {
    redirect("/login");
  }

  const {
    data: { user }
  } = await auth.auth.getUser();

  if (!user?.id) {
    redirect("/login");
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_active || !["admin", "sales"].includes(profile.role as string)) {
    redirect("/admin/settings/billing");
  }

  const parsed = billingSchema.parse({
    businessName: formData.get("businessName"),
    legalName: formData.get("legalName"),
    taxId: formData.get("taxId"),
    fiscalAddress: formData.get("fiscalAddress"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    iban: formData.get("iban"),
    invoiceSeries: formData.get("invoiceSeries"),
    nextInvoiceNumber: formData.get("nextInvoiceNumber"),
    defaultVatRate: formData.get("defaultVatRate"),
    defaultRetentionRate: formData.get("defaultRetentionRate"),
    footerText: formData.get("footerText"),
    logoUrl: formData.get("logoUrl")
  });

  const row = {
    business_name: parsed.businessName,
    legal_name: parsed.legalName,
    tax_id: parsed.taxId,
    fiscal_address: parsed.fiscalAddress,
    email: parsed.email,
    phone: parsed.phone,
    iban: parsed.iban,
    invoice_series: parsed.invoiceSeries,
    next_invoice_number: parsed.nextInvoiceNumber,
    default_vat_rate: parsed.defaultVatRate,
    default_retention_rate: parsed.defaultRetentionRate,
    footer_text: parsed.footerText,
    logo_url: parsed.logoUrl,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  };

  const { data: current } = await admin
    .from("billing_settings")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (current?.id) {
    await admin.from("billing_settings").update(row).eq("id", current.id);
  } else {
    await admin.from("billing_settings").insert(row);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/billing");
  redirect("/admin/settings/billing?saved=1");
}
