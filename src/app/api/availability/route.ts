import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getBusinessHoursForDay,
  generateTimeSlots,
  parseDateParts,
  createDateInTimezone,
} from "@/lib/availability";
import {
  SLOT_INTERVAL_MINUTES,
  TIMEZONE,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const dateStr = searchParams.get("date"); // Expected format: YYYY-MM-DD

    if (!serviceId) {
      return NextResponse.json(
        { error: "Missing required query parameter: serviceId" },
        { status: 400 }
      );
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Missing or invalid query parameter: date (expected YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // 1. Fetch service to get duration and check if active
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        isActive: true,
      },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found or is currently inactive" },
        { status: 404 }
      );
    }

    // 2. Parse date components in configured timezone
    const { year, month, day, dayOfWeek } = parseDateParts(dateStr, TIMEZONE);

    // 3. Get business hours for day of week
    const hours = await getBusinessHoursForDay(dayOfWeek);

    // If closed, return empty array of slots
    if (hours.isClosed) {
      return NextResponse.json([]);
    }

    // 4. Generate all possible time slots within business hours
    const slotWindows = generateTimeSlots(
      hours.openTime,
      hours.closeTime,
      service.durationMinutes,
      SLOT_INTERVAL_MINUTES
    );

    if (slotWindows.length === 0) {
      return NextResponse.json([]);
    }

    // 5. Query existing active bookings for that day
    const dayStart = createDateInTimezone(year, month, day, 0, 0, TIMEZONE);
    const dayEnd = createDateInTimezone(year, month, day, 23, 59, TIMEZONE);

    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId: service.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        scheduledAt: {
          lte: dayEnd,
        },
        endTime: {
          gte: dayStart,
        },
      },
      select: {
        scheduledAt: true,
        endTime: true,
      },
    });

    const now = new Date();

    // 6. Filter out past slots and conflicting slots
    const availableSlots: string[] = [];

    for (const slot of slotWindows) {
      const [startH, startM] = slot.start.split(":").map(Number);
      const startTime = createDateInTimezone(year, month, day, startH, startM, TIMEZONE);
      const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

      // Must be in future
      if (startTime.getTime() <= now.getTime()) {
        continue;
      }

      // Check conflict with any existing booking
      const hasConflict = existingBookings.some((booking) => {
        return startTime < booking.endTime && endTime > booking.scheduledAt;
      });

      if (!hasConflict) {
        availableSlots.push(startTime.toISOString());
      }
    }

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error("[Slotly Availability API] Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error retrieving availability" },
      { status: 500 }
    );
  }
}
