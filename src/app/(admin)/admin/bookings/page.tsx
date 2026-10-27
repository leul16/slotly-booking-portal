import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  FileText,
} from "lucide-react";
import { Prisma, BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { BookingActions } from "@/components/admin/booking-actions";
import { BookingsFilter } from "@/components/admin/bookings-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  title: "Bookings Management",
  description: "View, filter, confirm, complete, and cancel customer appointments.",
};

export const dynamic = "force-dynamic";

interface AdminBookingsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminBookingsPage({
  searchParams,
}: AdminBookingsPageProps) {
  await requireAdmin();

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const statusParam = resolvedParams.status || "ALL";
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const pageSize = 10;

  // Build Prisma Where clause
  const where: Prisma.BookingWhereInput = {};

  if (statusParam && statusParam !== "ALL") {
    if (Object.values(BookingStatus).includes(statusParam as BookingStatus)) {
      where.status = statusParam as BookingStatus;
    }
  }

  if (search.trim()) {
    const query = search.trim();
    where.OR = [
      { user: { name: { contains: query, mode: "insensitive" } } },
      { user: { email: { contains: query, mode: "insensitive" } } },
      { service: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  // Execute count and paginated query
  const [totalCount, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
            currency: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusParam && statusParam !== "ALL") params.set("status", statusParam);
    params.set("page", pageNumber.toString());
    return `/admin/bookings?${params.toString()}`;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarCheck className="h-7 w-7 text-primary" />
            <span>Bookings Management</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, filter, confirm, complete, or cancel customer appointments with real-time updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
            {totalCount} Total Matching
          </span>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <BookingsFilter />
        </CardContent>
      </Card>

      {/* Bookings Table Card */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Bookings List
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Showing {startItem}&ndash;{endItem} of {totalCount}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-[24%] text-xs font-semibold">Customer</TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold">Service</TableHead>
                    <TableHead className="w-[22%] text-xs font-semibold">Appointment Time</TableHead>
                    <TableHead className="w-[12%] text-xs font-semibold">Price</TableHead>
                    <TableHead className="w-[10%] text-xs font-semibold">Status</TableHead>
                    <TableHead className="w-[12%] text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: (typeof bookings)[number]) => {
                    const price = Number(booking.service.price);
                    const formattedPrice = isNaN(price) ? "$0.00" : `$${price.toFixed(2)}`;

                    return (
                      <TableRow key={booking.id} className="border-border group">
                        {/* Customer */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                              {booking.user.name[0]?.toUpperCase() || <User className="h-4 w-4" />}
                            </div>
                            <div className="space-y-0.5 overflow-hidden">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {booking.user.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate font-mono">
                                {booking.user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Service */}
                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-foreground">
                              {booking.service.name}
                            </p>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{booking.service.durationMinutes} minutes</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell className="py-3.5">
                          <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground whitespace-nowrap">
                              {formatDateTime(booking.scheduledAt)}
                            </p>
                            {booking.notes && (
                              <p
                                className="text-[11px] text-muted-foreground line-clamp-1 italic flex items-center gap-1"
                                title={`Customer note: ${booking.notes}`}
                              >
                                <FileText className="h-3 w-3 shrink-0" />
                                <span>&ldquo;{booking.notes}&rdquo;</span>
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="py-3.5">
                          <span className="text-xs font-semibold text-foreground">
                            {formattedPrice}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3.5">
                          <BookingStatusBadge status={booking.status} className="text-xs" />
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 text-right">
                          <div className="flex items-center justify-end">
                            <BookingActions
                              bookingId={booking.id}
                              currentStatus={booking.status}
                              customerName={booking.user.name}
                              serviceName={booking.service.name}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <CalendarCheck className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                No bookings found
              </p>
              <p className="text-xs max-w-sm mx-auto">
                {search || statusParam !== "ALL"
                  ? "Try resetting your search query or changing your status filter."
                  : "Bookings created by customers will appear here."}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/10">
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-xs"
                  disabled={currentPage <= 1}
                  asChild={currentPage > 1}
                >
                  {currentPage > 1 ? (
                    <Link href={createPageUrl(currentPage - 1)}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </Link>
                  ) : (
                    <>
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-xs"
                  disabled={currentPage >= totalPages}
                  asChild={currentPage < totalPages}
                >
                  {currentPage < totalPages ? (
                    <Link href={createPageUrl(currentPage + 1)}>
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
