import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// POST /api/orders/[orderId]/confirm-delivery - User confirms order delivery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    // Handle both Promise and direct params (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { orderId } = resolvedParams;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow confirmation if order is SHIPPED
    if (order.orderStatus !== OrderStatus.SHIPPED) {
      return NextResponse.json(
        { error: `Cannot confirm delivery. Order status is ${order.orderStatus}. Order must be SHIPPED to confirm delivery.` },
        { status: 400 }
      );
    }

    // Update order status to DELIVERED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        orderStatus: OrderStatus.DELIVERED,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    return NextResponse.json(
      { 
        message: "Order delivery confirmed successfully", 
        order: updatedOrder 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Confirm delivery error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm delivery" },
      { status: 500 }
    );
  }
}
