import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, createErrorResponse, createSuccessResponse, handleApiError } from "@/lib/auth-utils";
import type { Prisma } from "@prisma/client";

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error: any) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    requireAdmin(request);

    const { id } = await params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // If itemCode is being updated, check for duplicates
    if (body.itemCode && body.itemCode !== existingProduct.itemCode) {
      const duplicate = await prisma.product.findUnique({
        where: { itemCode: body.itemCode },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Product with this item code already exists" },
          { status: 400 }
        );
      }
    }

    // If categoryId is being updated, verify it exists
    if (body.categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    // Prepare update data with proper typing and validation
    const updateData: Prisma.ProductUpdateInput = {};
    
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.categoryId !== undefined) {
      updateData.category = {
        connect: { id: body.categoryId }
      };
    }
    if (body.itemCode !== undefined) updateData.itemCode = String(body.itemCode).trim();
    if (body.weight !== undefined) updateData.weight = String(body.weight).trim();
    if (body.mrp !== undefined) {
      if (typeof body.mrp !== "number" || body.mrp < 0) {
        return createErrorResponse("MRP must be a valid positive number", 400);
      }
      updateData.mrp = body.mrp;
    }
    if (body.salePrice !== undefined) {
      if (typeof body.salePrice !== "number" || body.salePrice < 0) {
        return createErrorResponse("Sale price must be a valid positive number", 400);
      }
      updateData.salePrice = body.salePrice;
    }
    if (body.gst !== undefined) {
      updateData.gst = Math.max(0, Math.min(1, Number(body.gst)));
    }
    if (body.hsnCode !== undefined) updateData.hsnCode = String(body.hsnCode).trim();
    if (body.image !== undefined) updateData.image = body.image?.trim() || null;
    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) 
        ? body.images.filter((img: any): img is string => typeof img === "string" && img.trim().length > 0)
        : [];
    }
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.bestSeller !== undefined) updateData.bestSeller = Boolean(body.bestSeller);
    if (body.inStock !== undefined) updateData.inStock = Boolean(body.inStock);

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    revalidateTag("storefront", "max");
    return createSuccessResponse(
      { product },
      "Product updated successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to update product");
  }
}

// DELETE /api/products/[id] - Delete a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user email from request headers
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    revalidateTag("storefront", "max");
    return createSuccessResponse(
      {},
      "Product deleted successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to delete product");
  }
}
