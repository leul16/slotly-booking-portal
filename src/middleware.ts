import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Check for presence of Better Auth session token cookie
  const sessionCookie =
    request.cookies.get("slotly.session_token")?.value ||
    request.cookies.get("__Secure-slotly.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Validate session via Better Auth internal API
    const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!sessionRes.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await sessionRes.json();
    if (!sessionData?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based protection: non-admins cannot access /admin/*
    if (isAdminRoute && sessionData.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Slotly Middleware] Error verifying session:", error);

    // If verification call fails unexpectedly during boot/network hiccup,
    // prevent non-admins on /admin routes, but let dashboard fall back to server component check
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
