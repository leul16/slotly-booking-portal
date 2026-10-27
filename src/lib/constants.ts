export const BOOKING_STATUSES = {
  PENDING: {
    label: "Pending",
    color: "yellow",
    variant: "warning",
    description: "Awaiting confirmation",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "green",
    variant: "success",
    description: "Booking is confirmed",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "red",
    variant: "destructive",
    description: "Booking has been cancelled",
  },
  COMPLETED: {
    label: "Completed",
    color: "blue",
    variant: "default",
    description: "Service has been delivered",
  },
} as const;

export type BookingStatusType = keyof typeof BOOKING_STATUSES;

export interface BusinessHourConfig {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  openTime: string; // "09:00" format (24h)
  closeTime: string; // "17:00" format (24h)
  isClosed: boolean;
}

export const DEFAULT_BUSINESS_HOURS: readonly BusinessHourConfig[] = [
  { dayOfWeek: 0, dayName: "Sunday", openTime: "09:00", closeTime: "17:00", isClosed: true },
  { dayOfWeek: 1, dayName: "Monday", openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 2, dayName: "Tuesday", openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 3, dayName: "Wednesday", openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 4, dayName: "Thursday", openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 5, dayName: "Friday", openTime: "09:00", closeTime: "17:00", isClosed: false },
  { dayOfWeek: 6, dayName: "Saturday", openTime: "10:00", closeTime: "14:00", isClosed: false },
] as const;

export const TIMEZONE = "America/New_York";
export const SLOT_INTERVAL_MINUTES = 30;
export const MAX_ADVANCE_BOOKING_DAYS = 60;
export const CANCELLATION_DEADLINE_HOURS = 24;
export const APP_NAME = "Slotly";
export const DEFAULT_CURRENCY = "USD";
