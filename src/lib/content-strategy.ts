import type { CampaignPlan, Client, ContentIdea, ContentType } from "@/lib/types";

export type PackConfig = {
  id: "pack-390" | "pack-590";
  label: string;
  price: 390 | 590;
  focus: string;
  reels: number;
  carousels: number;
  posts: number;
  stories: string;
  gbpPosts: number;
  whatsapp: string;
  report: string;
  adsRecommended: string;
  objective: string;
};

type Playbook = {
  sector: string;
  usualObjective: string;
  pains: string[];
  recommendedTone: string;
  visualStyle: string;
  offers: string[];
  promise: string;
  contentAngles: string[];
  ctas: string[];
  gbpChecklist: string[];
  whatsappChecklist: string[];
};

export const defaultPacks: PackConfig[] = [
  {
    id: "pack-390",
    label: "Pack 390 - Base local",
    price: 390,
    focus: "Presencia profesional minima y captacion basica.",
    reels: 2,
    carousels: 1,
    posts: 1,
    stories: "6-8",
    gbpPosts: 2,
    whatsapp: "1 respuesta rapida",
    report: "Informe mensual simple",
    adsRecommended: "60-90 EUR",
    objective:
      "Empezar a generar presencia, confianza y primeros contactos sin saturar presupuesto."
  },
  {
    id: "pack-590",
    label: "Pack 590 - Crecimiento local",
    price: 590,
    focus: "Embudo local mas completo.",
    reels: 4,
    carousels: 2,
    posts: 1,
    stories: "10-15",
    gbpPosts: 4,
    whatsapp: "Setup basico con etiquetas y respuestas rapidas",
    report: "Informe mensual completo",
    adsRecommended: "90-150 EUR",
    objective: "Captar clientes de forma mas constante y medible."
  }
];

export const defaultPlaybooks: Playbook[] = [
  {
    sector: "Restaurante",
    usualObjective: "Reservas y visitas de fin de semana.",
    pains: ["No saber donde cenar", "Falta de plan", "Hambre visual", "Reservar tarde"],
    recommendedTone: "Cercano, apetitoso, local y directo.",
    visualStyle: "Producto real, ambiente, equipo, reservas y momentos de grupo.",
    offers: ["Reserva de fin de semana", "Menu especial", "Mesa para grupos"],
    promise: "Un plan facil, cercano y apetecible para reservar sin pensarlo demasiado.",
    contentAngles: ["plato estrella", "ambiente de viernes", "mesa preparada", "equipo en cocina"],
    ctas: ["Reservar por WhatsApp", "Pedir mesa", "Ver disponibilidad"],
    gbpChecklist: ["Subir plato destacado", "Publicar horario de fin de semana", "Pedir 2 reseñas nuevas"],
    whatsappChecklist: ["Respuesta rapida de reservas", "Mensaje con horario", "Etiqueta: reserva caliente"]
  },
  {
    sector: "Dentista",
    usualObjective: "Primeras visitas y revisiones.",
    pains: ["Miedo", "Aplazar revisiones", "Dolor", "Dudas sobre precio", "Falta de confianza"],
    recommendedTone: "Profesional, tranquilo, claro y humano.",
    visualStyle: "Equipo, gabinete limpio, explicaciones sencillas y proceso sin presion.",
    offers: ["Primera revision", "Limpieza", "Valoracion sin compromiso"],
    promise: "Entender que necesitas antes de decidir ningun tratamiento.",
    contentAngles: ["primera visita sin miedo", "revision explicada", "senales para no esperar", "equipo cercano"],
    ctas: ["Pedir revision", "Resolver dudas", "Reservar primera visita"],
    gbpChecklist: ["Actualizar servicios", "Publicar caso educativo", "Responder reseñas recientes"],
    whatsappChecklist: ["Respuesta rapida para primera visita", "Etiqueta: pendiente cita", "Recordatorio amable"]
  },
  {
    sector: "Clinica estetica",
    usualObjective: "Valoraciones y consultas cualificadas.",
    pains: ["Miedo a malos resultados", "Dudas sobre naturalidad", "No saber que tratamiento elegir"],
    recommendedTone: "Experto, elegante, prudente y orientado a diagnostico.",
    visualStyle: "Naturalidad, diagnostico, detalle y confianza profesional.",
    offers: ["Valoracion inicial", "Diagnostico personalizado", "Plan natural"],
    promise: "Recomendar solo lo que encaja con tu caso y tus expectativas.",
    contentAngles: ["naturalidad", "diagnostico antes de recomendar", "errores comunes", "confianza del equipo"],
    ctas: ["Pedir valoracion", "Consultar tu caso", "Reservar diagnostico"],
    gbpChecklist: ["Publicar consejo profesional", "Actualizar fotos de centro", "Pedir reseña de experiencia"],
    whatsappChecklist: ["Respuesta de valoracion", "Etiqueta: interes estetica", "Mensaje de preparacion"]
  },
  {
    sector: "Gimnasio",
    usualObjective: "Pruebas, altas y reservas de clase.",
    pains: ["Empezar y sentirse perdido", "Falta de constancia", "Verguenza del primer dia"],
    recommendedTone: "Energetico, motivador, directo y acompanado.",
    visualStyle: "Entrenos reales, ambiente, primer dia, grupo y progreso visible.",
    offers: ["Clase de prueba", "Semana de inicio", "Valoracion inicial"],
    promise: "Entrar sin sentirte perdido y saber que hacer desde el primer dia.",
    contentAngles: ["primer dia", "grupo entrenando", "reto corto", "antes de empezar"],
    ctas: ["Probar esta semana", "Reservar clase", "Pedir plaza"],
    gbpChecklist: ["Publicar clase destacada", "Actualizar horarios", "Subir foto de grupo"],
    whatsappChecklist: ["Respuesta rapida clase de prueba", "Etiqueta: prueba reservada", "Mensaje de bienvenida"]
  }
];

