import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  campaigns,
  clients,
  contentItems,
  invoices,
  monthlyMetrics
} from "@/lib/demo-data";
import {
  formatCurrency,
  formatDecimal,
  formatMonth,
  formatNumber
} from "@/lib/format";

const ink = rgb(0.11, 0.11, 0.12);
const muted = rgb(0.43, 0.43, 0.45);
const blue = rgb(0, 0.44, 0.89);
const line = rgb(0.9, 0.9, 0.92);

export async function buildMonthlyReportPdf(clientId: string) {
  const client = clients.find((item) => item.id === clientId) ?? clients[0];
  const metric =
    monthlyMetrics
      .filter((item) => item.clientId === client.id)
      .sort((a, b) => b.year - a.year || b.month - a.month)[0] ??
    monthlyMetrics[0];
  const clientCampaigns = campaigns.filter((item) => item.clientId === client.id);
  const clientContent = contentItems.filter((item) => item.clientId === client.id);
  const bestContent = clientContent.find(
    (item) => item.id === metric.bestContentId
  );

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([595, 842]);
  let y = 780;

  drawBrand(page, bold, regular);
  drawText(page, "Informe mensual", 58, y, 36, bold, ink);
  y -= 42;
  drawText(
    page,
    `${client.publicName} · ${formatMonth(metric.month, metric.year)}`,
    58,
    y,
    15,
    regular,
    muted
  );
  y -= 70;

  drawMetricGrid(page, bold, regular, [
    ["Alcance", formatNumber(metric.reach)],
    ["Impresiones", formatNumber(metric.impressions)],
    ["Leads", formatNumber(metric.leads)],
    [
      metric.roiMode === "real" ? "ROI real" : "ROI estimado",
      metric.estimatedRoi ? `${formatDecimal(metric.estimatedRoi, 2)}x` : "N/A"
    ]
  ]);

  y -= 155;
  y = section(page, "Resumen ejecutivo", metric.summary, y, bold, regular);
  y = section(page, "Diagnostico", metric.diagnosis, y, bold, regular);
  y = section(
    page,
    "ROI",
    `${formatCurrency(metric.estimatedRevenue)} de retorno estimado sobre ${formatCurrency(
      metric.totalInvestment
    )} de inversion total. Los datos son estimados si no hay ventas confirmadas por el cliente.`,
    y,
    bold,
    regular
  );

  y = section(
    page,
    "Mejor contenido",
    bestContent
      ? `${bestContent.title}: ${formatNumber(
          bestContent.views
        )} visualizaciones y ${formatDecimal(bestContent.engagementRate, 1)}% de engagement.`
      : "Sin contenido destacado registrado.",
    y,
    bold,
    regular
  );

  const page2 = doc.addPage([595, 842]);
  y = 780;
  drawBrand(page2, bold, regular);
  drawText(page2, "Trabajo realizado", 58, y, 28, bold, ink);
  y -= 50;

  for (const campaign of clientCampaigns) {
    y = bullet(
      page2,
      `${campaign.name}: ${campaign.leads} leads, ${formatCurrency(
        campaign.costPerLead
      )} CPL, ${formatCurrency(campaign.spend)} gastados.`,
      y,
      regular
    );
  }

  y -= 20;
  y = section(
    page2,
    "Contenido publicado",
    clientContent
      .map((item) => `${item.type}: ${item.title}`)
      .join("\n"),
    y,
    bold,
    regular
  );
  y = section(
    page2,
    "Plan del proximo mes",
    metric.nextMonthPlan,
    y,
    bold,
    regular
  );

  drawFooter(page, regular);
  drawFooter(page2, regular);

  return doc.save();
}

