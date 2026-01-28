import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

/**
 * Verify Payment and Create Order API
 * Following Razorpay best practices:
 * - Signature verification (MANDATORY)
 * - Status verification (captured/authorized)
 * - Create order only after successful verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature, 
      orderData 
    } = body;

    // Validation
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Payment details are required" },
        { status: 400 }
      );
    }

    if (!orderData || typeof orderData !== "object") {
      return NextResponse.json(
        { success: false, error: "Order data is required" },
        { status: 400 }
      );
    }

    // Step 1: Verify payment (signature + status)
    const verification = await verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!verification.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: verification.error || "Payment verification failed" 
        },
        { status: 400 }
      );
    }

    // Step 2: Check if order already exists (prevent duplicates)
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { razorpayOrderId },
          { razorpayPaymentId },
        ],
      },
    });

    // If order exists and is already completed, return success
    if (existingOrder && existingOrder.paymentStatus === PaymentStatus.COMPLETED) {
      return NextResponse.json(
        {
          success: true,
          message: "Payment already verified",
          paymentId: razorpayPaymentId,
          orderId: existingOrder.id,
        },
        { status: 200 }
      );
    }

    // Step 3: Extract order data
    const { amount, items, customerName, customerEmail, customerPhone, userId, shippingAddress } = orderData;

    // Validate order data
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order items are required" },
        { status: 400 }
      );
    }

    // Step 4: Create or update order in database
    let order;
    if (existingOrder) {
      // Update existing order
      order = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          razorpayPaymentId,
          paymentStatus: PaymentStatus.COMPLETED,
          orderStatus: OrderStatus.PROCESSING,
        },
        include: { items: true },
      });
    } else {
      // Create new order
      order = await prisma.order.create({
        data: {
          userId: userId || null,
          razorpayOrderId,
          razorpayPaymentId,
          amount,
          currency: "INR",
          paymentStatus: PaymentStatus.COMPLETED,
          orderStatus: OrderStatus.PROCESSING,
          customerName: customerName || null,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          shippingAddress: shippingAddress ? {
            fullName: shippingAddress.fullName || "",
            email: shippingAddress.email || "",
            phone: shippingAddress.phone || "",
            addressLine1: shippingAddress.addressLine1 || "",
            addressLine2: shippingAddress.addressLine2 || "",
            city: shippingAddress.city || "",
            state: shippingAddress.state || "",
            zipCode: shippingAddress.zipCode || "",
            country: shippingAddress.country || "India",
          } : null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId || "",
              productName: item.productName || "",
              quantity: item.quantity || 1,
              price: item.price || 0,
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
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  } catch (error: any) {
    console.error("[API] Verify payment error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to verify payment" 
      },
      { 
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  }
}
