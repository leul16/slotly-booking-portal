import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

describe("Authentication Validation Schemas", () => {
  describe("Login Schema", () => {
    it("accepts valid email and password", () => {
      const valid = {
        email: "customer@example.com",
        password: "ValidPassword123!",
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects malformed email address", () => {
      const invalid = {
        email: "not-an-email",
        password: "ValidPassword123!",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects password shorter than 8 characters", () => {
      const invalid = {
        email: "customer@example.com",
        password: "short",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Register Schema", () => {
    it("accepts valid registration with matching strong password", () => {
      const valid = {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "SecurePassword123",
        passwordConfirmation: "SecurePassword123",
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects registration when passwords do not match", () => {
      const mismatched = {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "SecurePassword123",
        passwordConfirmation: "DifferentPassword123",
      };
      const result = registerSchema.safeParse(mismatched);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.passwordConfirmation).toContain(
          "Passwords do not match"
        );
      }
    });

    it("rejects password missing uppercase letter", () => {
      const noUpper = {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "securepassword123",
        passwordConfirmation: "securepassword123",
      };
      const result = registerSchema.safeParse(noUpper);
      expect(result.success).toBe(false);
    });

    it("rejects password missing number", () => {
      const noNumber = {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "SecurePassword",
        passwordConfirmation: "SecurePassword",
      };
      const result = registerSchema.safeParse(noNumber);
      expect(result.success).toBe(false);
    });
  });

  describe("Forgot and Reset Password Schemas", () => {
    it("validates forgot password email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "user@slotly.com" }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
    });

    it("validates reset password with matching token", () => {
      const validReset = {
        password: "NewPassword99!",
        passwordConfirmation: "NewPassword99!",
        token: "sample-reset-token-12345",
      };
      expect(resetPasswordSchema.safeParse(validReset).success).toBe(true);
    });

    it("rejects reset password with missing token", () => {
      const missingToken = {
        password: "NewPassword99!",
        passwordConfirmation: "NewPassword99!",
        token: "",
      };
      expect(resetPasswordSchema.safeParse(missingToken).success).toBe(false);
    });
  });
});
