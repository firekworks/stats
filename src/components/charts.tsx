"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type { MonthlyMetric } from "@/lib/types";

export function MonthlyTrendChart({ metrics }: { metrics: MonthlyMetric[] }) {
  const data = metrics
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((item) => ({
      name: `${item.month}/${String(item.year).slice(2)}`,
      alcance: item.reach,
      leads: item.leads,
      inversion: item.totalInvestment
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="reachGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#0071e3" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#0071e3" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e5e5ea" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={formatCompactNumber}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          formatter={(value: number, name) =>
            name === "inversion" ? formatCurrency(value) : formatCompactNumber(value)
          }
          contentStyle={{
            border: "1px solid #e5e5ea",
            borderRadius: 16,
            boxShadow: "0 18px 50px rgba(29, 29, 31, 0.12)"
          }}
        />
        <Area
          type="monotone"
          dataKey="alcance"
          stroke="#0071e3"
          strokeWidth={3}
          fill="url(#reachGradient)"
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="#0f9f8f"
          strokeWidth={3}
          fill="transparent"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CampaignBars({
  data
}: {
  data: { name: string; leads: number; spend: number }[];
}) {
  const colors = ["#0071e3", "#0f9f8f", "#f97316", "#2f9e44"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#e5e5ea" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <Tooltip
          contentStyle={{
            border: "1px solid #e5e5ea",
            borderRadius: 16,
            boxShadow: "0 18px 50px rgba(29, 29, 31, 0.12)"
          }}
        />
        <Bar dataKey="leads" radius={[12, 12, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
