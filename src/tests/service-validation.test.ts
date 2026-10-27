import { describe, it, expect } from "vitest";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@/lib/validations/service";
import { slugify } from "@/lib/utils";

describe("Service Creation and Update Validation", () => {
  it("validates a fully compliant service creation payload", () => {
    const validData = {
      name: "Strategic Advisory Session",
      slug: "strategic-advisory-session",
      description: "Comprehensive 1-on-1 strategic growth advisory session.",
      durationMinutes: 60,
      price: 150.0,
      currency: "USD",
      isActive: true,
    };

    const result = createServiceSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Strategic Advisory Session");
      expect(result.data.durationMinutes).toBe(60);
      expect(result.data.price).toBe(150);
      expect(result.data.currency).toBe("USD");
      expect(result.data.isActive).toBe(true);
    }
  });

  it("rejects service with duration less than 15 minutes", () => {
    const invalidData = {
      name: "Quick Chat",
      description: "A quick chat under 15 minutes.",
      durationMinutes: 10,
      price: 25.0,
    };

    const result = createServiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.durationMinutes).toBeDefined();
    }
  });

  it("rejects service with duration exceeding 480 minutes (8 hours)", () => {
    const invalidData = {
      name: "All Day Hackathon",
      description: "Extremely long workshop session.",
      durationMinutes: 500,
      price: 1000.0,
    };

    const result = createServiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects service with negative or zero price", () => {
    const invalidZero = {
      name: "Free Consultation",
      description: "Complimentary session with zero price.",
      durationMinutes: 30,
      price: 0,
    };

    expect(createServiceSchema.safeParse(invalidZero).success).toBe(false);

    const invalidNegative = {
      ...invalidZero,
      price: -50,
    };
    expect(createServiceSchema.safeParse(invalidNegative).success).toBe(false);
  });

  it("rejects invalid slug format with spaces or special characters", () => {
    const invalidSlug = {
      name: "Design Workshop",
      slug: "Design Workshop #1",
      description: "Interactive UX design sprint.",
      durationMinutes: 45,
      price: 75.0,
    };

    const result = createServiceSchema.safeParse(invalidSlug);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.slug).toBeDefined();
    }
  });

  it("allows partial updates in updateServiceSchema", () => {
    const partialUpdate = {
      price: 180.0,
      isActive: false,
    };

    const result = updateServiceSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(180.0);
      expect(result.data.isActive).toBe(false);
    }
  });

  it("generates correct URL-friendly slugs using slugify", () => {
    expect(slugify("Business Strategy Consultation")).toBe("business-strategy-consultation");
    expect(slugify("UX & UI Design Review!")).toBe("ux-ui-design-review");
    expect(slugify("  Special Session -- 2026  ")).toBe("special-session-2026");
    expect(slugify("Café & Crème")).toBe("cafe-creme");
  });
});
