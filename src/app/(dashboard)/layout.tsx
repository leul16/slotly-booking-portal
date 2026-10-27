import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import {
  DashboardSidebar,
  DashboardMobileNav,
} from "@/components/dashboard/dashboard-nav";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | Slotly",
    default: "Customer Dashboard | Slotly",
  },
  description: "Manage your appointments, bookings, and profile on Slotly.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforces server-side authentication, redirects to /login if unauthenticated
  const session = await requireSession("/login");

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar Navigation */}
      <DashboardSidebar user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Navigation */}
        <DashboardMobileNav user={session.user} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
