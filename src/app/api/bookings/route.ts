import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/lib/validations/booking";
import { sendEmail } from "@/lib/email";
import {
  parseDateParts,
  getBusinessHoursForDay,
} from "@/lib/availability";
import { TIMEZONE } from "@/lib/constants";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to make a booking." },
        { status: 401 }
      );
    }

    // 2. Parse & validate request body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.flatten();
      return NextResponse.json(
        {
          error: "Validation failed",
          details: issues.fieldErrors,
        },
        { status: 400 }
      );
    }

    const { serviceId, scheduledAt, notes } = validationResult.data;

    // 3. Ensure scheduledAt is in the future
    const now = new Date();
    if (scheduledAt.getTime() <= now.getTime()) {
      return NextResponse.json(
        { error: "Appointment time must be in the future." },
        { status: 400 }
      );
    }

    // 4. Validate service existence and active status
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "The selected service does not exist or is currently inactive." },
        { status: 404 }
      );
    }

    // 5. Calculate endTime based on service duration
    const endTime = new Date(
      scheduledAt.getTime() + service.durationMinutes * 60 * 1000
    );

    // 6. Validate business hours
    const { dayOfWeek } = parseDateParts(scheduledAt, TIMEZONE);
    const businessHours = await getBusinessHoursForDay(dayOfWeek);

    if (businessHours.isClosed) {
      return NextResponse.json(
        { error: "Appointments cannot be scheduled on closed days." },
        { status: 400 }
      );
    }

    const [openH, openM] = businessHours.openTime.split(":").map(Number);
    const [closeH, closeM] = businessHours.closeTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Local hour and minute in business timezone
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(scheduledAt);

    let slotHour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    if (slotHour === 24) slotHour = 0;
    const slotMinute = parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0",
      10
    );

    const slotStartMinutes = slotHour * 60 + slotMinute;
    const slotEndMinutes = slotStartMinutes + service.durationMinutes;

    if (slotStartMinutes < openMinutes || slotEndMinutes > closeMinutes) {
      return NextResponse.json(
        {
          error: `Selected time is outside operating business hours (${businessHours.openTime} - ${businessHours.closeTime}).`,
        },
        { status: 400 }
      );
    }

    // 7. Check for conflicting bookings & create in Prisma transaction
    let newBooking;
    try {
      newBooking = await prisma.$transaction(async (tx) => {
        // Query overlapping active bookings for the same service
        const overlapping = await tx.booking.findFirst({
          where: {
            serviceId: service.id,
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
            scheduledAt: {
              lt: endTime,
            },
            endTime: {
              gt: scheduledAt,
            },
          },
        });

        if (overlapping) {
          throw new Error("CONFLICT_SLOT");
        }

        return await tx.booking.create({
          data: {
            userId: session.user.id,
            serviceId: service.id,
            scheduledAt,
            endTime,
            status: "PENDING",
            notes: notes || null,
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
      });
    } catch (txError: unknown) {
      if (
        txError instanceof Error &&
        txError.message === "CONFLICT_SLOT"
      ) {
        return NextResponse.json(
          {
            error:
              "This time slot has already been booked. Please select another convenient time.",
          },
          { status: 409 }
        );
      }

      // Check unique constraint violation
      if (
        txError instanceof Prisma.PrismaClientKnownRequestError &&
        txError.code === "P2002"
      ) {
        return NextResponse.json(
          {
            error:
              "This time slot is already reserved. Please choose another slot.",
          },
          { status: 409 }
        );
      }

      throw txError;
    }

    // 8. Send booking confirmation email asynchronously (fire and forget)
    sendEmail({
      to: session.user.email,
      subject: `Booking Request Received: ${service.name}`,
      template: "booking-created",
      data: {
        customerName: session.user.name,
        serviceName: service.name,
        scheduledAt: newBooking.scheduledAt,
        durationMinutes: service.durationMinutes,
        price: Number(service.price),
        currency: service.currency,
        bookingId: newBooking.id,
        notes: newBooking.notes,
      },
    }).catch((emailError) => {
      console.error(
        "[Slotly API] Failed to send booking confirmation email:",
        emailError
      );
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("[Slotly Bookings API] Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error creating booking" },
      { status: 500 }
    );
  }
}
