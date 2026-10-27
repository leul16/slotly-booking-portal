import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session, User } from "@/lib/auth";

export interface AuthSession {
  user: User;
  session: Session;
}

/**
 * Retrieve the active user and session from incoming request headers.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const headersList = await headers();
    const result = await auth.api.getSession({
      headers: headersList,
    });

    if (!result || !result.user || !result.session) {
      return null;
    }

    return result as unknown as AuthSession;
  } catch (error) {
    console.error("[Slotly Session] Error retrieving session:", error);
    return null;
  }
}

/**
 * Require an authenticated session. Redirects to /login if not authenticated.
 */
export async function requireSession(redirectTo = "/login"): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}

/**
 * Require an authenticated admin session.
 * Redirects to /login if unauthenticated, or /dashboard if not an admin.
 */
export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireSession("/login");

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Require an authenticated session with a verified email.
 * Redirects to /login if unauthenticated, or /verify-email if unverified.
 */
export async function requireVerifiedEmail(redirectTo = "/verify-email"): Promise<AuthSession> {
  const session = await requireSession("/login");

  if (!session.user.emailVerified) {
    redirect(redirectTo);
  }

  return session;
}
