"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/habitos/logout-button";

const NAV_ITEMS = [
  { href: "/habitos", label: "Hábitos", icon: ListChecksIcon },
  { href: "/semana", label: "Semana", icon: CalendarDaysIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 items-center justify-between">
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive && "bg-muted text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <LogoutButton />
    </div>
  );
}
