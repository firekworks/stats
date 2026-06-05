import {
  PDFDocument,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  type RGB,
  StandardFonts,
  rgb
} from "pdf-lib";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BillingSettings } from "@/lib/billing-settings";
import {
  formatCurrency,
  formatDecimal,
  formatMonth,
  formatNumber
} from "@/lib/format";
import type { Campaign, Client, ContentItem, Invoice, MonthlyMetric } from "@/lib/types";

const ink = rgb(0.11, 0.11, 0.12);
const muted = rgb(0.43, 0.43, 0.45);
const blue = rgb(0, 0.44, 0.89);
const line = rgb(0.9, 0.9, 0.92);
const soft = rgb(0.97, 0.97, 0.98);
const white = rgb(1, 1, 1);

type PdfClient = Client & {
  taxId?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
};

export type MonthlyReportPdfInput = {
  billing: BillingSettings;
  client: PdfClient;
  metric: MonthlyMetric;
  campaigns: Campaign[];
  content: ContentItem[];
  isDemoData?: boolean;
};

export type InvoicePdfInput = {
  billing: BillingSettings;
  client: PdfClient;
  invoice: Invoice;
  isDemoData?: boolean;
};

export async function buildMonthlyReportPdf(input: MonthlyReportPdfInput) {
  const layout = await PdfLayout.create("Informe confidencial para cliente");
  const { billing, client, metric, campaigns, content } = input;
  const bestContent = content.find((item) => item.id === metric.bestContentId);
  const roiLabel = metric.roiMode === "real" ? "ROI real" : "ROI estimado";

  layout.cover(
    billing,
    "Informe mensual",
    client.publicName,
    formatMonth(metric.month, metric.year)
  );

  layout.metricGrid([
    ["Alcance", formatNumber(metric.reach)],
    ["Impresiones", formatNumber(metric.impressions)],
    ["Leads/mensajes", formatNumber(metric.leads + metric.messages)],
    [
      roiLabel,
      metric.estimatedRoi ? `${formatDecimal(metric.estimatedRoi, 2)}x` : "Sin datos"
    ]
  ]);

  if (input.isDemoData) {
    layout.section(
      "Estado de datos",
      "Datos de demostracion / pendiente de integracion. Este PDF sirve para validar la maqueta y la descarga, no como informe real de cliente."
    );
  }

  layout.section("Resumen ejecutivo", metric.summary || "Sin resumen registrado.");
  layout.section("Diagnostico", metric.diagnosis || "Sin diagnostico registrado.");
  layout.section(
    "ROI",
    `${formatCurrency(metric.estimatedRevenue)} de retorno sobre ${formatCurrency(
      metric.totalInvestment
    )} de inversion total. El ROI se marca como estimado si no hay ventas confirmadas por el cliente.`
  );
  layout.section(
    "Mejor contenido",
    bestContent
      ? `${bestContent.title}: ${formatNumber(bestContent.views)} visualizaciones, ${formatNumber(
          bestContent.reach
        )} de alcance y ${formatDecimal(bestContent.engagementRate, 1)}% de engagement.`
      : "Sin contenido destacado registrado."
  );

  layout.addPage();
  layout.heading("Trabajo realizado", 28);
  layout.bulletList(
    campaigns.length
      ? campaigns.map(
          (campaign) =>
            `${campaign.name}: ${campaign.platform}, ${formatNumber(
              campaign.leads
            )} leads, ${formatCurrency(campaign.costPerLead)} CPL y ${formatCurrency(
              campaign.spend
            )} invertidos.`
        )
      : ["Sin campanas registradas para este periodo."]
  );

  layout.section(
    "Contenido publicado",
    content.length
      ? content
          .slice(0, 10)
          .map(
            (item) =>
              `${item.type}: ${item.title}. Alcance ${formatNumber(
                item.reach
              )}, rendimiento ${item.performance}.`
          )
          .join("\n")
      : "Sin contenido publicado registrado."
  );
  layout.section(
    "Plan del proximo mes",
    metric.nextMonthPlan || "Sin plan registrado para el proximo mes."
  );
  layout.section(
    "Nota de datos",
    "Este informe combina datos disponibles en Stats, datos manuales e integraciones conectadas. Las metricas marcadas como estimadas deben validarse con ventas o reservas confirmadas."
  );

  return layout.save();
}

