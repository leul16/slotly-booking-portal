import { z } from "zod";

export const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Service name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and single hyphens"
    )
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  durationMinutes: z.coerce
    .number()
    .int("Duration must be an integer")
    .min(15, "Duration must be at least 15 minutes")
    .max(480, "Duration cannot exceed 480 minutes (8 hours)"),
  price: z.coerce
    .number()
    .positive("Price must be a positive number")
    .max(100000, "Price cannot exceed $100,000"),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter ISO code")
    .toUpperCase()
    .default("USD"),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string().optional(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
