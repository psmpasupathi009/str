import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// PUT /api/admin/orders/[orderId]/update-tracking - Update order tracking details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const userEmail = request.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const { orderId } = resolvedParams;
    const body = await request.json();

    const { orderStatus, shippedDate, trackingNumber, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Update order - Note: shippedDate, trackingNumber, notes are stored in shippingAddress JSON
    const updateData: any = {};
    if (orderStatus) {
      updateData.orderStatus = orderStatus as OrderStatus;
    }
    
    // Get existing order to preserve shippingAddress
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (existingOrder) {
      const shippingAddress = (existingOrder.shippingAddress as any) || {};
      
      if (shippedDate) {
        shippingAddress.shippedDate = new Date(shippedDate).toISOString();
      }
      if (trackingNumber) {
        shippingAddress.trackingNumber = trackingNumber;
      }
      if (notes) {
        shippingAddress.notes = notes;
      }
      
      updateData.shippingAddress = shippingAddress;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Update tracking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tracking" },
      { status: 500 }
    );
  }
}
