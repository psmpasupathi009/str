import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@prisma/client";

// GET /api/admin/orders/stats - Get order statistics (admin only)
export async function GET(request: NextRequest) {
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

    // Get statistics
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: OrderStatus.PENDING } }),
      prisma.order.count({ where: { orderStatus: OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { orderStatus: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { orderStatus: OrderStatus.CANCELLED } }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          paymentStatus: PaymentStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json(
      {
        stats: {
          totalOrders,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: totalRevenue._sum.amount || 0,
          todayOrders,
          todayRevenue: todayRevenue._sum.amount || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
