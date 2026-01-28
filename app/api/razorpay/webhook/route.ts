import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature, verifyPaymentStatus } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import * as crypto from "crypto";

/**
 * Razorpay Webhook Handler
 * Following Razorpay best practices:
 * - Handle duplicate webhook events (idempotency)
 * - Verify webhook signature
 * - Respond with 2xx status for successful processing
 * - Handle payment.captured, payment.failed, order.paid events
 */
// Disable body parsing for webhook to get raw body
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const webhookSignature = request.headers.get("x-razorpay-signature");
    const webhookEventId = request.headers.get("x-razorpay-event-id");

    if (!webhookSignature) {
      console.error("[Webhook] Missing signature");
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!webhookSecret) {
      console.error("[Webhook] Webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    let isValidSignature = false;
    try {
      isValidSignature = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(webhookSignature, "utf8")
      );
    } catch {
      // Fallback comparison
      isValidSignature = expectedSignature === webhookSignature;
    }

    if (!isValidSignature) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;
    const order = payload.payload?.order?.entity;

    console.log(`[Webhook] Received event: ${event} (ID: ${webhookEventId})`);

    // Handle duplicate events (idempotency check)
    if (webhookEventId) {
      // Check if we've already processed this event
      // In production, you might want to store event IDs in a database
      // For now, we'll process and let Razorpay handle retries
    }

    // Handle different event types
    switch (event) {
      case "payment.captured":
      case "order.paid":
        if (payment && order) {
          await handlePaymentSuccess(payment, order);
        }
        break;

      case "payment.failed":
        if (payment) {
          await handlePaymentFailure(payment);
        }
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event}`);
    }

    // Always return 200 to acknowledge receipt (Razorpay best practice)
    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    
    // Return 200 even on error to prevent Razorpay retries for malformed requests
    // But log the error for investigation
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 200 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(payment: any, order: any) {
  try {
    const razorpayOrderId = order.id;
    const razorpayPaymentId = payment.id;

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { razorpayOrderId },
          { razorpayPaymentId },
        ],
      },
    });

    if (existingOrder) {
      // Update existing order if payment status changed
      if (existingOrder.paymentStatus !== PaymentStatus.COMPLETED) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            razorpayPaymentId,
            paymentStatus: PaymentStatus.COMPLETED,
            orderStatus: OrderStatus.PROCESSING,
          },
        });
        console.log(`[Webhook] Updated order: ${existingOrder.id}`);
      }
    } else {
      // Try to extract order data from Razorpay order notes
      const orderNotes = order.notes || {};
      const orderDataStr = orderNotes.orderData;

      if (orderDataStr) {
        try {
          const orderData = JSON.parse(orderDataStr);
          const { amount, items, customerName, customerEmail, customerPhone, userId, shippingAddress } = orderData;

          // Create order in database
          await prisma.order.create({
            data: {
              userId: userId || null,
              razorpayOrderId,
              razorpayPaymentId,
              amount: amount || payment.amount / 100, // Convert from paise
              currency: payment.currency || "INR",
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
                create: (items || []).map((item: any) => ({
                  productId: item.productId || "",
                  productName: item.productName || "",
                  quantity: item.quantity || 1,
                  price: item.price || 0,
                })),
              },
            },
          });
          console.log(`[Webhook] Created order from webhook: ${razorpayOrderId}`);
        } catch (parseError) {
          console.error("[Webhook] Failed to parse order data:", parseError);
        }
      }
    }
  } catch (error: any) {
    console.error("[Webhook] Error handling payment success:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(payment: any) {
  try {
    const razorpayPaymentId = payment.id;
    const razorpayOrderId = payment.order_id;

    // Update order status if exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { razorpayOrderId },
          { razorpayPaymentId },
        ],
      },
    });

    if (existingOrder) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });
      console.log(`[Webhook] Updated order to failed: ${existingOrder.id}`);
    }
  } catch (error: any) {
    console.error("[Webhook] Error handling payment failure:", error);
  }
}
