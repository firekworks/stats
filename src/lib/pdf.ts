import type { BillingSettings } from "@/lib/billing-settings";
import {
  formatCurrency,
  formatDecimal,
  formatMonth,
  formatNumber
} from "@/lib/format";
import type { Campaign, Client, ContentItem, Invoice, MonthlyMetric } from "@/lib/types";

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

type Color = [number, number, number];
type FontRef = "F1" | "F2";

const ink: Color = [0.11, 0.11, 0.12];
const muted: Color = [0.43, 0.43, 0.45];
const blue: Color = [0, 0.44, 0.89];
const line: Color = [0.9, 0.9, 0.92];
const soft: Color = [0.97, 0.97, 0.98];
const white: Color = [1, 1, 1];

export async function buildMonthlyReportPdf(input: MonthlyReportPdfInput) {
  const layout = SimplePdfLayout.create("Informe confidencial para cliente");
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
  const layout = SimplePdfLayout.create("Factura privada");
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

class SimplePdfLayout {
  private readonly pages: string[] = [];
  private readonly footerText: string;
  private current = "";
  private pageNumber = 0;
  private y = 0;

  private constructor(footerText: string) {
    this.footerText = footerText;
    this.addPage();
  }

  static create(footerText: string) {
    return new SimplePdfLayout(footerText);
  }

  cover(billing: BillingSettings, title: string, main: string, subtitle: string) {
    this.drawBrand(billing);
    this.y = 718;
    this.text(title, 58, this.y, 13, "F2", blue);
    this.y -= 46;
    this.paragraph(main, 44, "F2", ink, 470, 48);
    this.paragraph(subtitle, 15, "F1", muted, 470, 22);
    this.y -= 18;
  }

  addPage() {
    if (this.current) {
      this.pages.push(this.current);
    }
    this.current = "";
    this.pageNumber += 1;
    this.y = 780;
    this.line(58, 54, 535, 54, line);
    this.text(`Firekworks Stats - ${this.footerText}`, 58, 34, 9, "F1", muted);
    this.text(`Pagina ${this.pageNumber}`, 482, 34, 9, "F1", muted);
  }

  heading(title: string, size = 18) {
    this.ensure(size + 20);
    this.text(title, 58, this.y, size, "F2", ink);
    this.y -= size + 18;
  }

  section(title: string, body: string) {
    this.heading(title, 16);
    this.paragraph(body, 11, "F1", muted, 470, 16);
    this.y -= 12;
  }

  metricGrid(metrics: [string, string][]) {
    this.ensure(150);
    metrics.forEach(([label, value], index) => {
      const x = 58 + (index % 2) * 248;
      const y = this.y - Math.floor(index / 2) * 74;
      this.rect(x, y - 52, 222, 58, soft, line);
      this.text(label, x + 14, y - 17, 10, "F1", muted);
      this.text(value, x + 14, y - 41, 18, "F2", ink);
    });
    this.y -= 158;
  }

  bulletList(items: string[]) {
    for (const item of items) {
      const lines = this.wrap(item, 11, 430);
      this.ensure(lines.length * 16 + 12);
      this.text("-", 58, this.y, 11, "F2", blue);
      lines.forEach((lineText, index) => {
        this.text(lineText, 76, this.y - index * 16, 11, "F1", muted);
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
    this.text("Concepto", 58, this.y, 10, "F2", muted);
    this.text("Cantidad", 352, this.y, 10, "F2", muted);
    this.text("Total", 470, this.y, 10, "F2", muted);
    this.y -= 12;
    this.line(58, this.y, 535, this.y, line);
    this.y -= 20;

    for (const item of invoice.items) {
      const lines = this.wrap(item.description, 11, 270);
      const rowHeight = Math.max(36, lines.length * 15 + 14);
      this.ensure(rowHeight + 10);
      lines.forEach((lineText, index) => {
        this.text(lineText, 58, this.y - index * 15, 11, "F1", ink);
      });
      this.text(String(item.quantity), 365, this.y, 11, "F1", ink);
      this.text(formatCurrency(item.total), 470, this.y, 11, "F2", ink);
      this.y -= rowHeight;
      this.line(58, this.y + 8, 535, this.y + 8, line);
    }
    this.y -= 10;
  }

  totals(rows: [string, string][]) {
    this.ensure(150);
    rows.forEach(([label, value], index) => {
      const isTotal = index === rows.length - 1;
      const size = isTotal ? 17 : 11;
      this.text(label, 340, this.y, size, isTotal ? "F2" : "F1", muted);
      this.text(value, 452, this.y, size, "F2", isTotal ? blue : ink);
      this.y -= isTotal ? 34 : 22;
    });
    this.y -= 4;
  }

  save() {
    if (this.current) {
      this.pages.push(this.current);
      this.current = "";
    }
    return createPdf(this.pages);
  }

  private drawBrand(billing: BillingSettings) {
    this.rect(58, 790, 36, 36, ink, ink);
    this.text("F", 70, 801, 16, "F2", white);
    this.text(billing.businessName || "Firekworks", 106, 812, 12, "F2", ink);
    this.text("Stats", 106, 796, 9, "F1", muted);
  }

  private infoColumn(x: number, title: string, lines: string[]) {
    let columnY = this.y;
    this.text(title, x, columnY, 12, "F2", ink);
    columnY -= 22;
    for (const lineText of lines.filter(Boolean)) {
      const wrapped = this.wrap(lineText, 10, 205);
      wrapped.forEach((item) => {
        this.text(item, x, columnY, 10, "F1", muted);
        columnY -= 14;
      });
    }
  }

  private paragraph(
    body: string,
    size: number,
    font: FontRef,
    color: Color,
    width: number,
    lineHeight: number
  ) {
    const lines = this.wrap(body, size, width);
    for (const lineText of lines) {
      this.ensure(lineHeight + 8);
      this.text(lineText, 58, this.y, size, font, color);
      this.y -= lineHeight;
    }
  }

  private wrap(text: string, size: number, maxWidth: number) {
    const maxChars = Math.max(18, Math.floor(maxWidth / (size * 0.52)));
    const paragraphs = clean(text).split("\n");
    const lines: string[] = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      let current = "";

      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length > maxChars && current) {
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

  private text(text: string, x: number, y: number, size: number, font: FontRef, color: Color) {
    this.current += `BT ${colorCommand(color, "fill")} /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(
      clean(text)
    )}) Tj ET\n`;
  }

  private rect(x: number, y: number, width: number, height: number, fill: Color, stroke: Color) {
    this.current += `${colorCommand(fill, "fill")} ${x} ${y} ${width} ${height} re f\n`;
    this.current += `${colorCommand(stroke, "stroke")} 1 w ${x} ${y} ${width} ${height} re S\n`;
  }

  private line(x1: number, y1: number, x2: number, y2: number, color: Color) {
    this.current += `${colorCommand(color, "stroke")} 1 w ${x1} ${y1} m ${x2} ${y2} l S\n`;
  }
}

function createPdf(pages: string[]) {
  const encoder = new TextEncoder();
  const pageCount = pages.length;
  const fontRegularId = 3 + pageCount * 2;
  const fontBoldId = fontRegularId + 1;
  const objects: string[] = [];

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids ${pages
    .map((_, index) => `${3 + index * 2} 0 R`)
    .join(" ")} /Count ${pageCount} >>`;

  pages.forEach((content, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    const stream = encoder.encode(content);
    objects[pageId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> ` +
      `/Contents ${contentId} 0 R >>`;
    objects[contentId - 1] = `<< /Length ${stream.length} >>\nstream\n${content}endstream`;
  });

  objects[fontRegularId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[fontBoldId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`;

  return encoder.encode(pdf);
}

function colorCommand(color: Color, mode: "fill" | "stroke") {
  const suffix = mode === "fill" ? "rg" : "RG";
  return `${color.map((value) => formatPdfNumber(value)).join(" ")} ${suffix}`;
}

function formatPdfNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "");
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function clean(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/€/g, "EUR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "");
}
