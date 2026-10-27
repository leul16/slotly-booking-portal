import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { CANCELLATION_DEADLINE_HOURS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to manage your bookings." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required." },
        { status: 400 }
      );
    }

    // 2. Fetch booking with related service and user
    const booking = await prisma.booking.findUnique({
      where: { id },
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

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    // 3. Verify user ownership or admin privilege
    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to cancel this booking." },
        { status: 403 }
      );
    }

    // 4. Check current status
    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json(
        {
          error: `Cannot cancel a booking that is already marked as ${booking.status}.`,
        },
        { status: 400 }
      );
    }

    // 5. Check cancellation deadline (24 hours before scheduled time for non-admins)
    const now = new Date();
    const scheduledTime = new Date(booking.scheduledAt);
    const msDifference = scheduledTime.getTime() - now.getTime();
    const hoursDifference = msDifference / (1000 * 60 * 60);

    if (hoursDifference < CANCELLATION_DEADLINE_HOURS && !isAdmin) {
      return NextResponse.json(
        {
          error: `Bookings can only be cancelled at least ${CANCELLATION_DEADLINE_HOURS} hours before the scheduled appointment time.`,
        },
        { status: 400 }
      );
    }

    // 6. Optional cancellation reason from request body
    let cancellationReason = "Cancelled by customer";
    try {
      const body = await request.json();
      if (body?.reason && typeof body.reason === "string" && body.reason.trim()) {
        cancellationReason = body.reason.trim().slice(0, 500);
      }
    } catch {
      // Body is optional
    }

    // 7. Update status to CANCELLED
    const cancelledBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancelledBy: isAdmin ? "admin" : "customer",
        cancellationReason,
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

    // 8. Send cancellation notification email asynchronously
    sendEmail({
      to: booking.user.email,
      subject: `Booking Cancelled: ${booking.service.name}`,
      template: "booking-cancelled",
      data: {
        customerName: booking.user.name,
        serviceName: booking.service.name,
        scheduledAt: booking.scheduledAt,
        bookingId: booking.id,
        cancellationReason,
      },
    }).catch((emailError) => {
      console.error(
        "[Slotly API] Failed to send cancellation email:",
        emailError
      );
    });

    return NextResponse.json(cancelledBooking);
  } catch (error) {
    console.error("[Slotly Booking Cancel API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error while cancelling booking." },
      { status: 500 }
    );
  }
}
