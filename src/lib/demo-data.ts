import {
  calculateEstimatedRevenue,
  calculateRoi,
  calculateTotalInvestment
} from "@/lib/calculations";
import type {
  Alert,
  Campaign,
  CalendarEvent,
  Client,
  ClientScore,
  ContentItem,
  Invoice,
  LeaderboardEntry,
  MonthlyMetric,
  PortalData,
  Report,
  Task
} from "@/lib/types";

export const clients: Client[] = [
  {
    id: "10000000-0000-4000-8000-000000000101",
    slug: "restaurante-brasa-norte",
    publicName: "Restaurante Brasa Norte",
    legalName: "Restaurante Brasa Norte Demo SL",
    isDemo: true,
    demoLabel: "Demo Firekworks",
    industry: "Restaurante",
    status: "active",
    city: "Castalla",
    logoUrl: "/brand/firekworks-icon.png",
    brandColors: ["#1d1d1f", "#b7791f", "#f97316"],
    brandVoice: "Cercano, apetitoso, local y directo.",
    targetAudience: "Parejas, familias y grupos locales.",
    objective: "Aumentar reservas de fin de semana.",
    services: ["Contenido mensual", "Meta Ads", "Google Business Profile", "WhatsApp"],
    averageTicket: 35,
    allowPublicLeaderboardName: true,
    planName: "Demo Growth Local",
    planStatus: "Activo",
    monthlyFee: 790,
    onboardedAt: "2025-10-01",
    publicLeaderboardName: "Restaurante mediterraneo"
  },
  {
    id: "10000000-0000-4000-8000-000000000102",
    slug: "clinica-dental-sonrisa-ibi",
    publicName: "Clínica Dental Sonrisa Ibi",
    legalName: "Clinica Dental Sonrisa Ibi Demo SL",
    isDemo: true,
    demoLabel: "Demo Firekworks",
    industry: "Clínica dental",
    status: "active",
    city: "Ibi",
    logoUrl: "/brand/firekworks-icon.png",
    brandColors: ["#0f9f8f", "#0071e3", "#f5f5f7"],
    brandVoice: "Profesional, tranquilo, educativo y basado en confianza.",
    targetAudience: "Familias y adultos que necesitan primera visita o limpieza.",
    objective: "Captar primeras visitas y limpiezas.",
    services: ["Embudo de leads", "Landing", "Meta Ads", "Seguimiento"],
    averageTicket: 85,
    allowPublicLeaderboardName: false,
    planName: "Demo Embudo Local",
    planStatus: "Activo",
    monthlyFee: 990,
    onboardedAt: "2025-08-15",
    publicLeaderboardName: "Cliente local #02"
  },
  {
    id: "10000000-0000-4000-8000-000000000103",
    slug: "fitbox-elda",
    publicName: "FitBox Elda",
    legalName: "FitBox Elda Demo CB",
    isDemo: true,
    demoLabel: "Demo Firekworks",
    industry: "Gimnasio",
    status: "active",
    city: "Elda",
    logoUrl: "/brand/firekworks-icon.png",
    brandColors: ["#001020", "#2f9e44", "#0071e3"],
    brandVoice: "Energético, motivador, competitivo y muy visual.",
    targetAudience: "Personas de Elda que quieren probar entrenamiento funcional.",
    objective: "Captar nuevos socios para campaña mensual.",
    services: ["Reels", "Campañas Meta", "Prueba gratuita", "Reporting"],
    averageTicket: 49,
    allowPublicLeaderboardName: false,
    planName: "Demo Performance Local",
    planStatus: "Activo",
    monthlyFee: 1290,
    onboardedAt: "2025-06-01",
    publicLeaderboardName: "Gimnasio demo"
  }
];

function metric(
  clientId: string,
  month: number,
  year: number,
  input: Omit<
    MonthlyMetric,
    | "id"
    | "clientId"
    | "month"
    | "year"
    | "estimatedRevenue"
    | "totalInvestment"
    | "estimatedRoi"
    | "realRoi"
  >
): MonthlyMetric {
  const client = clients.find((item) => item.id === clientId) ?? clients[0];
  const conversions = Math.max(input.bookings, input.leads);
  const estimatedRevenue = calculateEstimatedRevenue(
    conversions,
    client.averageTicket
  );
  const totalInvestment = calculateTotalInvestment(
    input.adSpend,
    input.serviceFee,
    input.extras
  );
  const estimatedRoi = calculateRoi(
    estimatedRevenue,
    totalInvestment,
    input.roiMode
  );
  const realRoi = input.realRevenue
    ? calculateRoi(input.realRevenue, totalInvestment, "real")
    : null;

  return {
    id: `${clientId}-${year}-${month}`,
    clientId,
    month,
    year,
    estimatedRevenue,
    totalInvestment,
    estimatedRoi,
    realRoi,
    ...input
  };
}

