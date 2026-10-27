import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createServiceSchema } from "@/lib/validations/service";
import { Prisma } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug || "service";
  let counter = 1;

  while (true) {
    const existing = await prisma.service.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET: List all services (with pagination & search)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const activeFilter = searchParams.get("isActive");

    const where: Prisma.ServiceWhereInput = {};

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (activeFilter !== null && activeFilter !== undefined && activeFilter !== "") {
      where.isActive = activeFilter === "true";
    }

    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { bookings: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      services: services.map((s: (typeof services)[number]) => ({
        ...s,
        price: Number(s.price),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin Services GET API] Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to retrieve services." },
      { status: 500 }
    );
  }
}

// POST: Create new service
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate body with Zod schema
    const validationResult = createServiceSchema.safeParse(body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: issues[0] || "Invalid service data.", details: issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate or format slug
    const rawSlug = data.slug && data.slug.trim().length > 0
      ? slugify(data.slug)
      : slugify(data.name);

    const uniqueSlug = await getUniqueSlug(rawSlug);

    // Create service in database
    const newService = await prisma.service.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        durationMinutes: data.durationMinutes,
        price: data.price,
        currency: data.currency || "USD",
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        service: {
          ...newService,
          price: Number(newService.price),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin Services POST API] Error creating service:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the service.",
      },
      { status: 500 }
    );
  }
}
