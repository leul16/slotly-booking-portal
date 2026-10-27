import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { BookingStatus } from "@prisma/client";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { BookingActions } from "@/components/admin/booking-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of bookings, upcoming appointments, and revenue statistics.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Calculate start & end of today
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Parallel database queries for dashboard metrics
  const [
    totalBookingsCount,
    pendingBookingsCount,
    confirmedBookingsCount,
    completedBookings,
    todayAppointments,
    recentBookings,
  ] = await Promise.all([
    // 1. Total bookings count
    prisma.booking.count(),

    // 2. Pending bookings count
    prisma.booking.count({
      where: { status: BookingStatus.PENDING },
    }),

    // 3. Confirmed bookings count
    prisma.booking.count({
      where: { status: BookingStatus.CONFIRMED },
    }),

    // 4. Completed bookings to sum revenue
    prisma.booking.findMany({
      where: { status: BookingStatus.COMPLETED },
      select: {
        service: {
          select: { price: true },
        },
      },
    }),

    // 5. Today's appointments (PENDING or CONFIRMED scheduled for today)
    prisma.booking.findMany({
      where: {
        scheduledAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
      },
    }),

    // 6. Recent bookings table (last 10)
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, name: true, durationMinutes: true, price: true } },
      },
    }),
  ]);

  // Calculate total revenue from completed bookings
  const totalRevenue = completedBookings.reduce(
    (sum: number, booking: { service: { price: unknown } }) =>
      sum + Number(booking.service.price || 0),
    0
  );

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatTimeOnly = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{session.user.name}</span>. Here is an overview of appointments and revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/bookings">Manage All Bookings</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/services">View Services</Link>
          </Button>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Bookings */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {totalBookingsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All bookings across all statuses
            </p>
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Bookings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {pendingBookingsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        {/* Confirmed Bookings */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed Bookings
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {confirmedBookingsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled and confirmed
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Revenue
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formattedRevenue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Today's Appointments & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Today's Appointments Column */}
        <Card className="lg:col-span-1 border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Today&apos;s Appointments</span>
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {todayAppointments.length}
              </span>
            </div>
            <CardDescription className="text-xs">
              {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(now)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appt: (typeof todayAppointments)[number]) => (
                <div
                  key={appt.id}
                  className="rounded-lg border border-border/70 p-3 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-foreground">
                        {appt.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.service.name} ({appt.service.durationMinutes} min)
                      </p>
                    </div>
                    <BookingStatusBadge status={appt.status} className="text-[11px]" />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1 font-mono text-primary font-medium">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTimeOnly(appt.scheduledAt)} - {formatTimeOnly(appt.endTime)}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">
                      ${Number(appt.service.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 p-6 text-center text-muted-foreground space-y-1">
                <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium text-foreground">No appointments scheduled today</p>
                <p className="text-[11px]">Upcoming appointments for future dates will appear in the bookings list.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings Table (2 Columns) */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Recent Bookings
              </CardTitle>
              <CardDescription className="text-xs">
                Latest 10 bookings submitted by customers
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
              <Link href="/admin/bookings">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs">Customer</TableHead>
                      <TableHead className="text-xs">Service</TableHead>
                      <TableHead className="text-xs">Appointment</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((b: (typeof recentBookings)[number]) => (
                      <TableRow key={b.id} className="border-border">
                        {/* Customer */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                              {b.user.name[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                            </div>
                            <div className="space-y-0.5 overflow-hidden">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {b.user.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {b.user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Service */}
                        <TableCell className="py-3">
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">
                              {b.service.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              ${Number(b.service.price).toFixed(2)} &bull; {b.service.durationMinutes}m
                            </p>
                          </div>
                        </TableCell>

                        {/* Appointment Time */}
                        <TableCell className="py-3">
                          <span className="text-xs font-medium text-foreground whitespace-nowrap">
                            {formatDateTime(b.scheduledAt)}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3">
                          <BookingStatusBadge status={b.status} className="text-xs" />
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 text-right">
                          <BookingActions
                            bookingId={b.id}
                            currentStatus={b.status}
                            customerName={b.user.name}
                            serviceName={b.service.name}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm font-medium">No bookings recorded yet</p>
                <p className="text-xs mt-1">Bookings made by customers will show up here automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
