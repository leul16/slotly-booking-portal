/**
 * Environment variable validation module for Slotly.
 * Validates required variables at import time and provides typed access across the application.
 */

export interface EnvConfig {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM: string;
  BETTER_AUTH_URL: string;
  ADMIN_SETUP_EMAIL?: string;
  ADMIN_SETUP_PASSWORD?: string;
  NODE_ENV: string;
}

function validateEnv(): EnvConfig {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    const fallbackUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || fallbackUrl,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM || "Slotly <onboarding@resend.dev>",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || fallbackUrl,
      ADMIN_SETUP_EMAIL: process.env.ADMIN_SETUP_EMAIL,
      ADMIN_SETUP_PASSWORD: process.env.ADMIN_SETUP_PASSWORD,
      NODE_ENV: process.env.NODE_ENV || "development",
    };
  }

  const missing: string[] = [];

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
  if (!BETTER_AUTH_SECRET) {
    missing.push("BETTER_AUTH_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(
      `\n❌ Invalid environment variables! The following required variables are missing:\n${missing
        .map((key) => `   - ${key}`)
        .join("\n")}\n\nPlease check your .env file or deployment settings.\n`
    );
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY && process.env.NODE_ENV !== "test") {
    console.warn(
      "⚠️ [Slotly Warning] RESEND_API_KEY is not defined. Email notifications will be disabled or logged to console."
    );
  }

  const defaultAppUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl;
  const EMAIL_FROM = process.env.EMAIL_FROM || "Slotly <onboarding@resend.dev>";
  const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || NEXT_PUBLIC_APP_URL;

  return {
    DATABASE_URL: DATABASE_URL!,
    BETTER_AUTH_SECRET: BETTER_AUTH_SECRET!,
    NEXT_PUBLIC_APP_URL,
    RESEND_API_KEY,
    EMAIL_FROM,
    BETTER_AUTH_URL,
    ADMIN_SETUP_EMAIL: process.env.ADMIN_SETUP_EMAIL,
    ADMIN_SETUP_PASSWORD: process.env.ADMIN_SETUP_PASSWORD,
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

export const env = validateEnv();
export type Env = typeof env;
export default env;
