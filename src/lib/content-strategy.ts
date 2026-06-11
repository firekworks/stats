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
  storyCount: number;
  gbpPosts: number;
  whatsapp: string;
  report: string;
  adsRecommended: string;
  objective: string;
};

export type Playbook = {
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
  typicalObjectives?: string[];
  tofuIdeas?: string[];
  mofuIdeas?: string[];
  bofuIdeas?: string[];
  reelIdeas?: string[];
  carouselIdeas?: string[];
  storyIdeas?: string[];
  gbpIdeas?: string[];
  objections?: string[];
  recommendedCalendar?: string;
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
    storyCount: 6,
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
    storyCount: 10,
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
    sector: "Clinica dental",
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
  },
  {
    sector: "Cafeteria",
    usualObjective: "Aumentar desayunos, meriendas y visitas recurrentes.",
    pains: ["Elegir siempre lo mismo", "No recordar opciones cercanas", "Falta de plan rapido"],
    recommendedTone: "Cercano, cotidiano, visual y apetecible.",
    visualStyle: "Café, vitrinas, mesas reales, equipo y ritmo de barrio.",
    offers: ["Desayuno especial", "Merienda de temporada", "Combo cafe + dulce"],
    promise: "Un momento facil y cercano para repetir durante la semana.",
    contentAngles: ["cafe servido", "dulce del dia", "mesa de mañana", "cliente recurrente"],
    ctas: ["Ven esta semana", "Pide por WhatsApp", "Guarda este plan"],
    gbpChecklist: ["Publicar producto de temporada", "Actualizar horario", "Subir foto de vitrina"],
    whatsappChecklist: ["Respuesta para reservas", "Mensaje de pedidos", "Etiqueta: cliente habitual"],
    typicalObjectives: ["Visitas de mañana", "Meriendas", "Repetición"],
    tofuIdeas: ["Plan de desayuno local", "Producto estrella en 7 segundos"],
    mofuIdeas: ["Por qué este café sabe distinto", "Cómo se prepara el dulce del día"],
    bofuIdeas: ["Combo de la semana", "Reserva mesa o encargo"],
    reelIdeas: ["Café en primer plano", "Vitrina antes de abrir"],
    carouselIdeas: ["3 desayunos según tu mañana"],
    storyIdeas: ["Encuesta dulce/salado", "Últimas unidades"],
    gbpIdeas: ["Foto producto", "Novedad semanal"],
    objections: ["No sé si está abierto", "No sé qué pedir"],
    recommendedCalendar: "Reels lunes/jueves, stories diarias ligeras, GBP martes/viernes."
  },
  {
    sector: "Pizzeria",
    usualObjective: "Pedidos, reservas y ventas de fin de semana.",
    pains: ["No saber qué cenar", "Comparar opciones", "Pedir tarde"],
    recommendedTone: "Directo, familiar, sabroso y local.",
    visualStyle: "Horno, masa, queso, manos y mesas compartidas.",
    offers: ["Pizza especial", "Pack familiar", "Reserva fin de semana"],
    promise: "Resolver la cena con una opción fácil, rica y cercana.",
    contentAngles: ["masa en horno", "queso fundido", "pack familiar", "viernes noche"],
    ctas: ["Pedir ahora", "Reservar mesa", "Enviar WhatsApp"],
    gbpChecklist: ["Subir pizza destacada", "Publicar horario de reparto", "Responder reseñas"],
    whatsappChecklist: ["Respuesta pedido", "Etiqueta: pedido caliente", "Mensaje carta"],
    typicalObjectives: ["Pedidos", "Reservas", "Repetición"],
    tofuIdeas: ["Pizza saliendo del horno"],
    mofuIdeas: ["Ingredientes reales y proceso"],
    bofuIdeas: ["Oferta familiar fin de semana"],
    reelIdeas: ["Estirado de masa", "Corte de porción"],
    carouselIdeas: ["Las 5 pizzas más pedidas"],
    storyIdeas: ["Votación ingrediente", "Cuenta atrás cena"],
    gbpIdeas: ["Nueva pizza", "Horario reparto"],
    objections: ["No sé si reparte", "No sé precios"],
    recommendedCalendar: "Fuerte jueves-domingo, stories antes de cenas."
  },
  {
    sector: "Peluqueria premium",
    usualObjective: "Citas para color, tratamientos y cambios de look.",
    pains: ["Miedo a mal resultado", "No saber qué pedir", "Falta de confianza"],
    recommendedTone: "Elegante, experto, cercano y visual.",
    visualStyle: "Antes/después, detalle de cabello, equipo y proceso limpio.",
    offers: ["Diagnóstico capilar", "Color premium", "Tratamiento reparador"],
    promise: "Cambiar o cuidar el pelo con criterio profesional y resultado natural.",
    contentAngles: ["diagnostico", "antes y despues", "brillo", "asesoria"],
    ctas: ["Reservar diagnóstico", "Consultar disponibilidad", "Pedir cita"],
    gbpChecklist: ["Actualizar servicios", "Subir antes/después", "Pedir reseña"],
    whatsappChecklist: ["Respuesta cita", "Etiqueta: color", "Recordatorio preparación"],
    typicalObjectives: ["Citas", "Tratamientos premium", "Fidelización"],
    tofuIdeas: ["Error habitual al elegir color"],
    mofuIdeas: ["Proceso de diagnóstico"],
    bofuIdeas: ["Hueco disponible esta semana"],
    reelIdeas: ["Transformación natural", "Brillo final"],
    carouselIdeas: ["Qué revisar antes de teñirte"],
    storyIdeas: ["Agenda de huecos", "Preguntas frecuentes"],
    gbpIdeas: ["Servicio destacado", "Foto resultado"],
    objections: ["Me da miedo estropearme el pelo", "No sé precio"],
    recommendedCalendar: "Antes/después semanales, stories de agenda, GBP con servicios."
  },
  {
    sector: "Barberia",
    usualObjective: "Reservas recurrentes y servicios premium.",
    pains: ["No encontrar hueco", "Corte irregular", "Falta de estilo definido"],
    recommendedTone: "Directo, cuidado, masculino y local.",
    visualStyle: "Detalles de corte, barba, herramientas, silla y resultado final.",
    offers: ["Corte + barba", "Arreglo premium", "Reserva semanal"],
    promise: "Salir con un corte limpio y mantener estilo sin complicarse.",
    contentAngles: ["degradado", "barba", "ritual", "resultado final"],
    ctas: ["Reservar hueco", "Pedir cita", "Escribir por WhatsApp"],
    gbpChecklist: ["Subir corte reciente", "Actualizar horarios", "Responder reseñas"],
    whatsappChecklist: ["Respuesta reserva", "Etiqueta: corte recurrente", "Recordatorio cita"],
    typicalObjectives: ["Reservas", "Recurrencia"],
    tofuIdeas: ["Antes/después rápido"],
    mofuIdeas: ["Cómo elegir corte según rostro"],
    bofuIdeas: ["Huecos de la semana"],
    reelIdeas: ["Degradado en transición", "Barba perfilada"],
    carouselIdeas: ["3 señales de que toca repaso"],
    storyIdeas: ["Huecos disponibles", "Resultado del día"],
    gbpIdeas: ["Corte destacado", "Horario actualizado"],
    objections: ["No sé si hay hueco", "No sé qué corte pedir"],
    recommendedCalendar: "Reels martes/jueves, stories con huecos, GBP semanal."
  },
  {
    sector: "Fisio",
    usualObjective: "Citas de valoración y tratamientos recurrentes.",
    pains: ["Dolor que se alarga", "No saber si esperar", "Miedo a empeorar"],
    recommendedTone: "Profesional, claro, calmado y educativo.",
    visualStyle: "Ejercicios simples, camilla, explicación, equipo y progreso.",
    offers: ["Valoración inicial", "Sesión de descarga", "Plan de recuperación"],
    promise: "Entender qué pasa y qué hacer para mejorar sin promesas vacías.",
    contentAngles: ["dolor habitual", "ejercicio guiado", "valoracion", "mito frecuente"],
    ctas: ["Pedir valoración", "Consultar tu caso", "Reservar cita"],
    gbpChecklist: ["Publicar consejo", "Actualizar tratamientos", "Pedir reseña"],
    whatsappChecklist: ["Respuesta dolor", "Etiqueta: valoración", "Mensaje previo cita"],
    typicalObjectives: ["Valoraciones", "Citas", "Confianza profesional"],
    tofuIdeas: ["Señal de alerta sencilla"],
    mofuIdeas: ["Qué ocurre en una primera sesión"],
    bofuIdeas: ["Pide valoración esta semana"],
    reelIdeas: ["Ejercicio de 20 segundos", "Explicación con modelo"],
    carouselIdeas: ["Cuándo no esperar con dolor"],
    storyIdeas: ["Pregunta de dolor", "Huecos semana"],
    gbpIdeas: ["Consejo semanal", "Servicio destacado"],
    objections: ["No sé si mi caso es para fisio", "No tengo tiempo"],
    recommendedCalendar: "Educativo al inicio de semana, conversión jueves/viernes."
  },
  {
    sector: "Academia",
    usualObjective: "Matrículas, pruebas de nivel y reservas informativas.",
    pains: ["No avanzar", "Miedo a suspender", "No saber nivel"],
    recommendedTone: "Didáctico, claro, motivador y cercano.",
    visualStyle: "Aula real, profesores, alumnos, progreso y recursos.",
    offers: ["Prueba de nivel", "Clase de prueba", "Plazas abiertas"],
    promise: "Saber por dónde empezar y tener un plan claro.",
    contentAngles: ["prueba de nivel", "progreso", "profesor explicando", "caso alumno"],
    ctas: ["Reservar prueba", "Pedir información", "Ver plazas"],
    gbpChecklist: ["Publicar curso", "Actualizar horarios", "Subir aula"],
    whatsappChecklist: ["Respuesta info", "Etiqueta: matrícula", "Seguimiento 48h"],
    typicalObjectives: ["Matrículas", "Pruebas de nivel"],
    tofuIdeas: ["Error común al estudiar"],
    mofuIdeas: ["Cómo funciona el método"],
    bofuIdeas: ["Plazas abiertas este mes"],
    reelIdeas: ["Profesor resolviendo duda", "Antes/después alumno"],
    carouselIdeas: ["Checklist para elegir academia"],
    storyIdeas: ["Test rápido", "Preguntas"],
    gbpIdeas: ["Curso destacado", "Novedad de plazas"],
    objections: ["No sé mi nivel", "No sé horarios"],
    recommendedCalendar: "Más fuerte antes de inicio de mes y campañas escolares."
  },
  {
    sector: "Veterinario",
    usualObjective: "Citas, revisiones y servicios preventivos.",
    pains: ["No saber si esperar", "Miedo por la mascota", "Olvidar revisiones"],
    recommendedTone: "Tranquilo, profesional, empático y claro.",
    visualStyle: "Equipo, consulta, mascotas tranquilas y cuidado preventivo.",
    offers: ["Revisión preventiva", "Vacunación", "Consulta inicial"],
    promise: "Cuidar a tu mascota con criterio y sin alarmismo.",
    contentAngles: ["señales a vigilar", "revision", "equipo", "prevencion"],
    ctas: ["Reservar cita", "Consultar síntoma", "Pedir revisión"],
    gbpChecklist: ["Publicar consejo", "Actualizar servicios", "Responder reseñas"],
    whatsappChecklist: ["Respuesta consulta", "Etiqueta: revisión", "Recordatorio vacuna"],
    typicalObjectives: ["Citas", "Prevención", "Confianza"],
    tofuIdeas: ["Señal que no conviene ignorar"],
    mofuIdeas: ["Qué se revisa en consulta"],
    bofuIdeas: ["Agenda revisión"],
    reelIdeas: ["Tip rápido", "Equipo en consulta"],
    carouselIdeas: ["Calendario preventivo"],
    storyIdeas: ["Pregunta mascota", "Recordatorio"],
    gbpIdeas: ["Consejo", "Servicio"],
    objections: ["No sé si es urgente", "No sé precio"],
    recommendedCalendar: "Educativo semanal y recordatorios preventivos."
  },
  {
    sector: "Taller mecanico",
    usualObjective: "Citas de revisión, mantenimiento y reparaciones.",
    pains: ["Ruido extraño", "Miedo a factura alta", "No saber si el taller es fiable"],
    recommendedTone: "Claro, honesto, técnico sin complicar y local.",
    visualStyle: "Proceso, diagnóstico, piezas reales, equipo y antes/después.",
    offers: ["Revisión preventiva", "Diagnóstico", "Mantenimiento"],
    promise: "Entender qué le pasa al coche antes de decidir.",
    contentAngles: ["ruido comun", "revision", "pieza desgastada", "consejo"],
    ctas: ["Pedir cita", "Consultar avería", "Reservar revisión"],
    gbpChecklist: ["Publicar revisión", "Actualizar servicios", "Pedir reseña"],
    whatsappChecklist: ["Respuesta avería", "Etiqueta: diagnóstico", "Seguimiento presupuesto"],
    typicalObjectives: ["Citas", "Confianza", "Mantenimiento"],
    tofuIdeas: ["Señal de avería"],
    mofuIdeas: ["Cómo diagnosticamos"],
    bofuIdeas: ["Reserva revisión"],
    reelIdeas: ["Pieza comparada", "Ruido explicado"],
    carouselIdeas: ["Checklist antes de viaje"],
    storyIdeas: ["Huecos taller", "Pregunta rápida"],
    gbpIdeas: ["Servicio revisión", "Consejo"],
    objections: ["Me van a cobrar de más", "No tengo tiempo"],
    recommendedCalendar: "Consejos antes de fines de semana y campañas pre-viajes."
  },
  {
    sector: "Inmobiliaria",
    usualObjective: "Captar propietarios y compradores cualificados.",
    pains: ["No saber precio real", "Miedo a malvender", "Perder tiempo con visitas"],
    recommendedTone: "Profesional, cercano, experto y transparente.",
    visualStyle: "Viviendas reales, barrio, datos simples, asesor explicando.",
    offers: ["Valoración gratuita", "Plan de venta", "Búsqueda personalizada"],
    promise: "Tomar decisiones inmobiliarias con datos y acompañamiento.",
    contentAngles: ["valoracion", "barrio", "error al vender", "visita"],
    ctas: ["Pedir valoración", "Consultar vivienda", "Hablar con asesor"],
    gbpChecklist: ["Publicar vivienda destacada", "Actualizar zona", "Responder reseñas"],
    whatsappChecklist: ["Respuesta valoración", "Etiqueta: propietario", "Seguimiento visita"],
    typicalObjectives: ["Captación propietarios", "Compradores"],
    tofuIdeas: ["Error al poner precio"],
    mofuIdeas: ["Cómo hacemos valoración"],
    bofuIdeas: ["Agenda valoración"],
    reelIdeas: ["Tour rápido", "Dato del barrio"],
    carouselIdeas: ["Checklist antes de vender"],
    storyIdeas: ["Encuesta vivienda", "Pregunta precio"],
    gbpIdeas: ["Vivienda", "Servicio valoración"],
    objections: ["No quiero comprometerme", "No sé cuánto vale"],
    recommendedCalendar: "Educativo martes, vivienda jueves, captación domingo."
  },
  {
    sector: "Tienda de moda",
    usualObjective: "Visitas a tienda, ventas de colección y fidelización.",
    pains: ["No saber combinar", "No ver novedades", "Comprar siempre igual"],
    recommendedTone: "Estiloso, cercano, visual y práctico.",
    visualStyle: "Looks reales, probador, escaparate, detalles y equipo.",
    offers: ["Nueva colección", "Look de temporada", "Asesoría rápida"],
    promise: "Encontrar algo que encaje contigo sin complicarte.",
    contentAngles: ["look completo", "novedad", "probador", "detalle"],
    ctas: ["Ven a probar", "Reserva prenda", "Preguntar talla"],
    gbpChecklist: ["Publicar novedad", "Actualizar horario", "Subir escaparate"],
    whatsappChecklist: ["Respuesta talla", "Etiqueta: reserva prenda", "Aviso llegada"],
    typicalObjectives: ["Ventas", "Visitas", "Reservas"],
    tofuIdeas: ["Look de 10 segundos"],
    mofuIdeas: ["Cómo combinar una prenda"],
    bofuIdeas: ["Reserva tu talla"],
    reelIdeas: ["Cambio de look", "Escaparate"],
    carouselIdeas: ["3 formas de llevarlo"],
    storyIdeas: ["Vota look", "Últimas tallas"],
    gbpIdeas: ["Novedad", "Evento tienda"],
    objections: ["No sé si me queda", "No sé tallas"],
    recommendedCalendar: "Reels de looks, stories de stock, GBP con novedades."
  },
  {
    sector: "Hotel/alojamiento",
    usualObjective: "Reservas directas, escapadas y ocupación en fechas clave.",
    pains: ["No saber dónde alojarse", "Miedo a mala experiencia", "Comparar demasiado"],
    recommendedTone: "Aspiracional, claro, local y confiable.",
    visualStyle: "Habitaciones reales, entorno, desayuno, experiencia y detalles.",
    offers: ["Escapada de fin de semana", "Reserva directa", "Pack experiencia"],
    promise: "Una estancia clara, cómoda y fácil de reservar.",
    contentAngles: ["habitacion", "entorno", "desayuno", "plan fin de semana"],
    ctas: ["Consultar disponibilidad", "Reservar directo", "Pedir fechas"],
    gbpChecklist: ["Subir habitación", "Publicar plan local", "Responder reseñas"],
    whatsappChecklist: ["Respuesta disponibilidad", "Etiqueta: reserva", "Mensaje pre-llegada"],
    typicalObjectives: ["Reservas", "Ocupación", "Reserva directa"],
    tofuIdeas: ["Plan de escapada"],
    mofuIdeas: ["Qué incluye la estancia"],
    bofuIdeas: ["Fechas disponibles"],
    reelIdeas: ["Room tour", "Desayuno"],
    carouselIdeas: ["Plan de 24h en la zona"],
    storyIdeas: ["Disponibilidad", "Pregunta fechas"],
    gbpIdeas: ["Habitación", "Oferta escapada"],
    objections: ["No sé disponibilidad", "No sé si merece la pena"],
    recommendedCalendar: "Inspiración domingo/lunes, conversión jueves."
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

export function resolveClientPack(client: Client, forcedPack?: 390 | 590 | null) {
  if (forcedPack === 590) return defaultPacks[1];
  if (forcedPack === 390) return defaultPacks[0];

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
  objective,
  packPrice,
  offer,
  mainPain,
  targetAudience,
  tone,
  visualStyle,
  adBudget
}: {
  client: Client;
  date?: Date;
  objective?: string;
  packPrice?: 390 | 590 | null;
  offer?: string | null;
  mainPain?: string | null;
  targetAudience?: string | null;
  tone?: string | null;
  visualStyle?: string | null;
  adBudget?: string | null;
}): CampaignPlan {
  const pack = resolveClientPack(client, packPrice);
  const playbook = resolvePlaybook(client.industry);
  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric"
  }).format(date);
  const commercialObjective = objective || client.objective || playbook.usualObjective;
  const resolvedOffer = offer || playbook.offers[0] || "Oferta del mes";
  const audience = targetAudience || client.targetAudience || `Clientes locales de ${client.city}`;
  const resolvedPain = mainPain || playbook.pains[0] || "Falta de confianza";
  const pieces = buildPieces({
    client,
    date,
    pack,
    playbook,
    objective: commercialObjective,
    offer: resolvedOffer,
    painOverride: resolvedPain
  });

  return {
    monthLabel,
    packName: pack.label,
    packPrice: pack.price,
    objective: commercialObjective,
    offer: resolvedOffer,
    targetAudience: audience,
    mainPain: resolvedPain,
    promise: playbook.promise,
    brandTone: tone || client.brandVoice || playbook.recommendedTone,
    visualStyle: visualStyle || playbook.visualStyle,
    recommendedAdBudget: adBudget || pack.adsRecommended,
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
  objective,
  offer,
  painOverride
}: {
  client: Client;
  date: Date;
  pack: PackConfig;
  playbook: Playbook;
  objective: string;
  offer: string;
  painOverride: string;
}) {
  const formats: ContentType[] = [
    ...Array.from({ length: pack.reels }, () => "Reel" as const),
    ...Array.from({ length: pack.carousels }, () => "Carrusel" as const),
    ...Array.from({ length: pack.posts }, () => "Post" as const),
    ...Array.from({ length: pack.storyCount }, () => "Story" as const),
    ...Array.from({ length: pack.gbpPosts }, () => "GBP" as const),
    "WhatsApp"
  ];
  const counters = new Map<string, number>();

  return formats.map((format, index) => {
    const prefix = contentPrefix(format);
    const next = (counters.get(prefix) ?? 0) + 1;
    counters.set(prefix, next);
    const pain =
      index === 0
        ? painOverride
        : playbook.pains[index % playbook.pains.length] ?? painOverride;
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
        desire: `Presentar ${offer} como una solucion concreta y facil de entender.`,
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
