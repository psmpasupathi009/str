import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gallery - Get all gallery items (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // "IMAGE" or "VIDEO"

    const where: any = {};
    if (type === "IMAGE" || type === "VIDEO") {
      where.type = type as "IMAGE" | "VIDEO";
    }

    // Access gallery model - try multiple ways to access it
    let galleryModel = (prisma as any).gallery;
    if (!galleryModel) {
      galleryModel = (prisma as any).Gallery;
    }
    if (!galleryModel) {
      // Try to find it by checking all Prisma models
      const prismaKeys = Object.keys(prisma).filter(
        k => !k.startsWith('_') && 
        !k.startsWith('$') && 
        typeof (prisma as any)[k] === 'object' &&
        (prisma as any)[k]?.findMany
      );
      console.error("Gallery model not found. Available Prisma models:", prismaKeys);
      
      // Return empty array instead of error so page doesn't break
      return NextResponse.json(
        { 
          gallery: [],
          error: "Gallery model not found. Please run 'npx prisma generate' and restart the server."
        },
        { status: 200 }
      );
    }

    let galleryItems;
    try {
      // Fetch from database
      galleryItems = await galleryModel.findMany({
        where,
        orderBy: {
          order: "asc",
        },
      });
      
      console.log(`Raw gallery items from DB:`, galleryItems?.length || 0);
      
      // Ensure all items have required fields and normalize data
      galleryItems = (galleryItems || [])
        .map((item: any) => {
          // Handle MongoDB ObjectId format
          const id = item.id || item._id?.toString() || String(item._id) || '';
          const url = item.url || '';
          
          if (!id || !url) {
            console.warn("Skipping invalid gallery item:", item);
            return null;
          }
          
          return {
            id: String(id),
            url: String(url),
            type: (item.type === "IMAGE" || item.type === "VIDEO") ? item.type : "IMAGE",
            title: item.title || null,
            description: item.description || null,
            order: typeof item.order === 'number' ? item.order : (item.order ? parseInt(String(item.order)) : 0),
          };
        })
        .filter((item: any) => item !== null && item.id && item.url); // Filter out invalid items
      
      console.log(`Processed ${galleryItems.length} valid gallery items`);
      
      // Sort by order
      galleryItems.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      
    } catch (dbError: any) {
      console.error("Database error fetching gallery:", dbError);
      console.error("Error stack:", dbError.stack);
      return NextResponse.json(
        { 
          gallery: [],
          error: dbError.message || "Database error fetching gallery"
        },
        { status: 200 } // Return 200 with empty array so page doesn't break
      );
    }

    return NextResponse.json({ gallery: galleryItems || [] }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching gallery:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        gallery: [],
        error: error.message || "Failed to fetch gallery"
      },
      { status: 200 } // Return 200 with empty array so page doesn't break
    );
  }
}

// POST /api/gallery - Create a new gallery item (admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { url, type, title, description, order } = body;

    // Validation
    if (!url || !type) {
      return NextResponse.json(
        { error: "URL and type are required" },
        { status: 400 }
      );
    }

    if (type !== "IMAGE" && type !== "VIDEO") {
      return NextResponse.json(
        { error: "Type must be either IMAGE or VIDEO" },
        { status: 400 }
      );
    }

    // Access gallery model - handle both typed and untyped access
    const galleryModel = (prisma as any).gallery || (prisma as any).Gallery;
    if (!galleryModel) {
      throw new Error("Gallery model not found in Prisma client. Please run 'npx prisma generate'");
    }

    // Get max order value
    let maxOrderValue = -1;
    try {
      const maxOrder = await galleryModel.aggregate({
        _max: { order: true },
      });
      maxOrderValue = maxOrder._max?.order ?? -1;
    } catch (aggError) {
      // If no items exist yet, start from 0
      console.log("No existing gallery items, starting order from 0");
      maxOrderValue = -1;
    }

    const galleryItem = await galleryModel.create({
      data: {
        url: url.trim(),
        type: type as "IMAGE" | "VIDEO",
        title: title?.trim() || null,
        description: description?.trim() || null,
        order: order !== undefined ? Number(order) : maxOrderValue + 1,
      },
    });

    return NextResponse.json(
      { galleryItem, message: "Gallery item created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating gallery item:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: error.message || "Failed to create gallery item",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