export async function buildInvoicePdf(input: InvoicePdfInput) {
  const layout = await PdfLayout.create("Factura privada");
  const { billing, client, invoice } = input;
  const vatAmount = invoice.taxableBase * (invoice.vatRate / 100);
  const withholdingAmount = invoice.taxableBase * (invoice.withholdingRate / 100);

  layout.cover(billing, "Factura", invoice.invoiceNumber, client.legalName);
  layout.twoColumns(
    "Emisor",
    [
      billing.businessName,
      billing.legalName,
      billing.taxId ? `NIF: ${billing.taxId}` : "NIF pendiente",
      billing.fiscalAddress,
      billing.email,
      billing.phone
    ],
    "Cliente",
    [
      client.legalName || client.publicName,
      client.taxId ? `NIF/CIF: ${client.taxId}` : "NIF/CIF pendiente",
      client.billingAddress || "Direccion fiscal pendiente",
      client.billingEmail || "",
      `Emision: ${invoice.issueDate}`,
      `Vencimiento: ${invoice.dueDate}`
    ]
  );

  layout.invoiceTable(invoice);
  layout.totals([
    ["Base imponible", formatCurrency(invoice.taxableBase)],
    [`IVA ${formatDecimal(invoice.vatRate, 1)}%`, formatCurrency(vatAmount)],
    [
      `Retencion ${formatDecimal(invoice.withholdingRate, 1)}%`,
      formatCurrency(withholdingAmount)
    ],
    ["Total", formatCurrency(invoice.total)]
  ]);
  if (input.isDemoData) {
    layout.section(
      "Aviso",
      "Factura de demostracion / pendiente de datos reales. Configura cliente, conceptos y datos fiscales antes de emitir una factura real."
    );
  }
  layout.section(
    "Notas",
    invoice.publicNotes ||
      billing.footerText ||
      "Emision fiscal definitiva pendiente de validacion con asesoria."
  );

  return layout.save();
}

class PdfLayout {
  private readonly doc: PDFDocument;
  private readonly regular: PDFFont;
  private readonly bold: PDFFont;
  private readonly footerText: string;
  private readonly brandImage: PDFImage | null;
  private page: PDFPage;
  private pageNumber = 0;
  private y = 0;

  private constructor(
    doc: PDFDocument,
    regular: PDFFont,
    bold: PDFFont,
    footerText: string,
    brandImage: PDFImage | null
  ) {
    this.doc = doc;
    this.regular = regular;
    this.bold = bold;
    this.footerText = footerText;
    this.brandImage = brandImage;
    this.page = this.doc.addPage([595, 842]);
    this.decoratePage();
  }

  static async create(footerText: string) {
    const doc = await PDFDocument.create();
    const regular = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const brandImage = await loadBrandImage(doc);

    return new PdfLayout(doc, regular, bold, footerText, brandImage);
  }

  cover(billing: BillingSettings, title: string, main: string, subtitle: string) {
    this.drawBrand(billing);
    this.y = 718;
    this.text(title, 58, this.y, 13, this.bold, blue);
    this.y -= 46;
    this.paragraph(main, 44, this.bold, ink, 470, 48);
    this.paragraph(subtitle, 15, this.regular, muted, 470, 22);
    this.y -= 18;
  }

  addPage() {
    this.page = this.doc.addPage([595, 842]);
    this.decoratePage();
  }

  heading(title: string, size = 18) {
    this.ensure(size + 20);
    this.text(title, 58, this.y, size, this.bold, ink);
    this.y -= size + 18;
  }

  section(title: string, body: string) {
    this.heading(title, 16);
    this.paragraph(body, 11, this.regular, muted, 470, 16);
    this.y -= 12;
  }

  metricGrid(metrics: [string, string][]) {
    this.ensure(150);
    metrics.forEach(([label, value], index) => {
      const x = 58 + (index % 2) * 248;
      const y = this.y - Math.floor(index / 2) * 74;
      this.page.drawRectangle({
        x,
        y: y - 52,
        width: 222,
        height: 58,
        color: soft,
        borderColor: line,
        borderWidth: 1
      });
      this.text(label, x + 14, y - 17, 10, this.regular, muted);
      this.text(value, x + 14, y - 41, 18, this.bold, ink);
    });
    this.y -= 158;
  }

  bulletList(items: string[]) {
    for (const item of items) {
      const lines = this.wrap(item, this.regular, 11, 430);
      this.ensure(lines.length * 16 + 12);
      this.text("-", 58, this.y, 11, this.bold, blue);
      lines.forEach((lineText, index) => {
        this.text(lineText, 76, this.y - index * 16, 11, this.regular, muted);
      });
      this.y -= lines.length * 16 + 8;
    }
    this.y -= 12;
  }

