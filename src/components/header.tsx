"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  Menu,
  LogOut,
  LayoutDashboard,
  Shield,
  Calendar,
} from "lucide-react";

import { useSession, signOut } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const user = session?.user as
    | {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
      }
    | undefined;

  const isAdmin = user?.role === "admin";

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch {
      router.push("/");
      router.refresh();
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    ...(session ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">
                Slotly
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : session && user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  )}
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  Admin Panel
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-offset-background transition hover:ring-2 hover:ring-ring"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? "User"}
                      />
                      <AvatarFallback className="text-xs font-semibold">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name ?? "My Account"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/bookings" className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer text-amber-600 dark:text-amber-400">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Portal
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu (Sheet) */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <SheetHeader className="text-left">
                  <SheetTitle>
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <CalendarCheck className="h-4 w-4" />
                      </div>
                      <span className="text-lg font-bold">Slotly</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {/* User summary card in mobile if logged in */}
                {session && user && (
                  <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/40">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? "User"}
                      />
                      <AvatarFallback className="text-xs font-semibold">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {user.name ?? "Account"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Auth action buttons in mobile drawer */}
              <div className="pt-4 border-t flex flex-col gap-2">
                {isPending ? (
                  <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                ) : session && user ? (
                  <Button
                    variant="destructive"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button
                      className="w-full"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
