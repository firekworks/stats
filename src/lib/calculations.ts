import type { ClientLevel, RoiMode } from "@/lib/types";

export function calculateEstimatedRevenue(
  leadsOrBookings: number,
  averageTicket: number
) {
  return leadsOrBookings * averageTicket;
}

export function calculateTotalInvestment(
  adSpend: number,
  serviceFee: number,
  extras = 0
) {
  return adSpend + serviceFee + extras;
}

export function calculateRoi(
  revenue: number,
  totalInvestment: number,
  mode: RoiMode = "estimated"
) {
  if (mode === "insufficient_data" || totalInvestment <= 0) {
    return null;
  }

  return revenue / totalInvestment;
}

export function calculateClientScore(input: {
  punctualPayment: number;
  responseApprovals: number;
  collaboration: number;
  profitability: number;
  growth: number;
  churnRisk: number;
}) {
  const weights = {
    punctualPayment: 0.2,
    responseApprovals: 0.2,
    collaboration: 0.2,
    profitability: 0.2,
    growth: 0.1,
    churnRisk: 0.1
  };

  return Math.round(
    input.punctualPayment * weights.punctualPayment * 20 +
      input.responseApprovals * weights.responseApprovals * 20 +
      input.collaboration * weights.collaboration * 20 +
      input.profitability * weights.profitability * 20 +
      input.growth * weights.growth * 20 +
      (6 - input.churnRisk) * weights.churnRisk * 20
  );
}

export function levelFromScore(score: number): ClientLevel {
  if (score >= 90) return 5;
  if (score >= 74) return 4;
  if (score >= 58) return 3;
  if (score >= 38) return 2;
  return 1;
}

export function levelName(level: ClientLevel) {
  return (
    {
      1: "Nuevo",
      2: "Colaborador",
      3: "Pro",
      4: "Partner",
      5: "VIP"
    } satisfies Record<ClientLevel, string>
  )[level];
}

export function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}
