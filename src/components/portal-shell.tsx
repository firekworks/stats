import { Bell, BookOpenCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FirekworksMark } from "@/components/firekworks-mark";
import { PortalNav, type PortalNavItem } from "@/components/portal-nav";
import type { Client } from "@/lib/types";

const clientLinks: PortalNavItem[] = [
  { href: "/client", label: "Inicio", icon: "home" },
  { href: "/client/results", label: "Resultados", icon: "results" },
  { href: "/client/campaigns", label: "Campañas", icon: "campaigns" },
  { href: "/client/content", label: "Contenido", icon: "content" },
  { href: "/client/reports", label: "Informes", icon: "reports" },
  { href: "/client/invoices", label: "Facturas", icon: "invoices" },
  { href: "/client/ranking", label: "Ranking", icon: "ranking" },
  { href: "/client/next-steps", label: "Próximos pasos", icon: "tasks" }
];

const adminLinks: PortalNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/clients", label: "Clientes", icon: "clients" },
  { href: "/admin/client-access", label: "Accesos", icon: "access" },
  { href: "/admin/campaigns", label: "Campañas", icon: "campaigns" },
  { href: "/admin/content", label: "Contenido", icon: "content" },
  { href: "/admin/metrics", label: "Métricas", icon: "results" },
  { href: "/admin/reports", label: "Informes", icon: "reports" },
  { href: "/admin/invoices", label: "Facturas", icon: "invoices" },
  { href: "/admin/leaderboards", label: "Leaderboards", icon: "ranking" },
  { href: "/admin/client-score", label: "Client Score", icon: "score" },
  { href: "/admin/integrations", label: "Integraciones", icon: "integrations" },
  { href: "/admin/settings", label: "Ajustes", icon: "settings" }
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
          <FirekworksMark />
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
          ) : null}
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
