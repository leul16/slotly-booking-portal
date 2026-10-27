import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking-form";

interface BookServicePageProps {
  params: Promise<{
    serviceId: string;
  }>;
}

export async function generateMetadata({
  params,
}: BookServicePageProps): Promise<Metadata> {
  const { serviceId } = await params;

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { name: true, description: true },
    });

    if (!service) {
      return {
        title: "Service Not Found",
      };
    }

    return {
      title: `Book ${service.name}`,
      description: `Schedule your appointment for ${service.name} online with Slotly.`,
    };
  } catch {
    return {
      title: "Book Service",
    };
  }
}

export const dynamic = "force-dynamic";

export default async function BookServicePage({
  params,
}: BookServicePageProps) {
  const { serviceId } = await params;

  // 1. Fetch service details from Prisma
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  // 2. Return notFound if service does not exist or is inactive
  if (!service || !service.isActive) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/services/${service.slug}`}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to {service.name}</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Book Appointment</span>
        </div>

        {/* Header */}
        <div className="mb-8 pb-4 border-b border-border/60">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Schedule Appointment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick your preferred date, select an open time slot, and confirm your session.
          </p>
        </div>

        {/* Interactive Booking Form Client Component */}
        <BookingForm
          service={{
            id: service.id,
            name: service.name,
            durationMinutes: service.durationMinutes,
            price: Number(service.price),
            currency: service.currency,
            description: service.description,
          }}
        />
      </div>
    </div>
  );
}