export async function buildInvoicePdf(invoiceId: string) {
  const invoice = invoices.find((item) => item.id === invoiceId) ?? invoices[0];
  const client =
    clients.find((item) => item.id === invoice.clientId) ?? clients[0];

  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595, 842]);

  drawBrand(page, bold, regular);
  drawText(page, "Factura", 58, 742, 36, bold, ink);
  drawText(page, invoice.invoiceNumber, 58, 710, 14, regular, muted);

  drawText(page, client.legalName, 58, 650, 15, bold, ink);
  drawText(page, client.publicName, 58, 628, 12, regular, muted);
  drawText(page, `Emision: ${invoice.issueDate}`, 360, 650, 12, regular, muted);
  drawText(page, `Vence: ${invoice.dueDate}`, 360, 628, 12, regular, muted);

  let y = 560;
  drawText(page, "Concepto", 58, y, 12, bold, muted);
  drawText(page, "Cantidad", 350, y, 12, bold, muted);
  drawText(page, "Total", 470, y, 12, bold, muted);
  y -= 12;
  page.drawLine({ start: { x: 58, y }, end: { x: 535, y }, color: line });
  y -= 28;

  for (const item of invoice.items) {
    drawText(page, item.description, 58, y, 12, regular, ink);
    drawText(page, String(item.quantity), 366, y, 12, regular, ink);
    drawText(page, formatCurrency(item.total), 470, y, 12, regular, ink);
    y -= 32;
  }

  y -= 28;
  drawText(page, "Base imponible", 350, y, 12, regular, muted);
  drawText(page, formatCurrency(invoice.taxableBase), 470, y, 12, bold, ink);
  y -= 24;
  drawText(page, `IVA ${formatDecimal(invoice.vatRate, 1)}%`, 350, y, 12, regular, muted);
  drawText(
    page,
    formatCurrency(invoice.taxableBase * (invoice.vatRate / 100)),
    470,
    y,
    12,
    bold,
    ink
  );
  y -= 24;
  drawText(
    page,
    `Retencion ${formatDecimal(invoice.withholdingRate, 1)}%`,
    350,
    y,
    12,
    regular,
    muted
  );
  drawText(
    page,
    formatCurrency(invoice.taxableBase * (invoice.withholdingRate / 100)),
    470,
    y,
    12,
    bold,
    ink
  );
  y -= 36;
  drawText(page, "Total", 350, y, 18, bold, ink);
  drawText(page, formatCurrency(invoice.total), 470, y, 18, bold, blue);

  drawText(
    page,
    "Emision fiscal definitiva pendiente de validacion con asesoria.",
    58,
    145,
    10,
    regular,
    muted
  );
  drawFooter(page, regular);

  return doc.save();
}

function drawBrand(page: import("pdf-lib").PDFPage, bold: import("pdf-lib").PDFFont, regular: import("pdf-lib").PDFFont) {
  page.drawRectangle({
    x: 58,
    y: 794,
    width: 34,
    height: 34,
    color: ink
  });
  drawText(page, "S", 70, 803, 16, bold, rgb(1, 1, 1));
  drawText(page, "Firekworks Stats", 104, 810, 12, bold, ink);
  drawText(page, "Portal privado de resultados", 104, 794, 9, regular, muted);
}

function drawFooter(page: import("pdf-lib").PDFPage, regular: import("pdf-lib").PDFFont) {
  page.drawLine({
    start: { x: 58, y: 54 },
    end: { x: 535, y: 54 },
    color: line
  });
  drawText(
    page,
    "Firekworks Stats · Informe confidencial para cliente",
    58,
    34,
    9,
    regular,
    muted
  );
}

function drawMetricGrid(
  page: import("pdf-lib").PDFPage,
  bold: import("pdf-lib").PDFFont,
  regular: import("pdf-lib").PDFFont,
  metrics: [string, string][]
) {
  metrics.forEach(([label, value], index) => {
    const x = 58 + (index % 2) * 248;
    const y = 610 - Math.floor(index / 2) * 78;
    page.drawRectangle({
      x,
      y,
      width: 222,
      height: 56,
      color: rgb(0.97, 0.97, 0.98),
      borderColor: line,
      borderWidth: 1
    });
    drawText(page, label, x + 14, y + 34, 10, regular, muted);
    drawText(page, value, x + 14, y + 13, 18, bold, ink);
  });
}

function section(
  page: import("pdf-lib").PDFPage,
  title: string,
  body: string,
  y: number,
  bold: import("pdf-lib").PDFFont,
  regular: import("pdf-lib").PDFFont
) {
  drawText(page, title, 58, y, 15, bold, ink);
  y -= 24;
  for (const lineText of wrap(body, 82)) {
    drawText(page, lineText, 58, y, 11, regular, muted);
    y -= 16;
  }
  return y - 18;
}

function bullet(
  page: import("pdf-lib").PDFPage,
  text: string,
  y: number,
  regular: import("pdf-lib").PDFFont
) {
  drawText(page, "•", 58, y, 12, regular, blue);
  for (const lineText of wrap(text, 78)) {
    drawText(page, lineText, 76, y, 11, regular, muted);
    y -= 16;
  }
  return y - 6;
}

function drawText(
  page: import("pdf-lib").PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: import("pdf-lib").PDFFont,
  color: import("pdf-lib").RGB
) {
  page.drawText(text, { x, y, size, font, color });
}

function wrap(text: string, length: number) {
  return text
    .split("\n")
    .flatMap((paragraph) => {
      const words = paragraph.split(" ");
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        if (`${current} ${word}`.trim().length > length) {
          lines.push(current.trim());
          current = word;
        } else {
          current = `${current} ${word}`;
        }
      }

      if (current.trim()) {
        lines.push(current.trim());
      }

      return lines;
    });
}
