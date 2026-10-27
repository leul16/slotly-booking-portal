import type { Metadata } from "next";
import { Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ServicesTable } from "@/components/admin/services-table";
import { ServiceFormDialog } from "@/components/admin/service-form";

export const metadata: Metadata = {
  title: "Services Management",
  description: "Create, edit, activate, and deactivate bookable services.",
};

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requireAdmin();

  // Fetch all services including booking counts for safe deletion logic
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  const activeCount = services.filter((s: { isActive: boolean }) => s.isActive).length;
  const inactiveCount = services.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-primary" />
            <span>Services Management</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure catalog services, duration, pricing, and active status for client bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-1">
            <span className="font-medium text-foreground">{activeCount} active</span>
            <span>&bull;</span>
            <span>{inactiveCount} inactive</span>
          </div>
          <ServiceFormDialog />
        </div>
      </div>

      {/* Services Table Component */}
      <ServicesTable
        services={services.map((s: (typeof services)[number]) => ({
          ...s,
          price: Number(s.price),
        }))}
      />
    </div>
  );
}
