import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, createErrorResponse, createSuccessResponse, handleApiError } from "@/lib/auth-utils";
import type { Prisma } from "@prisma/client";

// GET /api/products - Get all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("category");
    const featured = searchParams.get("featured");
    const bestSeller = searchParams.get("bestSeller");
    const inStock = searchParams.get("inStock");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));
    const skip = (page - 1) * limit;

    // Build where clause with proper typing
    const where: Prisma.ProductWhereInput = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (categoryName) {
      where.category = {
        name: {
          contains: categoryName,
          mode: "insensitive",
        },
      };
    }
    
    if (featured === "true") {
      where.featured = true;
    }
    
    if (bestSeller === "true") {
      where.bestSeller = true;
    }
    
    if (inStock === "true") {
      where.inStock = true;
    } else if (inStock === "false") {
      where.inStock = false;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { itemCode: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return createSuccessResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch products");
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    requireAdmin(request);

    const body = await request.json();
    const {
      name,
      categoryId,
      itemCode,
      weight,
      mrp,
      salePrice,
      gst = 0.05,
      hsnCode,
      image,
      images = [],
      description,
      featured = false,
      bestSeller = false,
      inStock = true,
    } = body;

    // Validation
    if (!name || !categoryId || !itemCode || !weight || mrp === undefined || salePrice === undefined || !hsnCode) {
      return createErrorResponse(
        "Missing required fields: name, categoryId, itemCode, weight, mrp, salePrice, hsnCode",
        400
      );
    }

    // Validate numeric values
    if (typeof mrp !== "number" || mrp < 0 || typeof salePrice !== "number" || salePrice < 0) {
      return createErrorResponse("MRP and sale price must be valid positive numbers", 400);
    }

    // Check if item code already exists
    const existingProduct = await prisma.product.findUnique({
      where: { itemCode },
    });

    if (existingProduct) {
      return createErrorResponse("Product with this item code already exists", 400);
    }

    // Verify category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return createErrorResponse("Category not found", 404);
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        categoryId,
        itemCode: itemCode.trim(),
        weight: weight.trim(),
        mrp,
        salePrice,
        gst: Math.max(0, Math.min(1, gst)), // Clamp between 0 and 1
        hsnCode: String(hsnCode).trim(),
        image: image?.trim() || null,
        images: Array.isArray(images) ? images.filter((img): img is string => typeof img === "string" && img.trim().length > 0) : [],
        description: description?.trim() || null,
        featured: Boolean(featured),
        bestSeller: Boolean(bestSeller),
        inStock: Boolean(inStock),
      },
      include: {
        category: true,
      },
    });

    return createSuccessResponse(
      { product },
      "Product created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error, "Failed to create product");
  }
}
