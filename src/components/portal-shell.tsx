import {
  BarChart3,
  Bell,
  BookOpenCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  Gauge,
  Home,
  Layers3,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Trophy,
  UsersRound,
  WandSparkles
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal-nav";
import type { Client } from "@/lib/types";

const clientLinks = [
  { href: "/client", label: "Inicio", icon: Home },
  { href: "/client/results", label: "Resultados", icon: BarChart3 },
  { href: "/client/campaigns", label: "Campañas", icon: Megaphone },
  { href: "/client/content", label: "Contenido", icon: Layers3 },
  { href: "/client/reports", label: "Informes", icon: FileBarChart },
  { href: "/client/invoices", label: "Facturas", icon: ReceiptText },
  { href: "/client/ranking", label: "Ranking", icon: Trophy },
  { href: "/client/next-steps", label: "Próximos pasos", icon: ClipboardList }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/clients", label: "Clientes", icon: UsersRound },
  { href: "/admin/campaigns", label: "Campañas", icon: Megaphone },
  { href: "/admin/content", label: "Contenido", icon: Layers3 },
  { href: "/admin/metrics", label: "Métricas", icon: BarChart3 },
  { href: "/admin/reports", label: "Informes", icon: FileText },
  { href: "/admin/invoices", label: "Facturas", icon: ReceiptText },
  { href: "/admin/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/admin/score", label: "Client Score", icon: ShieldCheck },
  { href: "/admin/integrations", label: "Integraciones", icon: WandSparkles },
  { href: "/admin/settings", label: "Ajustes", icon: Settings }
];

export function PortalShell({
  mode,
  client,
  children
}: {
  mode: "client" | "admin";
  client: Client;
  children: ReactNode;
}) {
  const links = mode === "client" ? clientLinks : adminLinks;

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href={mode === "client" ? "/client" : "/admin"} className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-copy">
            <strong>Stats</strong>
            <span>Firekworks</span>
          </span>
        </Link>

        <PortalNav links={links} />

        <div className="sidebar-panel">
          <span>{mode === "client" ? "Portal cliente" : "Vista interna"}</span>
          <strong>{mode === "client" ? client.publicName : "Firekworks"}</strong>
          <div className="mt-3 flex items-center gap-2 text-sm text-[#6e6e73]">
            <Bell size={16} />
            {mode === "client" ? "Plan activo" : "Alertas al dia"}
          </div>
          {mode === "admin" ? (
            <Link
              href="/client"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0071e3]"
            >
              <BookOpenCheck size={16} />
              Ver portal cliente
            </Link>
          ) : (
            <Link
              href="/admin"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0071e3]"
            >
              <ShieldCheck size={16} />
              Vista admin demo
            </Link>
          )}
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