export const monthlyMetrics: MonthlyMetric[] = [
  metric(clients[0].id, 3, 2026, {
    reach: 42800,
    impressions: 86100,
    profileVisits: 1890,
    websiteClicks: 364,
    calls: 57,
    whatsappClicks: 219,
    messages: 173,
    leads: 142,
    bookings: 68,
    realRevenue: null,
    adSpend: 820,
    serviceFee: 790,
    extras: 120,
    roiMode: "estimated",
    bestContentId: "content-lumbre-reel-menu",
    worstContentId: "content-lumbre-post-brunch",
    summary:
      "El contenido de producto y los anuncios de reservas concentraron el crecimiento del mes.",
    diagnosis:
      "El coste por lead se mantiene sano; conviene reforzar cenas de jueves y viernes.",
    nextMonthPlan:
      "Nueva secuencia de reels de menu, campana de reservas y prueba de creatividades para grupos."
  }),
  metric(clients[0].id, 4, 2026, {
    reach: 53600,
    impressions: 109200,
    profileVisits: 2540,
    websiteClicks: 482,
    calls: 72,
    whatsappClicks: 306,
    messages: 226,
    leads: 181,
    bookings: 91,
    realRevenue: null,
    adSpend: 940,
    serviceFee: 790,
    extras: 0,
    roiMode: "estimated",
    bestContentId: "content-lumbre-reel-menu",
    worstContentId: "content-lumbre-post-brunch",
    summary:
      "Abril mejora en alcance, mensajes y reservas estimadas gracias a reels y retargeting.",
    diagnosis:
      "La campana de WhatsApp funciona mejor cuando el copy incluye horarios y menu degustacion.",
    nextMonthPlan:
      "Escalar presupuesto en fines de semana, publicar prueba social y crear landing de comuniones."
  }),
  metric(clients[1].id, 4, 2026, {
    reach: 31700,
    impressions: 74700,
    profileVisits: 1305,
    websiteClicks: 318,
    calls: 26,
    whatsappClicks: 192,
    messages: 121,
    leads: 94,
    bookings: 42,
    realRevenue: 4920,
    adSpend: 1120,
    serviceFee: 990,
    extras: 180,
    roiMode: "real",
    bestContentId: "content-primefit-transformation",
    worstContentId: "content-primefit-story-horarios",
    summary:
      "Los testimonios y los anuncios de prueba semanal generaron leads de mejor calidad.",
    diagnosis:
      "Hay demanda, pero la respuesta comercial en horas punta aun puede mejorar.",
    nextMonthPlan:
      "Automatizar WhatsApp, crear campana de parejas y optimizar formulario de clase gratuita."
  }),
  metric(clients[2].id, 4, 2026, {
    reach: 64200,
    impressions: 138900,
    profileVisits: 2260,
    websiteClicks: 688,
    calls: 38,
    whatsappClicks: 271,
    messages: 147,
    leads: 83,
    bookings: 31,
    realRevenue: null,
    adSpend: 1680,
    serviceFee: 1290,
    extras: 420,
    roiMode: "estimated",
    bestContentId: "content-derma-before-after",
    worstContentId: "content-derma-static-promo",
    summary:
      "El contenido educativo eleva la confianza y reduce coste por consulta cualificada.",
    diagnosis:
      "Se necesita confirmar ventas reales para cerrar ROI; los datos actuales son estimados.",
    nextMonthPlan:
      "Secuencia de tratamientos de primavera, retargeting y captacion de reseñas verificadas."
  })
];

