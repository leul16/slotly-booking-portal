import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TIMEZONE } from "./constants";

/**
 * Merge Tailwind class names safely with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric amount into a currency string (e.g., "$50.00").
 */
export function formatCurrency(
  amount: number | string | { toString(): string },
  currency = "USD"
): string {
  const numericAmount = typeof amount === "number" ? amount : Number(amount.toString());
  if (isNaN(numericAmount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Parse an input date safely into a Date object.
 */
function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date);
}

/**
 * Format a date into a human-readable string (e.g., "Oct 27, 2026").
 */
export function formatDate(date: Date | string | number, timezone = TIMEZONE): string {
  const d = toDate(date);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Format a time into a 12-hour string (e.g., "2:30 PM").
 */
export function formatTime(date: Date | string | number, timezone = TIMEZONE): string {
  const d = toDate(date);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Format date and time together (e.g., "Oct 27, 2026 at 2:30 PM").
 */
export function formatDateTime(date: Date | string | number, timezone = TIMEZONE): string {
  const d = toDate(date);
  const formattedDate = formatDate(d, timezone);
  const formattedTime = formatTime(d, timezone);
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Format duration in minutes into a readable string (e.g., "1 hr 30 mins").
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return "0 mins";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"}`;
}

/**
 * Convert string to URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
}

/**
 * Extract uppercase initials from a user's full name (e.g., "John Doe" -> "JD").
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
