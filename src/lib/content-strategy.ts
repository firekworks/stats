import type { Client, ContentIdea, ContentType } from "@/lib/types";

const formats: ContentType[] = ["Reel", "Carrusel", "Post", "Story", "Anuncio", "Landing"];

export function generateContentIdeas({
  client,
  objective = "captación local",
  count = 8
}: {
  client: Client;
  objective?: string;
  count?: number;
}): ContentIdea[] {
  const audience = client.targetAudience ?? "clientes locales";
  const service = client.services?.[0] ?? "servicio principal";
  const base = [
    {
      title: `Antes de elegir ${service}`,
      funnelStage: "Confianza",
      cta: "Pedir información",
      strategicReason: "Reduce fricción explicando el proceso antes de vender."
    },
    {
      title: `3 señales de que necesitas ${client.industry.toLowerCase()}`,
      funnelStage: "Atracción",
      cta: "Enviar mensaje",
      strategicReason: "Convierte una necesidad difusa en una acción sencilla."
    },
    {
      title: `Cómo trabajamos en ${client.city}`,
      funnelStage: "Confianza",
      cta: "Conocer el plan",
      strategicReason: "Aterriza la promesa en una prueba local y concreta."
    },
    {
      title: `Oferta local para esta semana`,
      funnelStage: "Conversión",
      cta: "Reservar por WhatsApp",
      strategicReason: "Crea urgencia sin depender de descuentos agresivos."
    },
    {
      title: `Caso real explicado paso a paso`,
      funnelStage: "Consideración",
      cta: "Ver disponibilidad",
      strategicReason: "Aumenta confianza con prueba y contexto."
    },
    {
      title: `Objeciones frecuentes antes de empezar`,
      funnelStage: "Remarketing",
      cta: "Resolver dudas",
      strategicReason: "Recupera usuarios que interactuaron pero no convirtieron."
    },
    {
      title: `La diferencia entre hacerlo solo y hacerlo con guía`,
      funnelStage: "Consideración",
      cta: "Solicitar diagnóstico",
      strategicReason: "Eleva percepción de valor del servicio."
    },
    {
      title: `Lo que pasa después de pedir cita`,
      funnelStage: "Conversión",
      cta: "Pedir cita",
      strategicReason: "Hace más predecible la experiencia posterior al lead."
    }
  ];

  return base.slice(0, count).map((idea, index) => ({
    title: idea.title,
    objective,
    format: formats[index % formats.length],
    funnelStage: idea.funnelStage,
    copyBase: `${audience}: ${idea.title}. Tono ${client.brandVoice ?? "claro, local y directo"}.`,
    cta: idea.cta,
    visualBrief: buildVisualBrief(client, idea.funnelStage),
    strategicReason: idea.strategicReason
  }));
}

function buildVisualBrief(client: Client, stage: string) {
  const palette = client.brandColors?.length
    ? client.brandColors.join(", ")
    : "blanco, negro Firekworks y acento azul";

  return `Formato limpio con paleta ${palette}. Mostrar ${client.industry} en ${client.city}, fase ${stage}, prueba visual real y CTA final.`;
}
