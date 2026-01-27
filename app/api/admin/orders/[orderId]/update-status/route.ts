import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// PATCH /api/admin/orders/[orderId]/update-status - Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
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

    // Handle both Promise and direct params (Next.js 16 compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { orderId } = resolvedParams;
    const { status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
      include: { items: true },
    });

    return NextResponse.json(
      { message: "Order status updated successfully", order },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
