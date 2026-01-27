import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, createErrorResponse, createSuccessResponse, handleApiError } from "@/lib/auth-utils";
import type { Prisma } from "@prisma/client";

// GET /api/gallery/[id] - Get a single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const galleryItem = await (prisma as any).gallery.findUnique({
      where: { id },
    });

    if (!galleryItem) {
      return createErrorResponse("Gallery item not found", 404);
    }

    return createSuccessResponse({ galleryItem });
  } catch (error) {
    return handleApiError(error, "Failed to fetch gallery item");
  }
}

// PUT /api/gallery/[id] - Update a gallery item (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);

    const { id } = await params;
    const body = await request.json();

    // Check if gallery item exists
    const existingItem = await (prisma as any).gallery.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return createErrorResponse("Gallery item not found", 404);
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.url !== undefined) updateData.url = String(body.url).trim();
    if (body.type !== undefined) {
      if (body.type !== "IMAGE" && body.type !== "VIDEO") {
        return createErrorResponse("Type must be either IMAGE or VIDEO", 400);
      }
      updateData.type = body.type as "IMAGE" | "VIDEO";
    }
    if (body.title !== undefined) updateData.title = body.title?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.order !== undefined) updateData.order = Number(body.order);

    const galleryItem = await (prisma as any).gallery.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse(
      { galleryItem },
      "Gallery item updated successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to update gallery item");
  }
}

// DELETE /api/gallery/[id] - Delete a gallery item (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);

    const { id } = await params;

    // Check if gallery item exists
    const galleryItem = await (prisma as any).gallery.findUnique({
      where: { id },
    });

    if (!galleryItem) {
      return createErrorResponse("Gallery item not found", 404);
    }

    await (prisma as any).gallery.delete({
      where: { id },
    });

    return createSuccessResponse(
      {},
      "Gallery item deleted successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to delete gallery item");
  }
}
