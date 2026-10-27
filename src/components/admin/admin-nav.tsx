"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Briefcase,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CalendarCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

interface AdminNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
    exact: false,
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Briefcase,
    exact: false,
  },
];

export function AdminSidebar({ user }: AdminNavProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card shrink-0 select-none">
      {/* Sidebar Header / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-foreground">
                Slotly
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase font-mono">
                Admin
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">Management Console</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-2 mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Quick Links
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>Public Portal</span>
          </span>
        </Link>
        <Link
          href="/services"
          target="_blank"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>Customer Booking</span>
          </span>
        </Link>
      </div>

      {/* Admin User Profile & Sign Out Footer */}
      <div className="border-t border-border p-4 bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name || "Administrator"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground font-mono">
                {user?.email || "admin@slotly.local"}
              </p>
            </div>
          </div>
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-center gap-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}

export function AdminMobileNav({ user }: AdminNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/login";
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4">
      <Link href="/admin" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <CalendarCheck2 className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-base tracking-tight text-foreground">
            Slotly
          </span>
          <Badge variant="secondary" className="text-[10px] px-1 py-0 uppercase">
            Admin
          </Badge>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background p-6 shadow-xl animate-in slide-in-from-top-2">
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-base font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <div className="my-3 border-t border-border pt-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Public Portal</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-semibold text-foreground">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Badge variant="outline" className="text-xs">Administrator</Badge>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-3 gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
