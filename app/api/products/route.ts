import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
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

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: "Missing required fields: name, categoryId, itemCode, weight, mrp, salePrice, hsnCode" },
        { status: 400 }
      );
    }

    // Check if item code already exists
    const existingProduct = await prisma.product.findUnique({
      where: { itemCode },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this item code already exists" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        itemCode,
        weight,
        mrp,
        salePrice,
        gst,
        hsnCode: String(hsnCode),
        image,
        images: Array.isArray(images) ? images : [],
        description,
        featured,
        bestSeller,
        inStock,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      { product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
