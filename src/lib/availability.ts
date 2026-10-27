import { prisma } from "@/lib/prisma";
import {
  DEFAULT_BUSINESS_HOURS,
  SLOT_INTERVAL_MINUTES,
  TIMEZONE,
} from "@/lib/constants";
import { formatTime } from "@/lib/utils";

export interface TimeSlotWindow {
  start: string; // "09:00"
  end: string; // "09:45"
  startMinutes: number;
  endMinutes: number;
}

export interface AvailableSlot {
  startTime: Date;
  endTime: Date;
  time: string; // "09:00"
  formattedTime: string; // "9:00 AM"
  formattedEndTime: string; // "9:45 AM"
  available: boolean;
}

export interface BusinessHoursResult {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  dayName?: string;
}

/**
 * Helper to construct a Date object representing specific local calendar values
 * in the configured timezone (e.g. America/New_York).
 */
export function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string = TIMEZONE
): Date {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(utcDate);

  const localYear = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const localMonth = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const localDay = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  let localHour = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  if (localHour === 24) localHour = 0;
  const localMinute = parseInt(parts.find((p) => p.type === "minute")!.value, 10);

  const localTime = Date.UTC(localYear, localMonth - 1, localDay, localHour, localMinute);
  const diff = utcDate.getTime() - localTime;
  return new Date(utcDate.getTime() + diff);
}

/**
 * Parse date input into timezone-aware components (year, month, day, dayOfWeek).
 */
export function parseDateParts(
  dateInput: Date | string,
  timeZone: string = TIMEZONE
): { year: number; month: number; day: number; dayOfWeek: number } {
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    const refDate = createDateInTimezone(year, month, day, 12, 0, timeZone);
    const weekdayStr = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
    }).format(refDate);

    const days: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return { year, month, day, dayOfWeek: days[weekdayStr] ?? refDate.getDay() };
  }

  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(d);

  const year = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = parseInt(parts.find((p) => p.type === "month")!.value, 10);
  const day = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  const weekdayStr = parts.find((p) => p.type === "weekday")!.value;

  const days: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year,
    month,
    day,
    dayOfWeek: days[weekdayStr] ?? d.getDay(),
  };
}

/**
 * Retrieve business hours for a specific day of the week (0 = Sunday, 6 = Saturday).
 * Queries database first, falling back to DEFAULT_BUSINESS_HOURS.
 */
export async function getBusinessHoursForDay(dayOfWeek: number): Promise<BusinessHoursResult> {
  const fallback = DEFAULT_BUSINESS_HOURS.find((h) => h.dayOfWeek === dayOfWeek) ?? {
    dayOfWeek,
    dayName: "Unknown",
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: dayOfWeek === 0,
  };

  try {
    const dbHours = await prisma.businessHours.findUnique({
      where: { dayOfWeek },
    });

    if (dbHours) {
      return {
        dayOfWeek: dbHours.dayOfWeek,
        openTime: dbHours.openTime,
        closeTime: dbHours.closeTime,
        isClosed: dbHours.isClosed,
        dayName: fallback.dayName,
      };
    }
  } catch (error) {
    console.warn(
      `[Slotly Availability] Could not load business hours from DB for day ${dayOfWeek}, using fallback:`,
      error
    );
  }

  return {
    dayOfWeek: fallback.dayOfWeek,
    openTime: fallback.openTime,
    closeTime: fallback.closeTime,
    isClosed: fallback.isClosed,
    dayName: fallback.dayName,
  };
}

/**
 * Generate all possible time slots within an open/close range for a service duration.
 */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
  intervalMinutes: number = SLOT_INTERVAL_MINUTES
): TimeSlotWindow[] {
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  const startTotalMinutes = openHour * 60 + openMin;
  const endTotalMinutes = closeHour * 60 + closeMin;

  const slots: TimeSlotWindow[] = [];

  for (
    let current = startTotalMinutes;
    current + durationMinutes <= endTotalMinutes;
    current += intervalMinutes
  ) {
    const endMinutes = current + durationMinutes;

    const startH = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");
    const startM = (current % 60).toString().padStart(2, "0");
    const endH = Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, "0");
    const endM = (endMinutes % 60).toString().padStart(2, "0");

    slots.push({
      start: `${startH}:${startM}`,
      end: `${endH}:${endM}`,
      startMinutes: current,
      endMinutes,
    });
  }

  return slots;
}

/**
 * Check if a specific time window is available for booking.
 */
export async function isSlotAvailable(
  serviceId: string,
  scheduledAt: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const now = new Date();
  if (scheduledAt.getTime() <= now.getTime()) {
    return false;
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.isActive) {
    return false;
  }

  const { dayOfWeek } = parseDateParts(scheduledAt, TIMEZONE);
  const hours = await getBusinessHoursForDay(dayOfWeek);

  if (hours.isClosed) {
    return false;
  }

  const [openH, openM] = hours.openTime.split(":").map(Number);
  const [closeH, closeM] = hours.closeTime.split(":").map(Number);

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
  const slotMinutesFromMidnight = slotHour * 60 + slotMinute;

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const slotDuration = Math.round((endTime.getTime() - scheduledAt.getTime()) / (1000 * 60));

  if (
    slotMinutesFromMidnight < openMinutes ||
    slotMinutesFromMidnight + slotDuration > closeMinutes
  ) {
    return false;
  }

  // Check for overlapping bookings
  const overlapping = await prisma.booking.findFirst({
    where: {
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
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

  return overlapping === null;
}

/**
 * Retrieve all available time slots for a given service and date in America/New_York timezone.
 */
export async function getAvailableSlots(
  serviceId: string,
  date: Date | string
): Promise<AvailableSlot[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.isActive) {
    return [];
  }

  const { year, month, day, dayOfWeek } = parseDateParts(date, TIMEZONE);
  const hours = await getBusinessHoursForDay(dayOfWeek);

  if (hours.isClosed) {
    return [];
  }

  const slotWindows = generateTimeSlots(
    hours.openTime,
    hours.closeTime,
    service.durationMinutes,
    SLOT_INTERVAL_MINUTES
  );

  if (slotWindows.length === 0) {
    return [];
  }

  // Compute start and end of the day in UTC for querying bookings
  const dayStart = createDateInTimezone(year, month, day, 0, 0, TIMEZONE);
  const dayEnd = createDateInTimezone(year, month, day, 23, 59, TIMEZONE);

  const bookings = await prisma.booking.findMany({
    where: {
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

  return slotWindows.map((slot) => {
    const [startH, startM] = slot.start.split(":").map(Number);
    const startTime = createDateInTimezone(year, month, day, startH, startM, TIMEZONE);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60 * 1000);

    const isPast = startTime.getTime() <= now.getTime();
    const hasConflict = bookings.some(
      (b: { scheduledAt: Date; endTime: Date }) =>
        startTime < b.endTime && endTime > b.scheduledAt
    );

    return {
      startTime,
      endTime,
      time: slot.start,
      formattedTime: formatTime(startTime, TIMEZONE),
      formattedEndTime: formatTime(endTime, TIMEZONE),
      available: !isPast && !hasConflict,
    };
  });
}
