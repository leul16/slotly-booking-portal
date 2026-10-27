import { z } from "zod";

export const bookingStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const createBookingSchema = z.object({
  serviceId: z
    .string()
    .min(1, "Service ID cannot be empty"),
  scheduledAt: z.coerce
    .date()
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .refine((date) => date.getTime() > Date.now(), {
      message: "Appointment time must be in the future",
    }),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z
    .string()
    .min(1, "Booking ID cannot be empty"),
  reason: z
    .string()
    .max(500, "Cancellation reason cannot exceed 500 characters")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const updateBookingStatusSchema = z.object({
  bookingId: z
    .string()
    .min(1, "Booking ID cannot be empty"),
  status: bookingStatusEnum,
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