export const campaigns: Campaign[] = [
  {
    id: "camp-lumbre-reservas",
    clientId: clients[0].id,
    name: "Reservas cenas de fin de semana",
    platform: "Meta Ads",
    objective: "Reservas",
    budget: 1150,
    spend: 940,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "active",
    ctr: 2.9,
    cpc: 0.72,
    cpm: 8.6,
    leads: 181,
    costPerLead: 5.19,
    roas: 2.8,
    visibleSummary:
      "Campana centrada en reservas por WhatsApp con mejores resultados en jueves y viernes."
  },
  {
    id: "camp-lumbre-gbp",
    clientId: clients[0].id,
    name: "Google Business Profile - llamadas",
    platform: "Google Business",
    objective: "Llamadas",
    budget: 0,
    spend: 0,
    startDate: "2026-04-01",
    endDate: null,
    status: "learning",
    ctr: 0,
    cpc: 0,
    cpm: 0,
    leads: 72,
    costPerLead: 0,
    roas: null,
    visibleSummary:
      "Optimizacion organica de ficha con publicaciones, fotos y mejora de llamadas."
  },
  {
    id: "camp-primefit-trial",
    clientId: clients[1].id,
    name: "Primeras visitas Sonrisa Ibi",
    platform: "Instagram",
    objective: "Leads",
    budget: 1350,
    spend: 1120,
    startDate: "2026-04-03",
    endDate: "2026-04-30",
    status: "active",
    ctr: 2.4,
    cpc: 0.91,
    cpm: 7.8,
    leads: 94,
    costPerLead: 11.91,
    roas: 2.15,
    visibleSummary:
      "Captacion de primeras visitas con creatividades de confianza y formulario sencillo."
  },
  {
    id: "camp-derma-consulta",
    clientId: clients[2].id,
    name: "Prueba gratuita FitBox Elda",
    platform: "Meta Ads",
    objective: "Reservas",
    budget: 1900,
    spend: 1680,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    status: "learning",
    ctr: 1.8,
    cpc: 1.62,
    cpm: 12.2,
    leads: 83,
    costPerLead: 20.24,
    roas: null,
    visibleSummary:
      "Campana demo para convertir reels y prueba social en reservas de clase gratuita."
  }
];

export const contentItems: ContentItem[] = [
  {
    id: "content-lumbre-reel-menu",
    clientId: clients[0].id,
    title: "Reel menu degustacion de abril",
    type: "Reel",
    platform: "Instagram",
    publishDate: "2026-04-12",
    status: "published",
    url: "https://instagram.com/firekworks-demo",
    storagePath: "10000000-0000-4000-8000-000000000101/reels/menu-abril.mp4",
    views: 28400,
    reach: 22100,
    likes: 946,
    comments: 82,
    shares: 146,
    saves: 312,
    engagementRate: 6.7,
    performance: "viral",
    reusable: true,
    learning:
      "Los planos de cocina y el remate con precio aproximado elevaron guardados y reservas."
  },
  {
    id: "content-lumbre-post-brunch",
    clientId: clients[0].id,
    title: "Post brunch domingo",
    type: "Post",
    platform: "Facebook",
    publishDate: "2026-04-20",
    status: "published",
    url: "https://facebook.com/firekworks-demo",
    storagePath: null,
    views: 3800,
    reach: 3100,
    likes: 71,
    comments: 6,
    shares: 4,
    saves: 11,
    engagementRate: 3.0,
    performance: "ok",
    reusable: false,
    learning:
      "El formato estatico funciono peor que el video corto para producto gastronomico."
  },
  {
    id: "content-primefit-transformation",
    clientId: clients[1].id,
    title: "Primera visita sin miedo",
    type: "Carrusel",
    platform: "Instagram",
    publishDate: "2026-04-09",
    status: "published",
    url: "https://instagram.com/firekworks-demo",
    storagePath: "10000000-0000-4000-8000-000000000102/carousels/primera-visita.zip",
    views: 12100,
    reach: 9400,
    likes: 502,
    comments: 44,
    shares: 89,
    saves: 166,
    engagementRate: 8.5,
    performance: "high",
    reusable: true,
    learning:
      "El enfoque educativo y tranquilo reduce friccion antes de pedir cita."
  },
  {
    id: "content-primefit-story-horarios",
    clientId: clients[1].id,
    title: "Stories dudas frecuentes",
    type: "Story",
    platform: "Instagram",
    publishDate: "2026-04-28",
    status: "published",
    url: "https://instagram.com/firekworks-demo",
    storagePath: null,
    views: 1900,
    reach: 1600,
    likes: 38,
    comments: 2,
    shares: 3,
    saves: 4,
    engagementRate: 2.9,
    performance: "low",
    reusable: false,
    learning:
      "Resolver objeciones funciona mejor cuando se enlaza con cita inmediata."
  },
  {
    id: "content-derma-before-after",
    clientId: clients[2].id,
    title: "Reto funcional de 30 segundos",
    type: "Reel",
    platform: "Instagram",
    publishDate: "2026-04-15",
    status: "published",
    url: "https://instagram.com/firekworks-demo",
    storagePath: "10000000-0000-4000-8000-000000000103/reels/reto-funcional.mp4",
    views: 34200,
    reach: 28700,
    likes: 1204,
    comments: 96,
    shares: 214,
    saves: 481,
    engagementRate: 7.0,
    performance: "viral",
    reusable: true,
    learning:
      "El contenido intenso y real del box genera retencion y mensajes de prueba."
  },
  {
    id: "content-derma-static-promo",
    clientId: clients[2].id,
    title: "Creatividad clase gratuita",
    type: "Creatividad",
    platform: "Meta Ads",
    publishDate: "2026-04-06",
    status: "published",
    url: "https://facebook.com/firekworks-demo",
    storagePath: "10000000-0000-4000-8000-000000000103/ads/clase-gratuita.png",
    views: 6800,
    reach: 5600,
    likes: 141,
    comments: 8,
    shares: 12,
    saves: 19,
    engagementRate: 3.2,
    performance: "ok",
    reusable: true,
    learning:
      "La promocion directa convierte mejor al mostrar ambiente y facilidad para empezar."
  }
];

