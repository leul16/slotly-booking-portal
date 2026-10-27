import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  ShieldAlert,
  Info,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CancelBookingDialog } from "@/components/cancel-booking-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  formatCurrency,
} from "@/lib/utils";
import { CANCELLATION_DEADLINE_HOURS, TIMEZONE } from "@/lib/constants";

interface BookingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: BookingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Booking #${id.slice(0, 8)}`,
    description: "Detailed information about your scheduled appointment.",
  };
}

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const session = await requireSession("/login");

  // Fetch booking ensuring ownership by the authenticated user
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      service: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // If not found or belongs to another user, return 404
  if (!booking) {
    notFound();
  }

  const now = new Date();
  const scheduledTime = new Date(booking.scheduledAt);
  const msRemaining = scheduledTime.getTime() - now.getTime();
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  const canCancel =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    hoursRemaining >= CANCELLATION_DEADLINE_HOURS;

  const withinDeadlineWindow =
    (booking.status === "PENDING" || booking.status === "CONFIRMED") &&
    hoursRemaining > 0 &&
    hoursRemaining < CANCELLATION_DEADLINE_HOURS;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to My Bookings</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {booking.service.name}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Booking ID: {booking.id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && (
            <CancelBookingDialog
              bookingId={booking.id}
              serviceName={booking.service.name}
              scheduledAt={booking.scheduledAt}
            />
          )}
        </div>
      </div>

      {/* Deadline Notice Banner if close to appointment */}
      {withinDeadlineWindow && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Cancellation window closed</p>
            <p className="mt-0.5 opacity-90">
              Appointments cannot be cancelled within {CANCELLATION_DEADLINE_HOURS} hours of the scheduled time. If you need urgent assistance, please contact customer support.
            </p>
          </div>
        </div>
      )}

      {/* Cancelled Notice Banner if cancelled */}
      {booking.status === "CANCELLED" && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">This booking has been cancelled</p>
            {booking.cancelledAt && (
              <p className="text-xs opacity-90">
                Cancelled on {formatDateTime(booking.cancelledAt)} by{" "}
                <span className="capitalize font-medium">{booking.cancelledBy || "customer"}</span>.
              </p>
            )}
            {booking.cancellationReason && (
              <p className="text-xs font-medium mt-1">
                Reason: &ldquo;{booking.cancellationReason}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Appointment Schedule */}
        <Card className="shadow-sm border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Appointment Schedule</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Time and date information for your session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Date</span>
              <span className="font-semibold text-foreground">
                {formatDate(booking.scheduledAt)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Time</span>
              <span className="font-semibold text-foreground">
                {formatTime(booking.scheduledAt)} – {formatTime(booking.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Duration</span>
              <span className="font-semibold text-foreground">
                {formatDuration(booking.service.durationMinutes)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Status</span>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="flex items-start gap-2 pt-2 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
              <span>Times are configured in {TIMEZONE}. Please arrive 5 minutes early.</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Service Details */}
        <Card className="shadow-sm border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span>Service Summary</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Selected service details and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Service Name</span>
              <span className="font-semibold text-foreground">
                {booking.service.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground text-xs">Total Price</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(booking.service.price, booking.service.currency)}
              </span>
            </div>
            <div className="py-2">
              <span className="text-muted-foreground text-xs block mb-1">
                Description
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                {booking.service.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Notes & Instructions */}
        <Card className="shadow-sm border-border/70 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Special Notes & Booking Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-medium block mb-1">
                Customer Notes
              </span>
              {booking.notes ? (
                <div className="rounded-lg bg-muted/40 p-3 text-xs sm:text-sm text-foreground italic border border-border/40">
                  &ldquo;{booking.notes}&rdquo;
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No special notes or instructions were provided for this appointment.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground block">Client</span>
                <span className="font-medium text-foreground">{booking.user.name}</span>
                <span className="block text-[11px] text-muted-foreground font-mono">
                  {booking.user.email}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Booked On</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(booking.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Last Updated</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(booking.updatedAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
