import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  CalendarClock,
  Sparkles,
  Search,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  let featuredServices: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    durationMinutes: number;
    price: unknown;
    currency: string;
  }> = [];

  try {
    featuredServices = await prisma.service.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error loading featured services:", error);
    // Graceful fallback to empty array so the page renders reliably
  }

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-accent/20 to-background py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Modern Appointment Scheduling</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Book Services{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary/80 bg-clip-text text-transparent">
              Effortlessly
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            Discover premier professional services, check real-time availability,
            and secure your spot in seconds. Slotly eliminates the back-and-forth
            with seamless digital bookings.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2 shadow-md shadow-primary/20 text-base h-12 px-7" asChild>
              <Link href="/services">
                <span>Browse Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base h-12 px-7" asChild>
              <Link href="/#how-it-works">
                <span>See How It Works</span>
              </Link>
            </Button>
          </div>

          {/* Quick value badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Automated Calendar Invites</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-background border-t border-border/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3 uppercase tracking-wider text-xs">
              Simple 3-Step Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Slotly Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Booking your next appointment has never been simpler. No phone calls,
              no waitlists, just frictionless scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
                <Search className="h-7 w-7" />
              </div>
              <div className="mb-2 inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                Step 1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                1. Browse Services
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore our curated catalog of professional services with complete
                details, clear duration estimates, and upfront pricing.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="mb-2 inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                Step 2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                2. Pick Your Time
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select an open time slot that seamlessly aligns with your calendar.
                Live availability ensures slots are never double-booked.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="mb-2 inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                Step 3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                3. You&apos;re All Set
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive instant confirmation, automated calendar reminders, and
                email notifications so you never miss an appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Services Section */}
      <section className="py-20 md:py-28 bg-muted/30 border-t border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="secondary" className="mb-3 uppercase tracking-wider text-xs">
                Featured Offerings
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Popular Services
              </h2>
              <p className="mt-2 text-base text-muted-foreground max-w-xl">
                Hand-picked professional appointments ready for instant online booking.
              </p>
            </div>
            <Button variant="outline" className="self-start md:self-auto gap-2" asChild>
              <Link href="/services">
                <span>View All Services</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => {
                const numericPrice = Number(service.price);
                const formattedPrice = isNaN(numericPrice)
                  ? "$0.00"
                  : `$${numericPrice.toFixed(2)}`;

                return (
                  <Card
                    key={service.id}
                    className="flex flex-col justify-between border-border/80 hover:border-primary/50 transition-all hover:shadow-lg bg-card"
                  >
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="gap-1 font-normal text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary" />
                          <span>{service.durationMinutes} mins</span>
                        </Badge>
                        <span className="text-lg font-bold text-primary">
                          {formattedPrice}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-4 border-t border-border/60">
                      <Button className="w-full gap-1.5 shadow-sm" asChild>
                        <Link href={`/services/${service.slug}`}>
                          <span>Book Now</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No Services Listed Yet
              </h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground mb-6">
                Our service catalog is being prepared. Check back shortly or contact our team to inquire about appointments.
              </p>
              <Button variant="outline" asChild>
                <Link href="/services">Browse All Offerings</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Trust Section: Why Choose Slotly */}
      <section id="why-us" className="py-20 md:py-28 bg-background border-t border-border/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3 uppercase tracking-wider text-xs">
              The Slotly Advantage
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Slotly
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Engineered for seamless client experiences and reliable service management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="border-border/70 hover:border-primary/40 transition-colors shadow-sm bg-card">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Easy Booking
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Find and reserve appointments in less than 2 minutes on any device with zero friction.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/70 hover:border-primary/40 transition-colors shadow-sm bg-card">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Instant Confirmation
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  No back-and-forth emails or phone calls. Immediate confirmation and calendar synchronization.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/70 hover:border-primary/40 transition-colors shadow-sm bg-card">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Flexible Scheduling
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Life happens. Easily reschedule or manage your bookings in accordance with provider policies.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/70 hover:border-primary/40 transition-colors shadow-sm bg-card">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Secure & Private
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  Enterprise-grade data encryption and strict privacy practices safeguard your booking details.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. CTA Section at Bottom */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-primary to-indigo-700 text-primary-foreground">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Ready to book your next session?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-primary-foreground/90 leading-relaxed">
            Choose from our range of professional offerings and reserve your desired
            time slot in just a few clicks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-primary font-semibold shadow-lg text-base h-12 px-8 hover:bg-background"
              asChild
            >
              <Link href="/services">
                <span>Browse All Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