export const reports: Report[] = [
  {
    id: "report-lumbre-2026-04",
    clientId: clients[0].id,
    month: 4,
    year: 2026,
    title: "Informe mensual - Abril 2026",
    status: "generated",
    storagePath: "10000000-0000-4000-8000-000000000101/reports/2026-04.pdf",
    generatedAt: "2026-05-02T09:10:00.000Z"
  },
  {
    id: "report-primefit-2026-04",
    clientId: clients[1].id,
    month: 4,
    year: 2026,
    title: "Informe mensual - Abril 2026",
    status: "sent",
    storagePath: "10000000-0000-4000-8000-000000000102/reports/2026-04.pdf",
    generatedAt: "2026-05-03T11:30:00.000Z"
  },
  {
    id: "report-derma-2026-04",
    clientId: clients[2].id,
    month: 4,
    year: 2026,
    title: "Informe mensual - Abril 2026",
    status: "draft",
    storagePath: null,
    generatedAt: "2026-05-04T08:45:00.000Z"
  }
];

export const invoices: Invoice[] = [
  {
    id: "invoice-lumbre-2026-05",
    clientId: clients[0].id,
    invoiceNumber: "FW-2026-0051",
    status: "sent",
    issueDate: "2026-05-01",
    dueDate: "2026-05-10",
    taxableBase: 790,
    vatRate: 21,
    withholdingRate: 0,
    total: 955.9,
    paymentMethod: "Transferencia",
    publicNotes: "Servicio mensual Growth Local.",
    items: [
      {
        id: "invoice-lumbre-2026-05-1",
        description: "Gestion mensual Growth Local",
        quantity: 1,
        unitPrice: 790,
        total: 790
      }
    ]
  },
  {
    id: "invoice-primefit-2026-05",
    clientId: clients[1].id,
    invoiceNumber: "FW-2026-0052",
    status: "paid",
    issueDate: "2026-05-01",
    dueDate: "2026-05-07",
    taxableBase: 1170,
    vatRate: 21,
    withholdingRate: 0,
    total: 1415.7,
    paymentMethod: "Domiciliacion",
    publicNotes: "Gestion mensual y extra de creatividades.",
    items: [
      {
        id: "invoice-primefit-2026-05-1",
        description: "Performance Local",
        quantity: 1,
        unitPrice: 990,
        total: 990
      },
      {
        id: "invoice-primefit-2026-05-2",
        description: "Pack extra creatividades",
        quantity: 1,
        unitPrice: 180,
        total: 180
      }
    ]
  },
  {
    id: "invoice-derma-2026-05",
    clientId: clients[2].id,
    invoiceNumber: "FW-2026-0053",
    status: "overdue",
    issueDate: "2026-05-01",
    dueDate: "2026-05-08",
    taxableBase: 1710,
    vatRate: 21,
    withholdingRate: 0,
    total: 2069.1,
    paymentMethod: "Transferencia",
    publicNotes: "Gestion mensual Premium Ads + Contenido.",
    items: [
      {
        id: "invoice-derma-2026-05-1",
        description: "Premium Ads + Contenido",
        quantity: 1,
        unitPrice: 1290,
        total: 1290
      },
      {
        id: "invoice-derma-2026-05-2",
        description: "Produccion extra de contenido",
        quantity: 1,
        unitPrice: 420,
        total: 420
      }
    ]
  }
];

