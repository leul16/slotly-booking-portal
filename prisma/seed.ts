import { PrismaClient, BookingStatus } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

interface ServiceSeedData {
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
}

const SERVICES_DATA: ServiceSeedData[] = [
  {
    name: "Business Strategy Consultation",
    slug: "business-strategy-consultation",
    description:
      "Comprehensive 1-on-1 strategic advisory session to diagnose growth bottlenecks, refine product-market fit, and outline an actionable quarterly execution plan.",
    durationMinutes: 60,
    price: 150.0,
    currency: "USD",
    isActive: true,
  },
  {
    name: "Web Design Review",
    slug: "web-design-review",
    description:
      "Expert UX/UI review assessing user flows, responsiveness, accessibility, typography, and conversion funnels with prioritized actionable redesign recommendations.",
    durationMinutes: 45,
    price: 100.0,
    currency: "USD",
    isActive: true,
  },
  {
    name: "Financial Planning Session",
    slug: "financial-planning-session",
    description:
      "Detailed financial evaluation covering cash flow optimization, investment asset allocation, tax efficiency strategies, and tailored retirement projections.",
    durationMinutes: 90,
    price: 200.0,
    currency: "USD",
    isActive: true,
  },
  {
    name: "Career Coaching",
    slug: "career-coaching",
    description:
      "Personalized executive coaching focusing on high-impact resume positioning, interview techniques, compensation negotiation, and leadership acceleration.",
    durationMinutes: 60,
    price: 120.0,
    currency: "USD",
    isActive: true,
  },
  {
    name: "Photography Session",
    slug: "photography-session",
    description:
      "Full portrait, headshot, or product photo shoot with creative lighting setup, art direction, and high-resolution professionally retouched digital images.",
    durationMinutes: 120,
    price: 250.0,
    currency: "USD",
    isActive: true,
  },
  {
    name: "Personal Training",
    slug: "personal-training",
    description:
      "One-on-one tailored fitness session featuring movement screening, dynamic functional conditioning, posture correction, and custom workout progression guide.",
    durationMinutes: 45,
    price: 75.0,
    currency: "USD",
    isActive: true,
  },
];

const BUSINESS_HOURS_DATA = [
  // Sunday (0): Closed
  {
    dayOfWeek: 0,
    openTime: "00:00",
    closeTime: "00:00",
    isClosed: true,
  },
  // Monday (1): 9am - 5pm
  {
    dayOfWeek: 1,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  // Tuesday (2): 9am - 5pm
  {
    dayOfWeek: 2,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  // Wednesday (3): 9am - 5pm
  {
    dayOfWeek: 3,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  // Thursday (4): 9am - 5pm
  {
    dayOfWeek: 4,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  // Friday (5): 9am - 5pm
  {
    dayOfWeek: 5,
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: false,
  },
  // Saturday (6): 10am - 2pm
  {
    dayOfWeek: 6,
    openTime: "10:00",
    closeTime: "14:00",
    isClosed: false,
  },
];

async function upsertUserWithCredentialAccount({
  email,
  name,
  password,
  role,
  emailVerified = true,
}: {
  email: string;
  name: string;
  password: string;
  role: string;
  emailVerified?: boolean;
}) {
  const hashedPassword = await hashPassword(password);

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    user = await prisma.user.update({
      where: { email },
      data: {
        name,
        role,
        emailVerified,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        emailVerified,
      },
    });
  }

  // Find or create the credential account for Better Auth
  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
    },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        accountId: user.id,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashedPassword,
      },
    });
  }

  return user;
}

