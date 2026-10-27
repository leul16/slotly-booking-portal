/**
 * Live End-to-End Functional Verification Suite
 * Validates actual running HTTP endpoints against the live database.
 */

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  status?: number;
  details?: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, passed: boolean, status?: number, details?: string) {
  results.push({ category, name, passed, status, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${category}] ${name} (Status: ${status ?? "N/A"}) ${details ? "-> " + details : ""}`);
}

function extractCookieHeader(response: Response): string {
  if (typeof (response.headers as any).getSetCookie === "function") {
    const rawList: string[] = (response.headers as any).getSetCookie();
    return rawList.map((c: string) => c.split(";")[0]).join("; ");
  }
  const single = response.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

async function run() {
  console.log("\n=======================================================");
  console.log("🚀 Starting Slotly Live Functional Verification Suite");
  console.log("=======================================================\n");

  // 1. PUBLIC PAGES
  console.log("--- 1. Testing Public Pages ---");
  try {
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeText = await homeRes.text();
    record("Public Pages", "Home Page (/) renders with featured services", homeRes.status === 200 && homeText.includes("Slotly"), homeRes.status);

    const servicesRes = await fetch(`${BASE_URL}/services`);
    const servicesText = await servicesRes.text();
    record("Public Pages", "Services Catalog (/services) lists offerings", servicesRes.status === 200 && servicesText.includes("Business Strategy Consultation"), servicesRes.status);

    const detailRes = await fetch(`${BASE_URL}/services/business-strategy-consultation`);
    const detailText = await detailRes.text();
    record("Public Pages", "Service Detail (/services/[slug]) displays pricing & duration", detailRes.status === 200 && detailText.includes("150"), detailRes.status);

    const loginRes = await fetch(`${BASE_URL}/login`);
    record("Public Pages", "Login Page (/login) renders", loginRes.status === 200, loginRes.status);

    const registerRes = await fetch(`${BASE_URL}/register`);
    record("Public Pages", "Register Page (/register) renders", registerRes.status === 200, registerRes.status);

    const forgotRes = await fetch(`${BASE_URL}/forgot-password`);
    record("Public Pages", "Forgot Password Page (/forgot-password) renders", forgotRes.status === 200, forgotRes.status);
  } catch (err) {
    record("Public Pages", "Public pages fetch", false, undefined, String(err));
  }

  // 2. AVAILABILITY API
  console.log("\n--- 2. Testing Availability & Business Hours API ---");
  let serviceId = "";
  let availableTestSlot = "";
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const service = await prisma.service.findFirst({ where: { slug: "business-strategy-consultation" } });
    if (!service) throw new Error("Service not found in DB");
    serviceId = service.id;

    // Test weekday availability (next Wednesday)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    while (futureDate.getDay() !== 3) {
      futureDate.setDate(futureDate.getDate() + 1);
    }
    const yyyy = futureDate.getFullYear();
    const mm = String(futureDate.getMonth() + 1).padStart(2, "0");
    const dd = String(futureDate.getDate()).padStart(2, "0");
    const wednesdayStr = `${yyyy}-${mm}-${dd}`;

    const availRes = await fetch(`${BASE_URL}/api/availability?serviceId=${serviceId}&date=${wednesdayStr}`);
    const slots = await availRes.json();
    availableTestSlot = Array.isArray(slots) && slots.length > 0 ? slots[0] : "";
    record("Availability", `Availability returns open slots for Wednesday (${wednesdayStr})`, availRes.status === 200 && Array.isArray(slots) && slots.length > 0, availRes.status, `Returned ${slots.length} available slots`);

    // Test Sunday (closed)
    const sunday = new Date(futureDate);
    while (sunday.getDay() !== 0) {
      sunday.setDate(sunday.getDate() + 1);
    }
    const sunStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;
    const sunRes = await fetch(`${BASE_URL}/api/availability?serviceId=${serviceId}&date=${sunStr}`);
    const sunSlots = await sunRes.json();
    record("Availability", `Sunday availability returns 0 slots (business closed: ${sunStr})`, sunRes.status === 200 && Array.isArray(sunSlots) && sunSlots.length === 0, sunRes.status, `Returned ${sunSlots.length} slots`);

    // Test invalid request
    const badRes = await fetch(`${BASE_URL}/api/availability?serviceId=${serviceId}&date=invalid-date`);
    record("Availability", "Rejects malformed date format with 400", badRes.status === 400, badRes.status);
    await prisma.$disconnect();
  } catch (err) {
    record("Availability", "Availability tests", false, undefined, String(err));
  }

  // 3. AUTHENTICATION (Better Auth)
  console.log("\n--- 3. Testing Authentication & Session Management ---");
  let customerCookies = "";
  let adminCookies = "";
  try {
    // A. Demo Customer Sign In (with Origin header)
    const loginRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: "demo@slotly.com",
        password: "Demo1234!",
      }),
    });
    const loginData = await loginRes.json();
    customerCookies = extractCookieHeader(loginRes);
    record("Authentication", "Demo Customer Login (demo@slotly.com)", loginRes.status === 200 && !!loginData.user, loginRes.status, `User ID: ${loginData.user?.id}`);

    // B. Admin Sign In (with Origin header)
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: "admin@slotly.com",
        password: "Admin1234!",
      }),
    });
    const adminData = await adminLoginRes.json();
    adminCookies = extractCookieHeader(adminLoginRes);
    record("Authentication", "Admin Login (admin@slotly.com)", adminLoginRes.status === 200 && adminData.user?.role === "admin", adminLoginRes.status, `Admin Role: ${adminData.user?.role}`);

    // C. Invalid Credentials Rejection
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        email: "demo@slotly.com",
        password: "WrongPassword999!",
      }),
    });
    record("Authentication", "Rejects invalid login credentials with error", badLoginRes.status !== 200, badLoginRes.status);
  } catch (err) {
    record("Authentication", "Authentication tests", false, undefined, String(err));
  }

  // 4. ROLE-BASED ACCESS CONTROL (Middleware & Layouts)
  console.log("\n--- 4. Testing Role-Based Route Protection ---");
  try {
    // Unauthenticated request to /admin -> Redirect to /login
    const anonAdmin = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
    record("RBAC Protection", "Unauthenticated /admin redirects to login", anonAdmin.status === 307 || anonAdmin.status === 302, anonAdmin.status);

    // Customer access to /admin -> Redirect to /dashboard
    const customerAdmin = await fetch(`${BASE_URL}/admin`, {
      headers: { cookie: customerCookies },
      redirect: "manual",
    });
    record("RBAC Protection", "Non-admin customer accessing /admin is redirected", customerAdmin.status === 307 || customerAdmin.status === 302, customerAdmin.status);

    // Admin access to /admin -> 200 OK
    const adminAccess = await fetch(`${BASE_URL}/admin`, {
      headers: { cookie: adminCookies },
    });
    record("RBAC Protection", "Admin accessing /admin gets access", adminAccess.status === 200, adminAccess.status);
  } catch (err) {
    record("RBAC Protection", "Route protection tests", false, undefined, String(err));
  }

  // 5. BOOKING CREATION & CONFLICT PREVENTION
  console.log("\n--- 5. Testing Booking Creation & Conflict Prevention ---");
  let createdBookingId = "";
  try {
    // Pick the first guaranteed open weekday slot returned by the availability endpoint
    const validBookingSlot = availableTestSlot;

    // A. Create booking as Customer
    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
        cookie: customerCookies,
      },
      body: JSON.stringify({
        serviceId,
        scheduledAt: validBookingSlot,
        notes: "Live verification automated booking test.",
      }),
    });
    const bookData = await bookRes.json();
    createdBookingId = bookData.id;
    record("Booking Creation", "Create new booking via API", bookRes.status === 201 && !!bookData.id, bookRes.status, `Booking ID: ${createdBookingId}`);

    // B. Attempt Double Booking (Same slot) -> Must be rejected with 409 Conflict
    const conflictRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
        cookie: customerCookies,
      },
      body: JSON.stringify({
        serviceId,
        scheduledAt: validBookingSlot,
        notes: "Duplicate booking attempt.",
      }),
    });
    record("Booking Conflict", "Double-booking prevention (returns 409 Conflict)", conflictRes.status === 409, conflictRes.status);

    // C. Attempt Past Booking -> Must be rejected with 400
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pastRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
        cookie: customerCookies,
      },
      body: JSON.stringify({
        serviceId,
        scheduledAt: pastDate.toISOString(),
      }),
    });
    record("Booking Validation", "Rejects booking in the past with 400", pastRes.status === 400, pastRes.status);
  } catch (err) {
    record("Booking Creation", "Booking creation tests", false, undefined, String(err));
  }

  // 6. CUSTOMER DASHBOARD & CANCELLATION
  console.log("\n--- 6. Testing Customer Dashboard & Cancellation Flow ---");
  try {
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { cookie: customerCookies },
    });
    record("Customer Dashboard", "Customer Overview (/dashboard) renders with user bookings", dashRes.status === 200, dashRes.status);

    const bookingsPageRes = await fetch(`${BASE_URL}/dashboard/bookings`, {
      headers: { cookie: customerCookies },
    });
    record("Customer Dashboard", "My Bookings (/dashboard/bookings) renders", bookingsPageRes.status === 200, bookingsPageRes.status);

    if (createdBookingId) {
      const detailRes = await fetch(`${BASE_URL}/dashboard/bookings/${createdBookingId}`, {
        headers: { cookie: customerCookies },
      });
      record("Customer Dashboard", "Booking Detail Page (/dashboard/bookings/[id]) renders", detailRes.status === 200, detailRes.status);

      // Cancel the newly created booking (> 24 hours away) -> Should succeed
      const cancelRes = await fetch(`${BASE_URL}/api/bookings/${createdBookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: BASE_URL,
          cookie: customerCookies,
        },
        body: JSON.stringify({
          reason: "Customer schedule conflict in automated test.",
        }),
      });
      const cancelData = await cancelRes.json();
      record("Cancellation Flow", "Customer cancels booking > 24 hours away", cancelRes.status === 200 && cancelData.status === "CANCELLED", cancelRes.status, `Status: ${cancelData.status}`);
    }
  } catch (err) {
    record("Customer Dashboard", "Dashboard tests", false, undefined, String(err));
  }

  // 7. ADMIN SERVICES & BOOKING MANAGEMENT
  console.log("\n--- 7. Testing Admin Services & Booking Management ---");
  let testAdminServiceId = "";
  try {
    // A. List Services via Admin API
    const listServicesRes = await fetch(`${BASE_URL}/api/admin/services`, {
      headers: { cookie: adminCookies },
    });
    const listServicesData = await listServicesRes.json();
    record("Admin Services", "Admin GET /api/admin/services lists catalog", listServicesRes.status === 200 && Array.isArray(listServicesData.services), listServicesRes.status, `Total: ${listServicesData.pagination?.total}`);

    // B. Create a new Service as Admin
    const createSrvRes = await fetch(`${BASE_URL}/api/admin/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: BASE_URL,
        cookie: adminCookies,
      },
      body: JSON.stringify({
        name: "Test Executive Advisory Sprint",
        description: "Special high-priority advisory sprint session created during automated verification.",
        durationMinutes: 75,
        price: 275.0,
        currency: "USD",
        isActive: true,
      }),
    });
    const createSrvData = await createSrvRes.json();
    testAdminServiceId = createSrvData.service?.id;
    record("Admin Services", "Admin POST /api/admin/services creates service", createSrvRes.status === 201 && !!testAdminServiceId, createSrvRes.status, `Slug: ${createSrvData.service?.slug}`);

    // C. Update Service as Admin (PATCH)
    if (testAdminServiceId) {
      const updateSrvRes = await fetch(`${BASE_URL}/api/admin/services/${testAdminServiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Origin: BASE_URL,
          cookie: adminCookies,
        },
        body: JSON.stringify({
          price: 320.0,
          isActive: false,
        }),
      });
      const updateSrvData = await updateSrvRes.json();
      record("Admin Services", "Admin PATCH /api/admin/services/[id] updates price & status", updateSrvRes.status === 200 && updateSrvData.service?.price === 320, updateSrvRes.status, `New price: $${updateSrvData.service?.price}`);

      // D. Delete Service as Admin (DELETE - hard delete since no bookings exist)
      const deleteSrvRes = await fetch(`${BASE_URL}/api/admin/services/${testAdminServiceId}`, {
        method: "DELETE",
        headers: {
          Origin: BASE_URL,
          cookie: adminCookies,
        },
      });
      const deleteSrvData = await deleteSrvRes.json();
      record("Admin Services", "Admin DELETE /api/admin/services/[id] deletes unused service", deleteSrvRes.status === 200 && deleteSrvData.softDeleted === false, deleteSrvRes.status, deleteSrvData.message);
    }

    // E. Admin Status Transition on Seeded Pending Booking
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const pendingBooking = await prisma.booking.findFirst({
      where: { status: "PENDING" },
    });

    if (pendingBooking) {
      // Transition PENDING -> CONFIRMED
      const confirmRes = await fetch(`${BASE_URL}/api/admin/bookings/${pendingBooking.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Origin: BASE_URL,
          cookie: adminCookies,
        },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      const confirmData = await confirmRes.json();
      record("Admin Bookings", "Admin confirms PENDING booking -> CONFIRMED", confirmRes.status === 200 && confirmData.booking?.status === "CONFIRMED", confirmRes.status);

      // Transition CONFIRMED -> COMPLETED
      const completeRes = await fetch(`${BASE_URL}/api/admin/bookings/${pendingBooking.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Origin: BASE_URL,
          cookie: adminCookies,
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const completeData = await completeRes.json();
      record("Admin Bookings", "Admin completes CONFIRMED booking -> COMPLETED", completeRes.status === 200 && completeData.booking?.status === "COMPLETED", completeRes.status);

      // Attempt invalid transition COMPLETED -> PENDING (Must fail with 400)
      const invalidRes = await fetch(`${BASE_URL}/api/admin/bookings/${pendingBooking.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Origin: BASE_URL,
          cookie: adminCookies,
        },
        body: JSON.stringify({ status: "PENDING" }),
      });
      record("Admin Bookings", "Admin status workflow rejects invalid transition (COMPLETED -> PENDING)", invalidRes.status === 400, invalidRes.status);
    }
    await prisma.$disconnect();
  } catch (err) {
    record("Admin Management", "Admin tests", false, undefined, String(err));
  }

  // SUMMARY
  console.log("\n=======================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`📊 Live Verification Results: ${passed} / ${total} Passed (${failed} Failed)`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