export const leaderboards: LeaderboardEntry[] = [
  {
    id: "lb-growth-1",
    clientId: clients[0].id,
    category: "Mejor crecimiento mensual",
    rank: 1,
    displayName: "Restaurante local demo",
    metricLabel: "+25,2% alcance",
    trend: 25.2,
    isCurrentClient: true
  },
  {
    id: "lb-growth-2",
    clientId: clients[2].id,
    category: "Mejor crecimiento mensual",
    rank: 2,
    displayName: "Gimnasio demo",
    metricLabel: "+18,4% alcance",
    trend: 18.4
  },
  {
    id: "lb-growth-3",
    clientId: clients[1].id,
    category: "Mejor crecimiento mensual",
    rank: 3,
    displayName: "Cliente local #02",
    metricLabel: "+11,8% leads",
    trend: 11.8
  },
  {
    id: "lb-cpl-1",
    clientId: clients[0].id,
    category: "Mejor coste por lead",
    rank: 1,
    displayName: "Restaurante local demo",
    metricLabel: "5,19 EUR CPL",
    trend: -13.1,
    isCurrentClient: true
  },
  {
    id: "lb-roi-1",
    clientId: clients[2].id,
    category: "Mejor ROI estimado",
    rank: 1,
    displayName: "Gimnasio demo",
    metricLabel: "4,53x estimado",
    trend: 9.3
  }
];

export const scores: ClientScore[] = [
  {
    clientId: clients[0].id,
    score: 84,
    level: 4,
    levelName: "Partner",
    punctualPayment: 5,
    approvalsSpeed: 4,
    collaboration: 4,
    profitability: 4,
    growth: 5,
    churnRisk: 2,
    communication: 4,
    satisfaction: 5,
    action: "Candidato a caso de exito y testimonio local.",
    updatedAt: "2026-05-02T10:00:00.000Z"
  },
  {
    clientId: clients[1].id,
    score: 76,
    level: 4,
    levelName: "Partner",
    punctualPayment: 5,
    approvalsSpeed: 3,
    collaboration: 4,
    profitability: 4,
    growth: 4,
    churnRisk: 2,
    communication: 3,
    satisfaction: 4,
    action: "Proponer mejora de WhatsApp y mayor inversion.",
    updatedAt: "2026-05-03T12:00:00.000Z"
  },
  {
    clientId: clients[2].id,
    score: 68,
    level: 3,
    levelName: "Pro",
    punctualPayment: 3,
    approvalsSpeed: 4,
    collaboration: 4,
    profitability: 5,
    growth: 4,
    churnRisk: 3,
    communication: 4,
    satisfaction: 4,
    action: "Confirmar ventas reales y resolver factura vencida.",
    updatedAt: "2026-05-04T09:00:00.000Z"
  }
];

export const alerts: Alert[] = [
  {
    id: "alert-lumbre-upsample",
    clientId: clients[0].id,
    title: "Alto potencial de upsell por rendimiento de reservas",
    severity: "success",
    visibility: "internal",
    createdAt: "2026-05-02T09:30:00.000Z"
  },
  {
    id: "alert-derma-invoice",
    clientId: clients[2].id,
    title: "Factura vencida pendiente de seguimiento",
    severity: "warning",
    visibility: "internal",
    createdAt: "2026-05-09T08:00:00.000Z"
  },
  {
    id: "alert-lumbre-client",
    clientId: clients[0].id,
    title: "Informe de abril listo para descargar",
    severity: "info",
    visibility: "client",
    createdAt: "2026-05-02T10:15:00.000Z"
  }
];