const fallbackPlaybook: Playbook = {
  sector: "Local",
  usualObjective: "Generar contactos locales cualificados.",
  pains: ["No saber a quien elegir", "Falta de confianza", "Necesidad de respuesta rapida"],
  recommendedTone: "Claro, local, directo y profesional.",
  visualStyle: "Prueba real, proceso simple, equipo y CTA visible.",
  offers: ["Primera consulta", "Diagnostico local", "Oferta del mes"],
  promise: "Entender el valor antes de dar el paso.",
  contentAngles: ["problema habitual", "proceso paso a paso", "prueba local", "objecion frecuente"],
  ctas: ["Pedir informacion", "Reservar por WhatsApp", "Consultar disponibilidad"],
  gbpChecklist: ["Publicar novedad", "Actualizar servicios", "Solicitar reseña"],
  whatsappChecklist: ["Respuesta rapida inicial", "Etiqueta: nuevo contacto", "Seguimiento 24h"]
};

export function resolveClientPack(client: Client) {
  const text = `${client.planName} ${client.monthlyFee}`.toLowerCase();

  if (text.includes("590") || client.monthlyFee >= 540) {
    return defaultPacks[1];
  }

  return defaultPacks[0];
}

export function resolvePlaybook(industry: string) {
  const normalized = normalize(industry);

  return (
    defaultPlaybooks.find((playbook) => {
      const sector = normalize(playbook.sector);
      return normalized.includes(sector) || sector.includes(normalized);
    }) ?? fallbackPlaybook
  );
}

export function generateMonthlyCampaignPlan({
  client,
  date = new Date(),
  objective
}: {
  client: Client;
  date?: Date;
  objective?: string;
}): CampaignPlan {
  const pack = resolveClientPack(client);
  const playbook = resolvePlaybook(client.industry);
  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric"
  }).format(date);
  const commercialObjective = objective || client.objective || playbook.usualObjective;
  const offer = playbook.offers[0] ?? "Oferta del mes";
  const audience = client.targetAudience || `Clientes locales de ${client.city}`;
  const mainPain = playbook.pains[0] ?? "Falta de confianza";
  const pieces = buildPieces({ client, date, pack, playbook, objective: commercialObjective });

  return {
    monthLabel,
    packName: pack.label,
    packPrice: pack.price,
    objective: commercialObjective,
    offer,
    targetAudience: audience,
    mainPain,
    promise: playbook.promise,
    brandTone: client.brandVoice || playbook.recommendedTone,
    visualStyle: playbook.visualStyle,
    recommendedAdBudget: pack.adsRecommended,
    gbpChecklist: playbook.gbpChecklist,
    whatsappChecklist: playbook.whatsappChecklist,
    calendarSummary: `${pieces.length} piezas internas planificadas para ${monthLabel}.`,
    internalStatus: "Borrador interno",
    pieces
  };
}

export function generateContentIdeas({
  client,
  objective = "captacion local",
  count = 8
}: {
  client: Client;
  objective?: string;
  count?: number;
}): ContentIdea[] {
  return generateMonthlyCampaignPlan({ client, objective }).pieces.slice(0, count);
}

