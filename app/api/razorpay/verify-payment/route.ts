import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { calculateGSTBreakdown, generateInvoiceNumber, companyInfo } from "@/lib/company-info";

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

    // Step 3.1: Fetch product details to get GST rates and HSN codes
    const productIds = items.map((item: any) => item.productId).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    // Step 3.2: Calculate GST breakdown for each item and total
    let subtotal = 0;
    let totalGST = 0;
    const shippingState = shippingAddress?.state || companyInfo.address.state;
    
    const orderItemsWithGST = items.map((item: any) => {
      const product = productMap.get(item.productId);
      const gstRate = product?.gst || 0.05; // Default 5% GST
      const itemSubtotal = (item.price || 0) * (item.quantity || 1);
      const itemGST = itemSubtotal * gstRate;
      
      subtotal += itemSubtotal;
      totalGST += itemGST;

      return {
        productId: item.productId || "",
        productName: item.productName || "",
        hsnCode: product?.hsnCode || "",
        quantity: item.quantity || 1,
        price: item.price || 0,
        gstRate: gstRate,
        gstAmount: Math.round(itemGST * 100) / 100,
        totalPrice: Math.round((itemSubtotal + itemGST) * 100) / 100,
      };
    });

    // Calculate CGST/SGST/IGST breakdown
    const gstBreakdown = calculateGSTBreakdown(subtotal, totalGST / subtotal, shippingState);
    
    // Round amounts
    subtotal = Math.round(subtotal * 100) / 100;
    totalGST = Math.round(totalGST * 100) / 100;
    
    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

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
          // Update GST information if not already set
          ...(existingOrder.subtotal === null && {
            subtotal,
            gstAmount: totalGST,
            cgstAmount: gstBreakdown.cgst,
            sgstAmount: gstBreakdown.sgst,
            igstAmount: gstBreakdown.igst,
            invoiceNumber: existingOrder.invoiceNumber || invoiceNumber,
          }),
        },
        include: { items: true },
      });
    } else {
      // Create new order with GST breakdown
      order = await prisma.order.create({
        data: {
          userId: userId || null,
          razorpayOrderId,
          razorpayPaymentId,
          invoiceNumber,
          amount, // Total amount including GST
          subtotal, // Amount before GST
          gstAmount: totalGST, // Total GST
          cgstAmount: gstBreakdown.cgst,
          sgstAmount: gstBreakdown.sgst,
          igstAmount: gstBreakdown.igst,
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
            create: orderItemsWithGST.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              hsnCode: item.hsnCode,
              quantity: item.quantity,
              price: item.price, // Price per unit before GST
              gstRate: item.gstRate,
              gstAmount: item.gstAmount,
              totalPrice: item.totalPrice, // Total including GST
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