export const tasks: Task[] = [
  {
    id: "task-lumbre-menu",
    clientId: clients[0].id,
    title: "Enviar fotos del nuevo menu de temporada",
    dueDate: "2026-05-08",
    status: "in_progress",
    visibleToClient: true
  },
  {
    id: "task-lumbre-landing",
    clientId: clients[0].id,
    title: "Publicar landing de comuniones",
    dueDate: "2026-05-12",
    status: "open",
    visibleToClient: true
  },
  {
    id: "task-derma-sales",
    clientId: clients[2].id,
    title: "Pedir datos de ventas reales de abril",
    dueDate: "2026-05-07",
    status: "open",
    visibleToClient: false
  }
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "calendar-demo-brasa-reel",
    clientId: clients[0].id,
    leadId: null,
    campaignId: campaigns[0].id,
    contentItemId: contentItems[0].id,
    title: "Publicación REEL-001 Brasa Norte",
    type: "Publicación reel",
    status: "confirmed",
    startAt: "2026-06-07T18:30:00.000+02:00",
    endAt: "2026-06-07T19:00:00.000+02:00",
    location: "Instagram",
    googleMapsUrl: null,
    googleCalendarEventId: null,
    notes: "Publicar reel demo con CTA a WhatsApp.",
    assignedTo: null,
    isDemo: true
  },
  {
    id: "calendar-demo-sonrisa-post",
    clientId: clients[1].id,
    leadId: null,
    campaignId: campaigns[2].id,
    contentItemId: contentItems.find((item) => item.clientId === clients[1].id)?.id ?? null,
    title: "Revisión POST-001 Sonrisa Ibi",
    type: "Revisión cliente",
    status: "pending",
    startAt: "2026-06-10T10:30:00.000+02:00",
    endAt: "2026-06-10T11:00:00.000+02:00",
    location: "Stats",
    googleMapsUrl: null,
    googleCalendarEventId: null,
    notes: "Revisar copy y visual antes de programar.",
    assignedTo: null,
    isDemo: true
  },
  {
    id: "calendar-demo-fitbox-car",
    clientId: clients[2].id,
    leadId: null,
    campaignId: campaigns[3].id,
    contentItemId: contentItems.find((item) => item.clientId === clients[2].id)?.id ?? null,
    title: "Entrega CAR-001 FitBox",
    type: "Entrega",
    status: "pending",
    startAt: "2026-06-11T16:00:00.000+02:00",
    endAt: "2026-06-11T16:30:00.000+02:00",
    location: "Stats",
    googleMapsUrl: null,
    googleCalendarEventId: null,
    notes: "Preparar slides finales y CTA.",
    assignedTo: null,
    isDemo: true
  }
];

export function getDemoPortalData(clientId = clients[0].id): PortalData {
  const selectedClient =
    clients.find((client) => client.id === clientId) ?? clients[0];

  return {
    clients,
    selectedClient,
    metrics: monthlyMetrics.filter(
      (item) => item.clientId === selectedClient.id
    ),
    campaigns: campaigns.filter((item) => item.clientId === selectedClient.id),
    content: contentItems.filter((item) => item.clientId === selectedClient.id),
    reports: reports.filter((item) => item.clientId === selectedClient.id),
    invoices: invoices.filter((item) => item.clientId === selectedClient.id),
    leaderboards: leaderboards.map((entry) => ({
      ...entry,
      isCurrentClient: entry.clientId === selectedClient.id
    })),
    scores,
    alerts: alerts.filter(
      (item) =>
        item.clientId === selectedClient.id || item.visibility === "internal"
    ),
    tasks: tasks.filter((item) => item.clientId === selectedClient.id),
    calendarEvents: calendarEvents.filter(
      (item) => item.clientId === selectedClient.id
    ),
    integrations: [],
    connectedAssets: [],
    syncLogs: [],
    leadEvents: []
  };
}

export function getDemoPortalDataBySlug(slug: string): PortalData | null {
  const client = clients.find((item) => item.slug === slug && item.isDemo);
  return client ? getDemoPortalData(client.id) : null;
}

export function getLatestMetric(clientId = clients[0].id) {
  return monthlyMetrics
    .filter((metricItem) => metricItem.clientId === clientId)
    .sort((a, b) => b.year - a.year || b.month - a.month)[0];
}

export function getPreviousMetric(clientId = clients[0].id) {
  return monthlyMetrics
    .filter((metricItem) => metricItem.clientId === clientId)
    .sort((a, b) => b.year - a.year || b.month - a.month)[1];
}

export function getAllDemoData(): PortalData {
  return {
    clients,
    selectedClient: clients[0],
    metrics: monthlyMetrics,
    campaigns,
    content: contentItems,
    reports,
    invoices,
    leaderboards,
    scores,
    alerts,
    tasks,
    calendarEvents,
    integrations: [],
    connectedAssets: [],
    syncLogs: [],
    leadEvents: []
  };
}
