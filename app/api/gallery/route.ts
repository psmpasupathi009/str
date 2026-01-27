import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, createErrorResponse, createSuccessResponse, handleApiError } from "@/lib/auth-utils";
import type { Prisma } from "@prisma/client";

// GET /api/gallery - Get all gallery items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "IMAGE" or "VIDEO"

    const where: any = {};
    if (type === "IMAGE" || type === "VIDEO") {
      where.type = type as "IMAGE" | "VIDEO";
    }

    const galleryItems = await (prisma as any).gallery.findMany({
      where,
      orderBy: {
        order: "asc",
      },
    });

    return createSuccessResponse({ gallery: galleryItems });
  } catch (error) {
    return handleApiError(error, "Failed to fetch gallery");
  }
}

// POST /api/gallery - Create a new gallery item (admin only)
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const { url, type, title, description, order } = body;

    // Validation
    if (!url || !type) {
      return createErrorResponse("URL and type are required", 400);
    }

    if (type !== "IMAGE" && type !== "VIDEO") {
      return createErrorResponse("Type must be either IMAGE or VIDEO", 400);
    }

    // Get max order value
    const maxOrder = await (prisma as any).gallery.aggregate({
      _max: { order: true },
    });

    const galleryItem = await (prisma as any).gallery.create({
      data: {
        url: url.trim(),
        type: type as "IMAGE" | "VIDEO",
        title: title?.trim() || null,
        description: description?.trim() || null,
        order: order !== undefined ? Number(order) : (maxOrder._max.order ?? -1) + 1,
      },
    });

    return createSuccessResponse(
      { galleryItem },
      "Gallery item created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error, "Failed to create gallery item");
  }
}
