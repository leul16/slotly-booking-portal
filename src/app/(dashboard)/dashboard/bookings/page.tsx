import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  Plus,
  FileText,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelBookingDialog } from "@/components/cancel-booking-dialog";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatCurrency,
} from "@/lib/utils";
import { CANCELLATION_DEADLINE_HOURS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage all your scheduled appointments and past bookings.",
};

export const dynamic = "force-dynamic";

export default async function CustomerBookingsPage() {
  const session = await requireSession("/login");
  const now = new Date();

  // Fetch all bookings for the authenticated user, latest first
  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      service: true,
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });

  // Categorize bookings
  const upcomingBookings = bookings.filter((b) => {
    const isFuture = new Date(b.scheduledAt).getTime() >= now.getTime();
    return (
      isFuture &&
      (b.status === "PENDING" || b.status === "CONFIRMED")
    );
  });

  const pastBookings = bookings.filter((b) => {
    const isPast = new Date(b.scheduledAt).getTime() < now.getTime();
    return (
      isPast ||
      b.status === "COMPLETED" ||
      b.status === "CANCELLED"
    );
  });

  function renderBookingCard(booking: (typeof bookings)[number]) {
    const scheduledTime = new Date(booking.scheduledAt);
    const msRemaining = scheduledTime.getTime() - now.getTime();
    const isMoreThan24HoursAway =
      msRemaining > CANCELLATION_DEADLINE_HOURS * 60 * 60 * 1000;
    const canCancel =
      (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
      isMoreThan24HoursAway;

    return (
      <Card
        key={booking.id}
        className="shadow-sm border-border/70 hover:border-primary/40 transition-colors flex flex-col justify-between"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                {booking.service.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ref: {booking.id.slice(0, 8)}
              </p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-foreground">
                {formatDate(booking.scheduledAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>
                {formatTime(booking.scheduledAt)} ({formatDuration(booking.service.durationMinutes)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <span>
                {formatCurrency(booking.service.price, booking.service.currency)}
              </span>
            </div>
          </div>

          {booking.notes && (
            <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              <span className="line-clamp-2 italic">&ldquo;{booking.notes}&rdquo;</span>
            </div>
          )}

          {booking.status === "CANCELLED" && booking.cancellationReason && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                Cancellation note: {booking.cancellationReason}
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href={`/dashboard/bookings/${booking.id}`}>
              <span>View Details</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>

          {canCancel && (
            <CancelBookingDialog
              bookingId={booking.id}
              serviceName={booking.service.name}
              scheduledAt={booking.scheduledAt}
            />
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review your upcoming appointments, booking history, and status updates.
          </p>
        </div>
        <Button asChild className="gap-2 shadow-sm">
          <Link href="/services">
            <Plus className="h-4 w-4" />
            <span>Book New Appointment</span>
          </Link>
        </Button>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Bookings */}
        <TabsContent value="all" className="space-y-4">
          {bookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings recorded"
              description="You haven't made any appointments yet. Choose from our services to book your first slot."
              action={{
                label: "Browse Services",
                href: "/services",
              }}
              className="py-12"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Upcoming Bookings */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming bookings"
              description="You have no appointments currently scheduled in the future."
              action={{
                label: "Schedule Appointment",
                href: "/services",
              }}
              className="py-12"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Past Bookings */}
        <TabsContent value="past" className="space-y-4">
          {pastBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No past appointments"
              description="Completed and past bookings will appear here."
              className="py-12"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastBookings.map(renderBookingCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
