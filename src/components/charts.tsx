"use client";

import { formatCompactNumber } from "@/lib/format";
import type { MonthlyMetric } from "@/lib/types";

const chartColors = ["#0071e3", "#0f9f8f", "#f97316", "#2f9e44"];

export function MonthlyTrendChart({ metrics }: { metrics: MonthlyMetric[] }) {
  const data = metrics
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((item) => ({
      name: `${item.month}/${String(item.year).slice(2)}`,
      reach: item.reach,
      leads: item.leads
    }));
  const width = 720;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 34, left: 52 };
  const maxReach = Math.max(1, ...data.map((item) => item.reach));
  const maxLeads = Math.max(1, ...data.map((item) => item.leads));
  const reachPoints = data.map((item, index) =>
    pointFor(index, data.length, item.reach, maxReach, width, height, padding)
  );
  const leadPoints = data.map((item, index) =>
    pointFor(index, data.length, item.leads, maxLeads, width, height, padding)
  );
  const reachPath = toPath(reachPoints);
  const leadPath = toPath(leadPoints);
  const areaPath = toAreaPath(reachPoints, height - padding.bottom);

  return (
    <div className="simple-chart" aria-label="Evolucion mensual">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="reachFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0071e3" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0071e3" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding.top + ((height - padding.top - padding.bottom) / 3) * line;

          return (
            <line
              key={line}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="#e5e5ea"
              strokeWidth="1"
            />
          );
        })}
        <path d={areaPath} fill="url(#reachFill)" />
        <path d={reachPath} fill="none" stroke="#0071e3" strokeLinecap="round" strokeWidth="4" />
        <path d={leadPath} fill="none" stroke="#0f9f8f" strokeLinecap="round" strokeWidth="3" />
        {reachPoints.map((point, index) => (
          <g key={data[index]?.name ?? index}>
            <circle cx={point.x} cy={point.y} r="4" fill="#0071e3" />
            <text x={point.x} y={height - 10} textAnchor="middle">
              {data[index]?.name}
            </text>
          </g>
        ))}
        <text x={padding.left} y="14" fill="#6e6e73">
          Alcance max. {formatCompactNumber(maxReach)}
        </text>
      </svg>
    </div>
  );
}

export function CampaignBars({
  data
}: {
  data: { name: string; leads: number; spend: number }[];
}) {
  const width = 720;
  const height = 260;
  const padding = { top: 24, right: 20, bottom: 40, left: 40 };
  const maxLeads = Math.max(1, ...data.map((item) => item.leads));
  const innerWidth = width - padding.left - padding.right;
  const barGap = 18;
  const barWidth = data.length
    ? Math.max(22, (innerWidth - barGap * (data.length - 1)) / data.length)
    : 0;

  return (
    <div className="simple-chart" aria-label="Leads por campana">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
          stroke="#e5e5ea"
        />
        {data.map((item, index) => {
          const availableHeight = height - padding.top - padding.bottom;
          const barHeight = (item.leads / maxLeads) * availableHeight;
          const x = padding.left + index * (barWidth + barGap);
          const y = height - padding.bottom - barHeight;

          return (
            <g key={item.name}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="10"
                fill={chartColors[index % chartColors.length]}
              />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle">
                {item.leads}
              </text>
              <text x={x + barWidth / 2} y={height - 14} textAnchor="middle">
                {shortLabel(item.name)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function pointFor(
  index: number,
  total: number,
  value: number,
  max: number,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
) {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const x = padding.left + (total <= 1 ? 0 : (innerWidth / (total - 1)) * index);
  const y = padding.top + innerHeight - (value / max) * innerHeight;

  return { x, y };
}

function toPath(points: { x: number; y: number }[]) {
  if (!points.length) {
    return "";
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function toAreaPath(points: { x: number; y: number }[], baseline: number) {
  if (!points.length) {
    return "";
  }

  return `${toPath(points)} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
}

function shortLabel(label: string) {
  return label.length > 12 ? `${label.slice(0, 11)}.` : label;
}
