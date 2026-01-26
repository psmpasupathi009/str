import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { amount, items, customerName, customerEmail, customerPhone, userId } = await request.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    // Assuming amount is in dollars, convert to INR paise
    // 1 USD = ~83 INR (adjust as needed)
    const USD_TO_INR = 83;
    const amountInPaise = Math.round(amount * USD_TO_INR * 100);

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerName: customerName || "",
        customerEmail: customerEmail || "",
        userId: userId || "",
      },
    });

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        razorpayOrderId: razorpayOrder.id,
        amount: amount,
        currency: "INR",
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity || 1,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
