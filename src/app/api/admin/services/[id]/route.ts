import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { updateServiceSchema } from "@/lib/validations/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// PATCH: Update an existing service
export async function PATCH(request: Request, context: RouteContext) {
  try {
    // 1. Verify admin privileges
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing service ID parameter." },
        { status: 400 }
      );
    }

    // 2. Verify service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    // 3. Parse and validate payload
    const body = await request.json();
    const validationResult = updateServiceSchema.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((i) => i.message);
      return NextResponse.json(
        { error: issues[0] || "Invalid update payload.", details: issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 4. Handle slug validation if changed
    let formattedSlug = existingService.slug;
    if (data.slug && data.slug.trim().length > 0) {
      formattedSlug = slugify(data.slug);
      if (formattedSlug !== existingService.slug) {
        const slugConflict = await prisma.service.findFirst({
          where: {
            slug: formattedSlug,
            NOT: { id },
          },
        });

        if (slugConflict) {
          return NextResponse.json(
            { error: "A service with this URL slug already exists. Please choose a different slug." },
            { status: 400 }
          );
        }
      }
    }

    // 5. Update service in database
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        slug: formattedSlug,
        description: data.description !== undefined ? data.description : undefined,
        durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : undefined,
        price: data.price !== undefined ? data.price : undefined,
        currency: data.currency !== undefined ? data.currency : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      service: {
        ...updatedService,
        price: Number(updatedService.price),
      },
    });
  } catch (error) {
    console.error("[Admin Service Update API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the service.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete (if bookings exist) or hard delete (if no bookings)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    // 1. Verify admin privileges
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing service ID parameter." },
        { status: 400 }
      );
    }

    // 2. Check service existence
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    const bookingCount = service._count?.bookings || 0;

    // 3. Conditional delete based on booking presence
    if (bookingCount > 0) {
      // Soft delete: Deactivate service so old bookings preserve reference integrity
      const deactivatedService = await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: `Service has ${bookingCount} existing booking(s). It has been deactivated (soft-deleted) to protect customer records.`,
        softDeleted: true,
        service: {
          ...deactivatedService,
          price: Number(deactivatedService.price),
        },
      });
    } else {
      // Hard delete: No bookings exist for this service
      await prisma.service.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: `Service "${service.name}" was permanently deleted.`,
        softDeleted: false,
      });
    }
  } catch (error) {
    console.error("[Admin Service Delete API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting the service.",
      },
      { status: 500 }
    );
  }
}