  twoColumns(leftTitle: string, left: string[], rightTitle: string, right: string[]) {
    this.ensure(180);
    this.infoColumn(58, leftTitle, left);
    this.infoColumn(326, rightTitle, right);
    this.y -= 190;
  }

  invoiceTable(invoice: Invoice) {
    this.heading("Conceptos", 16);
    this.ensure(42);
    this.text("Concepto", 58, this.y, 10, this.bold, muted);
    this.text("Cantidad", 352, this.y, 10, this.bold, muted);
    this.text("Total", 470, this.y, 10, this.bold, muted);
    this.y -= 12;
    this.page.drawLine({ start: { x: 58, y: this.y }, end: { x: 535, y: this.y }, color: line });
    this.y -= 20;

    for (const item of invoice.items) {
      const lines = this.wrap(item.description, this.regular, 11, 270);
      const rowHeight = Math.max(36, lines.length * 15 + 14);
      this.ensure(rowHeight + 10);
      lines.forEach((lineText, index) => {
        this.text(lineText, 58, this.y - index * 15, 11, this.regular, ink);
      });
      this.text(String(item.quantity), 365, this.y, 11, this.regular, ink);
      this.text(formatCurrency(item.total), 470, this.y, 11, this.bold, ink);
      this.y -= rowHeight;
      this.page.drawLine({ start: { x: 58, y: this.y + 8 }, end: { x: 535, y: this.y + 8 }, color: line });
    }
    this.y -= 10;
  }

  totals(rows: [string, string][]) {
    this.ensure(150);
    rows.forEach(([label, value], index) => {
      const isTotal = index === rows.length - 1;
      const size = isTotal ? 17 : 11;
      const color = isTotal ? blue : ink;
      this.text(label, 340, this.y, size, isTotal ? this.bold : this.regular, muted);
      this.text(value, 452, this.y, size, this.bold, color);
      this.y -= isTotal ? 34 : 22;
    });
    this.y -= 4;
  }

  save() {
    return this.doc.save();
  }

  private decoratePage() {
    this.pageNumber += 1;
    this.y = 780;
    this.page.drawLine({ start: { x: 58, y: 54 }, end: { x: 535, y: 54 }, color: line });
    this.text(`Firekworks Stats - ${this.footerText}`, 58, 34, 9, this.regular, muted);
    this.text(`Pagina ${this.pageNumber}`, 482, 34, 9, this.regular, muted);
  }

  private drawBrand(billing: BillingSettings) {
    if (this.brandImage) {
      this.page.drawImage(this.brandImage, {
        x: 58,
        y: 790,
        width: 36,
        height: 36
      });
    } else {
      this.page.drawRectangle({
        x: 58,
        y: 790,
        width: 36,
        height: 36,
        color: ink
      });
      this.text("F", 70, 801, 16, this.bold, white);
    }
    this.text(billing.businessName || "Firekworks", 106, 812, 12, this.bold, ink);
    this.text("Stats", 106, 796, 9, this.regular, muted);
  }

  private infoColumn(x: number, title: string, lines: string[]) {
    let columnY = this.y;
    this.text(title, x, columnY, 12, this.bold, ink);
    columnY -= 22;
    for (const lineText of lines.filter(Boolean)) {
      const wrapped = this.wrap(lineText, this.regular, 10, 205);
      wrapped.forEach((item) => {
        this.text(item, x, columnY, 10, this.regular, muted);
        columnY -= 14;
      });
    }
  }

  private paragraph(
    body: string,
    size: number,
    font: PDFFont,
    color: RGB,
    width: number,
    lineHeight: number
  ) {
    const lines = this.wrap(body, font, size, width);
    for (const lineText of lines) {
      this.ensure(lineHeight + 8);
      this.text(lineText, 58, this.y, size, font, color);
      this.y -= lineHeight;
    }
  }

  private wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
    const paragraphs = clean(text).split("\n");
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      let current = "";

      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = next;
        }
      }

      if (current) {
        lines.push(current);
      }
    }

    return lines.length ? lines : [""];
  }

  private ensure(space: number) {
    if (this.y - space < 82) {
      this.addPage();
    }
  }

  private text(text: string, x: number, y: number, size: number, font: PDFFont, color: RGB) {
    this.page.drawText(clean(text), { x, y, size, font, color });
  }
}

function clean(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/€/g, "EUR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "");
}

async function loadBrandImage(doc: PDFDocument) {
  try {
    const icon = await readFile(join(process.cwd(), "public/brand/firekworks-icon.png"));
    return await doc.embedPng(icon);
  } catch {
    return null;
  }
}
