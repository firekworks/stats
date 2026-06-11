import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatPercent, statusLabel } from "@/lib/format";

export function PageHeader({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="page-title">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {children ? <div className="toolbar">{children}</div> : null}
    </header>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  download
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  download?: boolean;
}) {
  const className =
    variant === "primary"
      ? "button"
      : variant === "secondary"
        ? "button button-secondary"
        : "button button-ghost";

  return (
    <Link href={href} className={className} download={download}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  id
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return <section className={`card ${className}`} id={id}>{children}</section>;
}

export function CardHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="card-header">
      <div>
        <span className="eyebrow">{description}</span>
        <h2 className="m-0 text-[1.18rem] font-[850]">{title}</h2>
      </div>
      {action}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  trend,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: string;
  helper?: string;
  trend?: number;
  icon: LucideIcon;
  tone?: "blue" | "green" | "orange" | "mint" | "gray";
}) {
  const toneClass = {
    blue: "bg-[rgba(0,113,227,0.1)] text-[#0071e3]",
    green: "bg-[rgba(47,158,68,0.1)] text-[#2f9e44]",
    orange: "bg-[rgba(249,115,22,0.12)] text-[#f97316]",
    mint: "bg-[rgba(15,159,143,0.1)] text-[#0f9f8f]",
    gray: "bg-[rgba(110,110,115,0.1)] text-[#6e6e73]"
  }[tone];

  return (
    <Card className="metric-card">
      <header>
        <span className="metric-label">{label}</span>
        <span className={`metric-icon ${toneClass}`}>
          <Icon size={21} />
        </span>
      </header>
      <strong className="metric-value">{value}</strong>
      <footer className="metric-foot">
        {typeof trend === "number" ? <TrendBadge value={trend} /> : null}
        {helper ? <span>{helper}</span> : null}
      </footer>
    </Card>
  );
}

export function TrendBadge({ value }: { value: number }) {
  const positive = value > 0;
  const negative = value < 0;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const className = positive
    ? "badge badge-green"
    : negative
      ? "badge badge-red"
      : "badge badge-gray";

  return (
    <span className={className}>
      <Icon size={14} />
      {formatPercent(Math.abs(value))}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" ||
    status === "paid" ||
    status === "generated" ||
    status === "connected"
      ? "badge-green"
      : status === "overdue" ||
          status === "cancelled" ||
          status === "revoked" ||
          status === "error"
        ? "badge-red"
        : status === "learning" ||
            status === "pending_approval" ||
            status === "sent"
          ? "badge-orange"
          : "badge-gray";

  return <span className={`badge ${tone}`}>{statusLabel(status)}</span>;
}

export function EmptySkeleton() {
  return (
    <div className="grid gap-3">
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-10 w-full" />
      <div className="skeleton h-5 w-1/2" />
    </div>
  );
}
