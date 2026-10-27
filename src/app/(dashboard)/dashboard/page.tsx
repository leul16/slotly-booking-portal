import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  Plus,
  Eye,
  Calendar,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "Customer dashboard overview of appointments and bookings.",
};

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await requireSession("/login");
  const userId = session.user.id;
  const now = new Date();

  // Parallel database queries for customer metrics & recent bookings
  const [
    totalCount,
    upcomingCount,
    completedCount,
    pendingCount,
    recentBookings,
  ] = await Promise.all([
    // Total bookings for this user
    prisma.booking.count({
      where: { userId },
    }),

    // Upcoming bookings (confirmed or pending, scheduled in the future)
    prisma.booking.count({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        scheduledAt: { gte: now },
      },
    }),

    // Completed bookings
    prisma.booking.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),

    // Pending bookings awaiting confirmation
    prisma.booking.count({
      where: {
        userId,
        status: "PENDING",
      },
    }),

    // Last 5 recent bookings
    prisma.booking.findMany({
      where: { userId },
      take: 5,
      orderBy: { scheduledAt: "desc" },
      include: {
        service: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {session.user.name || "Customer"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here is a summary of your scheduled appointments and active bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="gap-2 shadow-sm">
            <Link href="/services">
              <Plus className="h-4 w-4" />
              <span>Book Appointment</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time appointments
            </p>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {upcomingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled appointments ahead
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Hourglass className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {completedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully finished sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recent Bookings
            </h2>
            <p className="text-xs text-muted-foreground">
              Your latest scheduled appointments and service bookings
            </p>
          </div>
          {totalCount > 0 && (
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
              <Link href="/dashboard/bookings">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {totalCount === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="You don't have any appointments scheduled yet. Explore our available professional services and pick a slot that fits your schedule."
            action={{
              label: "Browse Services",
              href: "/services",
            }}
            className="py-12"
          />
        ) : (
          <Card className="shadow-sm overflow-hidden border-border/70">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {booking.service.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(booking.scheduledAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDuration(booking.service.durationMinutes)}
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 gap-1 text-xs hover:text-primary"
                        >
                          <Link href={`/dashboard/bookings/${booking.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
