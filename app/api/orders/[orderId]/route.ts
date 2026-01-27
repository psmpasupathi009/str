import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/[orderId] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { orderId } = resolvedParams;

    if (!orderId || orderId.trim() === "") {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Helper function to check if string is a valid MongoDB ObjectID (24 hex characters)
    const isValidObjectId = (id: string): boolean => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    let order = null;

    // Strategy 1: If it's a valid ObjectID, try direct lookup
    if (isValidObjectId(orderId)) {
      try {
        order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });
      } catch (err) {
        // Ignore errors, continue to next strategy
      }
    }

    // Strategy 2: If not found and it's 8 characters, try to find by last 8 chars
    if (!order && orderId.length === 8) {
      try {
        const allOrders = await prisma.order.findMany({
          include: { items: true },
        });

        order =
          allOrders.find(
            (o) => o.id.slice(-8).toUpperCase() === orderId.toUpperCase()
          ) || null;
      } catch (err) {
        // Ignore errors
      }
    }

    // Strategy 3: Try searching by razorpayOrderId
    if (!order) {
      try {
        order = await prisma.order.findUnique({
          where: { razorpayOrderId: orderId },
          include: { items: true },
        });
      } catch (err) {
        // Ignore errors
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Get order error:", error);
    
    // Check if it's a MongoDB ObjectID format error
    if (error.code === "P2023" || error.message?.includes("Malformed ObjectID")) {
      return NextResponse.json(
        { error: "Invalid order ID format. Please use the full order ID or the last 8 characters of your order ID." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
