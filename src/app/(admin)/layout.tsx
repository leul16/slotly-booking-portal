import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-nav";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | Slotly Admin",
    default: "Admin Console | Slotly",
  },
  description: "Administrative dashboard for Slotly booking management portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforces server-side authentication and role check (role === "admin")
  // Automatically redirects non-admins to /dashboard and unauthenticated to /login
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar Navigation */}
      <AdminSidebar user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Navigation */}
        <AdminMobileNav user={session.user} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Provider for Admin Actions */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
