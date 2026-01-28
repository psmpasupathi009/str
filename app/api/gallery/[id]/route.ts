import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gallery/[id] - Get a single gallery item (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Access gallery model - handle both typed and untyped access
    const galleryModel = (prisma as any).gallery || (prisma as any).Gallery;
    if (!galleryModel) {
      throw new Error("Gallery model not found in Prisma client. Please run 'npx prisma generate'");
    }

    const galleryItem = await galleryModel.findUnique({
      where: { id },
    });

    if (!galleryItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ galleryItem }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching gallery item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch gallery item" },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/[id] - Update a gallery item (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (same pattern as admin/orders)
    const userEmail = request.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Access gallery model - handle both typed and untyped access
    const galleryModel = (prisma as any).gallery || (prisma as any).Gallery;
    if (!galleryModel) {
      throw new Error("Gallery model not found in Prisma client. Please run 'npx prisma generate'");
    }

    // Check if gallery item exists
    let existingItem;
    try {
      existingItem = await galleryModel.findUnique({
        where: { id },
      });
    } catch (dbError: any) {
      console.error("Database error finding gallery item:", dbError);
      return NextResponse.json(
        { error: "Database error while finding gallery item", details: process.env.NODE_ENV === 'development' ? dbError.message : undefined },
        { status: 500 }
      );
    }

    if (!existingItem) {
      console.warn(`Gallery item not found: ${id}`);
      return NextResponse.json(
        { error: `Gallery item with ID ${id} not found. It may have been deleted.` },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.url !== undefined) updateData.url = String(body.url).trim();
    if (body.type !== undefined) {
      if (body.type !== "IMAGE" && body.type !== "VIDEO") {
        return NextResponse.json(
          { error: "Type must be either IMAGE or VIDEO" },
          { status: 400 }
        );
      }
      updateData.type = body.type as "IMAGE" | "VIDEO";
    }
    if (body.title !== undefined) updateData.title = body.title?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.order !== undefined) updateData.order = Number(body.order);

    let galleryItem;
    try {
      galleryItem = await galleryModel.update({
        where: { id },
        data: updateData,
      });
    } catch (updateError: any) {
      console.error("Error updating gallery item:", updateError);
      // Check if it's a "record not found" error
      if (updateError.code === 'P2025' || updateError.message?.includes('not found')) {
        return NextResponse.json(
          { error: `Gallery item with ID ${id} not found. It may have been deleted.` },
          { status: 404 }
        );
      }
      throw updateError;
    }

    return NextResponse.json(
      { galleryItem, message: "Gallery item updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/[id] - Delete a gallery item (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (same pattern as admin/orders)
    const userEmail = request.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Access gallery model - handle both typed and untyped access
    const galleryModel = (prisma as any).gallery || (prisma as any).Gallery;
    if (!galleryModel) {
      throw new Error("Gallery model not found in Prisma client. Please run 'npx prisma generate'");
    }

    // Check if gallery item exists
    const galleryItem = await galleryModel.findUnique({
      where: { id },
    });

    if (!galleryItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    await galleryModel.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Gallery item deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting gallery item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
