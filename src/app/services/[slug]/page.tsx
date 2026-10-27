import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface ServiceDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { name: true, description: true },
    });

    if (!service) {
      return {
        title: "Service Not Found",
      };
    }

    return {
      title: service.name,
      description: service.description.slice(0, 160),
    };
  } catch {
    return {
      title: "Service Details",
    };
  }
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;

  let service: {
    id: string;
    name: string;
    slug: string;
    description: string;
    durationMinutes: number;
    price: unknown;
    currency: string;
    isActive: boolean;
  } | null = null;

  try {
    service = await prisma.service.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error("Error fetching service details:", error);
  }

  if (!service || !service.isActive) {
    notFound();
  }

  const numericPrice = Number(service.price);
  const formattedPrice = isNaN(numericPrice)
    ? "$0.00"
    : `$${numericPrice.toFixed(2)}`;

  return (
    <div className="bg-background py-10 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link & Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>All Services</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
            {service.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
          {/* Main Content Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-xs">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{service.durationMinutes} Minutes Duration</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {service.currency} Currency
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {service.name}
              </h1>
            </div>

            {/* Description Section */}
            <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground">
                About this Service
              </h2>
              <div className="prose prose-neutral max-w-none text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                {service.description}
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-foreground">
                What to Expect
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span>Dedicated {service.durationMinutes} minutes 1-on-1 focus</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span>Automated calendar invitations (.ics & Google Calendar)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span>Automated 24-hour appointment reminder email</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span>Direct contact channel with your service provider</span>
                </li>
              </ul>
            </div>

            {/* Cancellation & Rescheduling Policy */}
            <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-6">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <AlertCircle className="h-4 w-4 text-primary" />
                <h3>Booking & Cancellation Policy</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can easily reschedule or cancel your appointment up to 24 hours prior to the scheduled start time. Cancellations made within 24 hours may be subject to provider discretion.
              </p>
            </div>
          </div>

          {/* Booking Sidebar Card (1 col) */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="border-border shadow-lg bg-card">
              <CardHeader className="space-y-3 pb-6">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                  Service Investment
                </CardDescription>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {formattedPrice}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    / {service.durationMinutes} mins
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pb-6">
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Duration
                    </span>
                    <span className="font-semibold text-foreground">
                      {service.durationMinutes} min session
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                    <span className="flex items-center gap-1.5">
                      <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                      Availability
                    </span>
                    <span className="font-semibold text-emerald-600">
                      Live Open Slots
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      Confirmation
                    </span>
                    <span className="font-semibold text-foreground">
                      Instant Guarantee
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button size="lg" className="w-full gap-2 text-base font-semibold shadow-md shadow-primary/20" asChild>
                  <Link href={`/book/${service.id}`}>
                    <span>Book This Service</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  No payment required to view available time slots.
                </p>
              </CardFooter>
            </Card>

            {/* Support Callout */}
            <div className="mt-6 rounded-xl border border-border/60 p-4 text-xs text-muted-foreground flex items-center gap-3 bg-muted/20">
              <HelpCircle className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Have questions before booking?</p>
                <p>Reach out to our team at support@slotly.com.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
