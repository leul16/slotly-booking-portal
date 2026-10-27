import { describe, it, expect } from "vitest";
import {
  generateTimeSlots,
  parseDateParts,
} from "@/lib/availability";
import {
  createBookingSchema,
  cancelBookingSchema,
} from "@/lib/validations/booking";
import { CANCELLATION_DEADLINE_HOURS, TIMEZONE } from "@/lib/constants";

describe("Customer Availability & Slot Logic", () => {
  it("generates correct slots within business hours for given duration", () => {
    // 09:00 to 12:00, 45 min duration, 30 min intervals
    const slots = generateTimeSlots("09:00", "12:00", 45, 30);
    expect(slots.length).toBe(5);
    // 09:00-09:45
    expect(slots[0]).toEqual({
      start: "09:00",
      end: "09:45",
      startMinutes: 540,
      endMinutes: 585,
    });
    // 09:30-10:15
    expect(slots[1]).toEqual({
      start: "09:30",
      end: "10:15",
      startMinutes: 570,
      endMinutes: 615,
    });
    // 11:00-11:45
    expect(slots[4]).toEqual({
      start: "11:00",
      end: "11:45",
      startMinutes: 660,
      endMinutes: 705,
    });
  });

  it("parses date parts accurately in America/New_York timezone", () => {
    const parts = parseDateParts("2026-10-27", TIMEZONE);
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(10);
    expect(parts.day).toBe(27);
    expect(parts.dayOfWeek).toBe(2); // Tuesday
  });
});

describe("Booking Validation Schemas", () => {
  it("validates valid booking input in future", () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const validData = {
      serviceId: "srv-123",
      scheduledAt: futureDate.toISOString(),
      notes: "Please call when arriving",
    };

    const parsed = createBookingSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.serviceId).toBe("srv-123");
      expect(parsed.data.notes).toBe("Please call when arriving");
    }
  });

  it("rejects booking input with scheduled time in past", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const invalidData = {
      serviceId: "srv-123",
      scheduledAt: pastDate.toISOString(),
    };

    const parsed = createBookingSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("rejects empty serviceId", () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const invalidData = {
      serviceId: "",
      scheduledAt: futureDate.toISOString(),
    };

    const parsed = createBookingSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("validates cancelBookingSchema correctly", () => {
    const validCancel = {
      bookingId: "bk-999",
      reason: "Conflict with personal schedule",
    };
    const parsed = cancelBookingSchema.safeParse(validCancel);
    expect(parsed.success).toBe(true);
  });
});

describe("Cancellation Deadline Rule", () => {
  it("allows cancellation when scheduled time is more than 24 hours away", () => {
    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const hoursRemaining = (scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    const isCancellable = hoursRemaining >= CANCELLATION_DEADLINE_HOURS;
    expect(isCancellable).toBe(true);
  });

  it("disallows customer cancellation when scheduled time is less than 24 hours away", () => {
    const scheduledAt = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours away
    const hoursRemaining = (scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    const isCancellable = hoursRemaining >= CANCELLATION_DEADLINE_HOURS;
    expect(isCancellable).toBe(false);
  });
});
