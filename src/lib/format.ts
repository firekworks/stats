export const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

export function formatPercent(value: number) {
  return `${formatDecimal(value, 1)}%`;
}

export function formatMonth(month: number, year: number) {
  return `${monthNames[month - 1]} ${year}`;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Activa",
    learning: "Aprendizaje",
    paused: "Pausada",
    completed: "Completada",
    draft: "Borrador",
    idea: "Idea",
    recorded: "Grabado",
    editing: "Editando",
    pending_approval: "Pendiente",
    scheduled: "Programado",
    published: "Publicado",
    sent: "Enviada",
    paid: "Pagada",
    overdue: "Vencida",
    cancelled: "Cancelada",
    generated: "Generado",
    connected: "Conectada",
    revoked: "Revocada",
    pending: "Pendiente",
    confirmed: "Confirmado",
    error: "Error",
    disconnected: "Desconectada",
    open: "Abierta",
    in_progress: "En curso",
    done: "Hecha",
    planned: "Planificado",
    approved: "Aprobado",
    promoted: "Promocionado",
    reported: "Reportado"
  };

  return labels[status] ?? status;
}
