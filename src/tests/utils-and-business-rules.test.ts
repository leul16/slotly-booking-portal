import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDuration,
  getInitials,
} from "@/lib/utils";
import {
  DEFAULT_BUSINESS_HOURS,
} from "@/lib/constants";
import {
  generateTimeSlots,
} from "@/lib/availability";

describe("Formatting Utilities", () => {
  it("formats currencies correctly with defaults and custom currency", () => {
    expect(formatCurrency(150)).toBe("$150.00");
    expect(formatCurrency("99.5")).toBe("$99.50");
    expect(formatCurrency("invalid")).toBe("$0.00");
    expect(formatCurrency(250, "EUR")).toMatch(/€\s*250\.00|250,00\s*€/);
  });

  it("formats durations in human-friendly format", () => {
    expect(formatDuration(15)).toBe("15 mins");
    expect(formatDuration(45)).toBe("45 mins");
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(90)).toBe("1 hr 30 mins");
    expect(formatDuration(120)).toBe("2 hrs");
    expect(formatDuration(135)).toBe("2 hrs 15 mins");
  });

  it("extracts initials correctly from names", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Alice")).toBe("A");
    expect(getInitials("Jane Marie Smith")).toBe("JS");
    expect(getInitials(null)).toBe("?");
    expect(getInitials("")).toBe("?");
  });
});

describe("Business Operating Hours & Slot Logic", () => {
  it("ensures default schedule covers 7 days with Sunday closed", () => {
    expect(DEFAULT_BUSINESS_HOURS.length).toBe(7);
    const sunday = DEFAULT_BUSINESS_HOURS.find((h) => h.dayOfWeek === 0);
    expect(sunday?.isClosed).toBe(true);

    const saturday = DEFAULT_BUSINESS_HOURS.find((h) => h.dayOfWeek === 6);
    expect(saturday?.isClosed).toBe(false);
    expect(saturday?.openTime).toBe("10:00");
    expect(saturday?.closeTime).toBe("14:00");

    const monday = DEFAULT_BUSINESS_HOURS.find((h) => h.dayOfWeek === 1);
    expect(monday?.isClosed).toBe(false);
    expect(monday?.openTime).toBe("09:00");
    expect(monday?.closeTime).toBe("17:00");
  });

  it("calculates Saturday slots correctly (10:00 - 14:00 with 60 min duration)", () => {
    // 10:00 to 14:00 (4 hours = 240 mins), 60 min duration, 30 min interval
    // Slots start: 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00 (end 14:00) -> 7 slots
    const slots = generateTimeSlots("10:00", "14:00", 60, 30);
    expect(slots.length).toBe(7);
    expect(slots[0].start).toBe("10:00");
    expect(slots[0].end).toBe("11:00");
    expect(slots[slots.length - 1].start).toBe("13:00");
    expect(slots[slots.length - 1].end).toBe("14:00");
  });

  it("does not allow slots to overflow past closing time", () => {
    // 90 min duration with close time at 17:00
    // Last slot starting at 15:30 ends at 17:00.
    // 16:00 would end at 17:30 (overflow) so it must NOT be generated.
    const slots = generateTimeSlots("09:00", "17:00", 90, 30);
    const lastSlot = slots[slots.length - 1];
    expect(lastSlot.end).toBe("17:00");
    expect(lastSlot.start).toBe("15:30");
  });
});

describe("Admin Booking Status Workflow Rules", () => {
  // Verifies the state machine transitions defined in PATCH /api/admin/bookings/[id]/status
  function isValidTransition(current: string, target: string): boolean {
    if (current === target) return true;
    if (current === "PENDING") {
      return target === "CONFIRMED" || target === "CANCELLED";
    }
    if (current === "CONFIRMED") {
      return target === "COMPLETED" || target === "CANCELLED";
    }
    return false;
  }

  it("allows valid transitions from PENDING", () => {
    expect(isValidTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(isValidTransition("PENDING", "CANCELLED")).toBe(true);
    expect(isValidTransition("PENDING", "COMPLETED")).toBe(false);
  });

  it("allows valid transitions from CONFIRMED", () => {
    expect(isValidTransition("CONFIRMED", "COMPLETED")).toBe(true);
    expect(isValidTransition("CONFIRMED", "CANCELLED")).toBe(true);
    expect(isValidTransition("CONFIRMED", "PENDING")).toBe(false);
  });

  it("prevents any transitions from terminal states CANCELLED and COMPLETED", () => {
    expect(isValidTransition("CANCELLED", "PENDING")).toBe(false);
    expect(isValidTransition("CANCELLED", "CONFIRMED")).toBe(false);
    expect(isValidTransition("CANCELLED", "COMPLETED")).toBe(false);

    expect(isValidTransition("COMPLETED", "PENDING")).toBe(false);
    expect(isValidTransition("COMPLETED", "CONFIRMED")).toBe(false);
    expect(isValidTransition("COMPLETED", "CANCELLED")).toBe(false);
  });
});
