import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/track?orderId=xxx - Track order by order ID only
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId || orderId.trim() === "") {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const searchValue = orderId.trim();
    let order = null;

    // Helper function to check if string is a valid MongoDB ObjectID (24 hex characters)
    const isValidObjectId = (id: string): boolean => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Strategy 1: If it's a valid ObjectID (24 chars), try to find by full order ID
    if (isValidObjectId(searchValue)) {
      try {
        order = await prisma.order.findUnique({
          where: { id: searchValue },
          include: { items: true },
        });
      } catch (err) {
        // Ignore errors, continue to next strategy
      }
    }

    // Strategy 2: If it's a short ID (8 chars), try to find by matching last 8 characters
    if (!order && searchValue.length === 8) {
      try {
        const allOrders = await prisma.order.findMany({
          include: { items: true },
        });

        order = allOrders.find(
          (o) => o.id.slice(-8).toUpperCase() === searchValue.toUpperCase()
        ) || null;
      } catch (err) {
        // Ignore errors
      }
    }

    // Strategy 3: Try searching by razorpayOrderId as fallback
    if (!order) {
      try {
        order = await prisma.order.findUnique({
          where: { razorpayOrderId: searchValue },
          include: { items: true },
        });
      } catch (err) {
        // Ignore errors
      }
    }

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found. Please check your order ID. You can find your order ID in your order confirmation email or order history.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track order" },
      { status: 500 }
    );
  }
}
