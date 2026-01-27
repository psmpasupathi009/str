import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { amount, items, customerName, customerEmail, customerPhone, userId, shippingAddress } = await request.json();

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
    // Amount is already in INR, so just multiply by 100 to convert to paise
    const amountInPaise = Math.round(amount * 100);
    
    // Validate amount doesn't exceed Razorpay's maximum (typically 99,99,999 paise = ₹9,99,999.99)
    const MAX_AMOUNT_PAISE = 99999999; // ₹9,99,999.99
    if (amountInPaise > MAX_AMOUNT_PAISE) {
      return NextResponse.json(
        { error: `Amount exceeds maximum allowed. Maximum amount is ₹${(MAX_AMOUNT_PAISE / 100).toLocaleString('en-IN')}` },
        { status: 400 }
      );
    }
    
    // Validate minimum amount (Razorpay minimum is typically 1 paise = ₹0.01)
    if (amountInPaise < 1) {
      return NextResponse.json(
        { error: "Amount must be at least ₹0.01" },
        { status: 400 }
      );
    }

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
        shippingAddress: shippingAddress ? {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        } : null,
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
