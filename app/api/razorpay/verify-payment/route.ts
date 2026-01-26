import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = await request.json();

    // Validation
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Payment details are required" },
        { status: 400 }
      );
    }

    // Verify payment
    const verification = await verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!verification.isValid) {
      // Update order status to failed
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });
      }

      return NextResponse.json(
        { error: verification.error || "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update order in database
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          razorpayPaymentId: razorpayPaymentId,
          paymentStatus: PaymentStatus.COMPLETED,
          orderStatus: OrderStatus.PROCESSING,
        },
      });
    } else {
      // Find order by razorpayOrderId if orderId not provided
      await prisma.order.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId: razorpayPaymentId,
          paymentStatus: PaymentStatus.COMPLETED,
          orderStatus: OrderStatus.PROCESSING,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpayPaymentId,
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
