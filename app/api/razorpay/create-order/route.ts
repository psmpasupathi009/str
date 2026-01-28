import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";

/**
 * Create Razorpay Order API
 * Following Razorpay best practices:
 * - Orders API prevents duplicate payments
 * - Server-side order creation for security
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      userId, 
      shippingAddress 
    } = body;

    // Validation
    if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
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

    // Validate and normalize items
    const normalizedItems = items.map((item: any) => ({
      productId: String(item.productId || ""),
      productName: String(item.productName || ""),
      quantity: Number(item.quantity) || 1,
      price: Number(Number(item.price).toFixed(2)),
    }));

    // Validate normalized items
    for (const item of normalizedItems) {
      if (!item.productId || !item.productName || item.price <= 0 || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid item data. Each item must have valid productId, productName, price, and quantity." },
          { status: 400 }
        );
      }
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    // Ensure amount is properly rounded to 2 decimal places first
    const roundedAmount = Math.round(amount * 100) / 100;
    const amountInPaise = Math.round(roundedAmount * 100);

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerName: customerName || "",
        customerEmail: customerEmail || "",
        userId: userId || "",
        orderData: JSON.stringify({
          amount: roundedAmount,
          items: normalizedItems,
          customerName,
          customerEmail,
          customerPhone,
          userId,
          shippingAddress,
        }),
      },
    });

    // Get Razorpay key for client-side
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return NextResponse.json(
        { error: "Razorpay key not configured" },
        { status: 500 }
      );
    }

    // Return order details (NO database order created yet)
    // Order created in DB only after successful payment verification
    return NextResponse.json(
      {
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: keyId,
        orderData: {
          amount: roundedAmount,
          items: normalizedItems,
          customerName,
          customerEmail,
          customerPhone,
          userId,
          shippingAddress,
        },
      },
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }
      }
    );
  } catch (error: any) {
    console.error("[API] Create order error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to create order" 
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