function buildPieces({
  client,
  date,
  pack,
  playbook,
  objective
}: {
  client: Client;
  date: Date;
  pack: PackConfig;
  playbook: Playbook;
  objective: string;
}) {
  const formats: ContentType[] = [
    ...Array.from({ length: pack.reels }, () => "Reel" as const),
    ...Array.from({ length: pack.carousels }, () => "Carrusel" as const),
    ...Array.from({ length: pack.posts }, () => "Post" as const),
    ...Array.from({ length: pack.price === 390 ? 2 : 4 }, () => "Story" as const),
    ...Array.from({ length: pack.gbpPosts }, () => "GBP" as const),
    "WhatsApp"
  ];
  const counters = new Map<string, number>();

  return formats.map((format, index) => {
    const prefix = contentPrefix(format);
    const next = (counters.get(prefix) ?? 0) + 1;
    counters.set(prefix, next);
    const pain = playbook.pains[index % playbook.pains.length] ?? playbook.pains[0];
    const angle = playbook.contentAngles[index % playbook.contentAngles.length] ?? playbook.contentAngles[0];
    const cta = playbook.ctas[index % playbook.ctas.length] ?? "Pedir informacion";
    const stage = internalStage(index, formats.length);
    const suggestedDate = suggestedPublishDate(date, index + 2);
    const title = titleFor(format, client, angle);
    const hook = hookFor(playbook.sector, pain, angle);
    const screenText = screenTextFor(format, pain, cta);
    const voiceover = voiceoverFor(playbook.sector, client.city, pain, cta);

    return {
      code: `${prefix}-${String(next).padStart(3, "0")}`,
      title,
      objective,
      format,
      funnelStage: stage,
      pain,
      centralIdea: `${angle}: convertir ${pain.toLowerCase()} en una accion sencilla.`,
      hook,
      screenText,
      voiceover,
      shot1: `Plano 1: apertura con ${angle} en contexto real de ${client.industry}.`,
      shot2: `Plano 2: detalle del proceso, equipo o resultado que resuelve "${pain}".`,
      shot3: `Plano 3: cierre con prueba local y CTA "${cta}".`,
      broll: `Recurso de apoyo: fachada, equipo, manos trabajando y detalle del resultado.`,
      resources: `Necesario: 3 clips verticales, 1 foto limpia, datos de horario/oferta y enlace WhatsApp.`,
      suggestedDate,
      promoted: ["Reel", "Post", "Carrusel"].includes(format) && index < (pack.price === 390 ? 2 : 4),
      adsSuggestion:
        ["Reel", "Post", "Carrusel"].includes(format)
          ? `Promocionar con ${pack.adsRecommended} priorizando ${cta.toLowerCase()}.`
          : null,
      copyBase: `${client.publicName}: ${hook} ${voiceover}`,
      caption: captionFor(client, pain, cta),
      cta,
      visualBrief: `${playbook.visualStyle} Formato ${format}. Evitar stock: usar material real del negocio.`,
      strategicReason: `Pieza ${stage} para ${playbook.usualObjective.toLowerCase()} atacando "${pain}".`,
      aida: {
        attention: hook,
        interest: `Mostrar por que ${pain.toLowerCase()} bloquea la decision de compra local.`,
        desire: `Presentar ${offerPhrase(playbook)} como una solucion concreta y facil de entender.`,
        action: cta
      }
    } satisfies ContentIdea;
  });
}

function contentPrefix(format: ContentType) {
  if (format === "Reel") return "REEL";
  if (format === "Carrusel") return "CAR";
  if (format === "Story") return "STORY";
  if (format === "GBP") return "GBP";
  if (format === "WhatsApp") return "WA";
  return "POST";
}

function internalStage(index: number, total: number) {
  if (index < Math.ceil(total * 0.45)) return "TOFU";
  if (index < Math.ceil(total * 0.8)) return "MOFU";
  return "BOFU";
}

function suggestedPublishDate(date: Date, offset: number) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  day.setUTCDate(Math.min(26, 2 + offset * 2));
  return day.toISOString().slice(0, 10);
}

function titleFor(format: ContentType, client: Client, angle: string) {
  if (format === "GBP") return `GBP - ${angle}`;
  if (format === "WhatsApp") return `WhatsApp - respuesta ${client.industry.toLowerCase()}`;
  return `${format} - ${angle}`;
}

function hookFor(sector: string, pain: string, angle: string) {
  const normalized = normalize(sector);

  if (normalized.includes("restaurante")) {
    return `El plan de este finde empieza cuando ves ${angle}.`;
  }

  if (normalized.includes("dent") || normalized.includes("clinica")) {
    return `Si llevas tiempo aplazando esto por ${pain.toLowerCase()}, mira este primer paso.`;
  }

  if (normalized.includes("gimnasio")) {
    return `No necesitas estar en forma para empezar: necesitas un primer dia guiado.`;
  }

  return `Antes de decidir, mira como resolvemos ${pain.toLowerCase()}.`;
}

function screenTextFor(format: ContentType, pain: string, cta: string) {
  if (format === "Story") return `${pain}. Respuesta rapida: ${cta}.`;
  if (format === "GBP") return `Novedad local: ${cta}.`;
  if (format === "WhatsApp") return `Hola, quiero informacion.`;
  return `${pain}: solucion clara en 3 pasos.`;
}

function voiceoverFor(sector: string, city: string, pain: string, cta: string) {
  const place = city ? `en ${city}` : "cerca de ti";
  return `Si ${pain.toLowerCase()} te esta frenando, este negocio ${place} te lo pone facil. ${cta}.`;
}

function captionFor(client: Client, pain: string, cta: string) {
  return `${pain} no tiene por que frenar la decision. En ${client.publicName} lo hacemos facil, claro y local. ${cta}.`;
}

function offerPhrase(playbook: Playbook) {
  return playbook.offers[0] ?? "la oferta del mes";
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
