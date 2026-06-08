"use client";

import {
  BarChart3,
  ClipboardList,
  CalendarDays,
  FileBarChart,
  FileText,
  Gauge,
  Home,
  KeyRound,
  Layers3,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Trophy,
  UsersRound,
  WandSparkles,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type PortalNavIcon =
  | "home"
  | "results"
  | "campaigns"
  | "content"
  | "reports"
  | "invoices"
  | "ranking"
  | "tasks"
  | "dashboard"
  | "clients"
  | "access"
  | "calendar"
  | "demos"
  | "score"
  | "integrations"
  | "settings";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: PortalNavIcon;
};

const icons: Record<PortalNavIcon, LucideIcon> = {
  home: Home,
  results: BarChart3,
  campaigns: Megaphone,
  content: Layers3,
  reports: FileBarChart,
  invoices: ReceiptText,
  ranking: Trophy,
  tasks: ClipboardList,
  dashboard: Gauge,
  clients: UsersRound,
  access: KeyRound,
  calendar: CalendarDays,
  demos: WandSparkles,
  score: ShieldCheck,
  integrations: WandSparkles,
  settings: Settings
};

export function PortalNav({ links }: { links: PortalNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Principal">
      {links.map((item) => {
        const Icon = icons[item.icon] || FileText;
        const active =
          pathname === item.href ||
          (item.href !== "/client" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
