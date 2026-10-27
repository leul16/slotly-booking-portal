import { NextResponse } from "next/server";
import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/email";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    // 1. Verify admin session
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing booking ID parameter." },
        { status: 400 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { status: targetStatus, reason } = body;

    if (!targetStatus || !Object.values(BookingStatus).includes(targetStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status provided. Must be one of: ${Object.values(
            BookingStatus
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 3. Find target booking with customer and service details
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        service: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const currentStatus = existingBooking.status;

    // 4. Validate allowed status transitions
    // Allowed transitions:
    // PENDING -> CONFIRMED or CANCELLED
    // CONFIRMED -> COMPLETED or CANCELLED
    // CANCELLED -> (none)
    // COMPLETED -> (none)
    let isTransitionAllowed = false;

    if (currentStatus === BookingStatus.PENDING) {
      isTransitionAllowed =
        targetStatus === BookingStatus.CONFIRMED ||
        targetStatus === BookingStatus.CANCELLED;
    } else if (currentStatus === BookingStatus.CONFIRMED) {
      isTransitionAllowed =
        targetStatus === BookingStatus.COMPLETED ||
        targetStatus === BookingStatus.CANCELLED;
    } else if (currentStatus === targetStatus) {
      return NextResponse.json({
        success: true,
        message: "Status unchanged.",
        booking: existingBooking,
      });
    }

    if (!isTransitionAllowed) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
        },
        { status: 400 }
      );
    }

    // 5. Perform update in database
    const updateData: Prisma.BookingUpdateInput = {
      status: targetStatus,
    };

    if (targetStatus === BookingStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = "admin";
      updateData.cancellationReason =
        typeof reason === "string" && reason.trim().length > 0
          ? reason.trim()
          : "Cancelled by administrator";
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
      },
    });

    // 6. Send appropriate email notification to customer
    try {
      if (targetStatus === BookingStatus.CONFIRMED) {
        await sendEmail({
          to: existingBooking.user.email,
          subject: `Your appointment for ${existingBooking.service.name} is confirmed!`,
          template: "booking-confirmed",
          data: {
            customerName: existingBooking.user.name,
            serviceName: existingBooking.service.name,
            scheduledAt: existingBooking.scheduledAt,
            durationMinutes: existingBooking.service.durationMinutes,
            bookingId: existingBooking.id,
            notes: existingBooking.notes,
          },
        });
      } else if (targetStatus === BookingStatus.CANCELLED) {
        await sendEmail({
          to: existingBooking.user.email,
          subject: `Booking Cancellation: ${existingBooking.service.name}`,
          template: "booking-cancelled",
          data: {
            customerName: existingBooking.user.name,
            serviceName: existingBooking.service.name,
            scheduledAt: existingBooking.scheduledAt,
            bookingId: existingBooking.id,
            cancellationReason:
              typeof reason === "string" && reason.trim().length > 0
                ? reason.trim()
                : "Cancelled by administrator",
          },
        });
      }
    } catch (emailError) {
      // Don't fail the database update if email delivery fails, but log it
      console.error(
        "[Admin Booking Status API] Error sending customer notification:",
        emailError
      );
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("[Admin Booking Status API] Error updating status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the booking status.",
      },
      { status: 500 }
    );
  }
}