async function main() {
  console.log("🌱 Starting Slotly database seed...\n");

  // 1. Seed Business Hours
  console.log("⏳ Seeding business hours...");
  for (const hours of BUSINESS_HOURS_DATA) {
    await prisma.businessHours.upsert({
      where: { dayOfWeek: hours.dayOfWeek },
      update: {
        openTime: hours.openTime,
        closeTime: hours.closeTime,
        isClosed: hours.isClosed,
      },
      create: {
        dayOfWeek: hours.dayOfWeek,
        openTime: hours.openTime,
        closeTime: hours.closeTime,
        isClosed: hours.isClosed,
      },
    });
  }
  console.log(`✅ Business hours configured (Mon-Fri 9am-5pm, Sat 10am-2pm, Sun closed).`);

  // 2. Seed Services
  console.log("\n⏳ Seeding professional services...");
  const seededServices: Record<string, { id: string; name: string; durationMinutes: number }> = {};

  for (const service of SERVICES_DATA) {
    const record = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        currency: service.currency,
        isActive: service.isActive,
      },
      create: {
        name: service.name,
        slug: service.slug,
        description: service.description,
        durationMinutes: service.durationMinutes,
        price: service.price,
        currency: service.currency,
        isActive: service.isActive,
      },
    });
    seededServices[service.slug] = {
      id: record.id,
      name: record.name,
      durationMinutes: record.durationMinutes,
    };
    console.log(`   - ${service.name} (${service.durationMinutes} min, $${service.price})`);
  }
  console.log(`✅ Seeded ${Object.keys(seededServices).length} professional services.`);

  // 3. Seed Admin Account
  const adminEmail = process.env.ADMIN_SETUP_EMAIL || "admin@slotly.com";
  const adminPassword = process.env.ADMIN_SETUP_PASSWORD || "Admin1234!";

  console.log(`\n⏳ Seeding admin account (${adminEmail})...`);
  const adminUser = await upsertUserWithCredentialAccount({
    email: adminEmail,
    name: "Admin",
    password: adminPassword,
    role: "admin",
    emailVerified: true,
  });
  console.log(`✅ Admin account configured: ${adminUser.email} (id: ${adminUser.id})`);

  // 4. Seed Demo Customer Account
  const demoEmail = "demo@slotly.com";
  const demoPassword = "Demo1234!";

  console.log(`\n⏳ Seeding demo customer account (${demoEmail})...`);
  const demoUser = await upsertUserWithCredentialAccount({
    email: demoEmail,
    name: "Demo User",
    password: demoPassword,
    role: "user",
    emailVerified: true,
  });
  console.log(`✅ Demo customer configured: ${demoUser.email} (id: ${demoUser.id})`);

  // 5. Seed Sample Bookings for Demo User
  console.log("\n⏳ Seeding sample bookings for demo user...");

  const now = new Date();
  // Helper to set specific hours/minutes on a date
  const createDate = (daysOffset: number, hours: number, minutes: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const sampleBookings = [
    // 1. Completed Booking (7 days ago)
    {
      serviceSlug: "business-strategy-consultation",
      scheduledAt: createDate(-7, 10, 0),
      durationMinutes: 60,
      status: BookingStatus.COMPLETED,
      notes: "Initial strategic advisory session on Q1 market expansion and SaaS pricing model.",
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
    },
    // 2. Confirmed Booking (2 days ahead at 2:00 PM)
    {
      serviceSlug: "web-design-review",
      scheduledAt: createDate(2, 14, 0),
      durationMinutes: 45,
      status: BookingStatus.CONFIRMED,
      notes: "Audit of mobile conversion funnels, landing page hierarchy, and checkout flow.",
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
    },
    // 3. Pending Booking (5 days ahead at 11:00 AM)
    {
      serviceSlug: "financial-planning-session",
      scheduledAt: createDate(5, 11, 0),
      durationMinutes: 90,
      status: BookingStatus.PENDING,
      notes: "Quarterly financial review, tax-advantaged retirement planning, and asset diversification.",
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
    },
    // 4. Cancelled Booking (3 days ago at 3:00 PM)
    {
      serviceSlug: "career-coaching",
      scheduledAt: createDate(-3, 15, 0),
      durationMinutes: 60,
      status: BookingStatus.CANCELLED,
      notes: "Executive career transition and executive board interview preparation.",
      cancelledAt: createDate(-4, 9, 30),
      cancelledBy: "customer",
      cancellationReason: "Rescheduled due to conflicting client on-site workshop.",
    },
  ];

  for (const booking of sampleBookings) {
    const service = seededServices[booking.serviceSlug];
    if (!service) continue;

    const endTime = new Date(booking.scheduledAt.getTime() + booking.durationMinutes * 60 * 1000);

    await prisma.booking.upsert({
      where: {
        unique_service_time_slot: {
          serviceId: service.id,
          scheduledAt: booking.scheduledAt,
        },
      },
      update: {
        userId: demoUser.id,
        endTime,
        status: booking.status,
        notes: booking.notes,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
      },
      create: {
        userId: demoUser.id,
        serviceId: service.id,
        scheduledAt: booking.scheduledAt,
        endTime,
        status: booking.status,
        notes: booking.notes,
        cancelledAt: booking.cancelledAt,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason,
      },
    });

    console.log(
      `   - [${booking.status}] ${service.name} @ ${booking.scheduledAt.toLocaleDateString()} ${booking.scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    );
  }

  console.log(`✅ Seeded ${sampleBookings.length} sample bookings with varied statuses.`);

  console.log("\n========================================================");
  console.log("🎉 Slotly database seeding completed successfully!");
  console.log("========================================================");
  console.log(`Demo Customer: ${demoEmail} / ${demoPassword}`);
  console.log(`Admin Account: ${adminEmail} / ${adminPassword}`);
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
