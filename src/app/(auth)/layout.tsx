import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account for the Slotly Booking Portal",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Background ambient gradient accents */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="h-[400px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="h-[300px] w-[400px] rounded-full bg-blue-500/5 blur-2xl" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Slotly Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-colors group-hover:bg-primary/90">
              <CalendarCheck2 className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-foreground leading-tight">
                Slotly
              </span>
              <span className="text-xs font-medium text-muted-foreground leading-tight">
                Booking Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Page Content Card Container */}
        <div>{children}</div>

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Secure, fast, and simple service scheduling &copy;{" "}
            {new Date().getFullYear()} Slotly.
          </p>
        </div>
      </div>
    </div>
  );
}
