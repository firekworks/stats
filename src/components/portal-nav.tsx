"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function PortalNav({ links }: { links: PortalNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Principal">
      {links.map((item) => {
        const Icon = item.icon;
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
