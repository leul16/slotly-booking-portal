import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore our complete range of professional services and schedule your appointment with real-time availability.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  let services: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    durationMinutes: number;
    price: unknown;
    currency: string;
  }> = [];

  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to load services:", error);
  }

  return (
    <div className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">
            Catalog & Booking
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Our Services
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Choose from our specialized professional offerings below. Each service
            comes with transparent upfront pricing, dedicated 1-on-1 attention, and
            instant online scheduling.
          </p>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => {
              const numericPrice = Number(service.price);
              const formattedPrice = isNaN(numericPrice)
                ? "$0.00"
                : `$${numericPrice.toFixed(2)}`;

              return (
                <Card
                  key={service.id}
                  className="flex flex-col justify-between border-border/80 hover:border-primary/50 transition-all duration-200 hover:shadow-lg bg-card group"
                >
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="gap-1 font-medium text-xs text-muted-foreground bg-muted/40">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>{service.durationMinutes} minutes</span>
                      </Badge>
                      <span className="text-xl font-bold text-primary">
                        {formattedPrice}
                      </span>
                    </div>

                    <CardTitle className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </CardTitle>

                    <CardDescription className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>Instant Confirmation</span>
                      </div>
                      <p>Full refund on cancellations made at least 24h prior.</p>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-border/60">
                    <Button className="w-full gap-2 shadow-sm font-medium" asChild>
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
          <div className="rounded-2xl border border-dashed border-border p-12 md:p-16 text-center bg-card max-w-2xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 ring-8 ring-primary/5">
              <Calendar className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              No Services Currently Available
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              We are actively setting up our booking calendar and offerings. Please check back shortly or return to our homepage.
            </p>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
