"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/habitos/logo";
import { AccountMenu } from "@/components/habitos/account-menu";

const NAV_ITEMS = [
  { href: "/habitos", label: "Hábitos", icon: ListChecksIcon },
  { href: "/semana", label: "Semana", icon: CalendarDaysIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
];

interface AppNavUser {
  name: string;
  email: string;
  image?: string | null;
}

interface AppNavProps {
  user: AppNavUser;
}

export function AppNav({ user }: AppNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 items-center justify-between gap-4">
      <Link href="/dashboard" className="flex items-center">
        <Logo />
      </Link>
      <nav className="hidden items-center gap-1 md:flex">
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
      <AccountMenu user={user} />
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-w-[4.5rem] flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground transition-colors",
              isActive && "text-primary"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
