import { getSupabaseAdminClient } from "@/lib/supabase/server";

export type BillingSettings = {
  businessName: string;
  legalName: string;
  taxId: string;
  fiscalAddress: string;
  email: string;
  phone: string;
  iban: string;
  invoiceSeries: string;
  nextInvoiceNumber: number;
  defaultVatRate: number;
  defaultRetentionRate: number;
  footerText: string;
  logoUrl: string;
};

export const defaultBillingSettings: BillingSettings = {
  businessName: "Firekworks",
  legalName: "Pendiente de completar",
  taxId: "Pendiente",
  fiscalAddress: "Pendiente de completar",
  email: "hola@firekworks.es",
  phone: "Pendiente",
  iban: "Pendiente",
  invoiceSeries: "FW",
  nextInvoiceNumber: 1,
  defaultVatRate: 21,
  defaultRetentionRate: 0,
  footerText:
    "Emision fiscal definitiva pendiente de validacion con asesoria.",
  logoUrl: "/brand/firekworks-icon.png"
};

type BillingSettingsRow = {
  business_name?: string | null;
  legal_name?: string | null;
  tax_id?: string | null;
  fiscal_address?: string | null;
  email?: string | null;
  phone?: string | null;
  iban?: string | null;
  invoice_series?: string | null;
  next_invoice_number?: number | null;
  default_vat_rate?: number | null;
  default_retention_rate?: number | null;
  footer_text?: string | null;
  logo_url?: string | null;
};

const missingTableCodes = new Set(["42P01", "42703", "PGRST106", "PGRST205"]);

export async function getBillingSettings() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return { settings: defaultBillingSettings, pendingMigration: true };
  }

  const { data, error } = await supabase
    .from("billing_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle<BillingSettingsRow>();

  if (error) {
    return {
      settings: defaultBillingSettings,
      pendingMigration: missingTableCodes.has(error.code)
    };
  }

  if (!data) {
    return { settings: defaultBillingSettings, pendingMigration: false };
  }

  return {
    settings: {
      businessName: data.business_name || defaultBillingSettings.businessName,
      legalName: data.legal_name || defaultBillingSettings.legalName,
      taxId: data.tax_id || defaultBillingSettings.taxId,
      fiscalAddress:
        data.fiscal_address || defaultBillingSettings.fiscalAddress,
      email: data.email || defaultBillingSettings.email,
      phone: data.phone || defaultBillingSettings.phone,
      iban: data.iban || defaultBillingSettings.iban,
      invoiceSeries:
        data.invoice_series || defaultBillingSettings.invoiceSeries,
      nextInvoiceNumber:
        Number(data.next_invoice_number) ||
        defaultBillingSettings.nextInvoiceNumber,
      defaultVatRate:
        Number(data.default_vat_rate) ||
        defaultBillingSettings.defaultVatRate,
      defaultRetentionRate:
        Number(data.default_retention_rate ?? 0),
      footerText: data.footer_text || defaultBillingSettings.footerText,
      logoUrl: data.logo_url || defaultBillingSettings.logoUrl
    },
    pendingMigration: false
  };
}
