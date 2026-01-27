import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      orderData 
    } = await request.json();

    // Validation
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Payment details are required" },
        { status: 400 }
      );
    }

    if (!orderData) {
      return NextResponse.json(
        { error: "Order data is required" },
        { status: 400 }
      );
    }

    // Verify payment FIRST before creating order in database
    const verification = await verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!verification.isValid) {
      // Payment failed - do NOT create order in database
      return NextResponse.json(
        { error: verification.error || "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment verified successfully - NOW create order in database
    const { amount, items, customerName, customerEmail, customerPhone, userId, shippingAddress } = orderData;

    // Check if order already exists (prevent duplicate creation)
    const existingOrder = await prisma.order.findUnique({
      where: { razorpayOrderId },
    });

    let order;
    if (existingOrder) {
      // Order already exists, update it
      order = await prisma.order.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId: razorpayPaymentId,
          paymentStatus: PaymentStatus.COMPLETED,
          orderStatus: OrderStatus.PROCESSING,
        },
        include: { items: true },
      });
    } else {
      // Create new order in database ONLY after successful payment
      order = await prisma.order.create({
        data: {
          userId: userId || null,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
          amount: amount,
          currency: "INR",
          paymentStatus: PaymentStatus.COMPLETED, // Payment is already verified
          orderStatus: OrderStatus.PROCESSING, // Order is placed and ready to process
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
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified and order created successfully",
        paymentId: razorpayPaymentId,
        orderId: order.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
