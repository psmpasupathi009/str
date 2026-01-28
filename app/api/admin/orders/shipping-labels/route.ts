import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

// GET /api/admin/orders/shipping-labels - Generate PDF shipping labels
export async function GET(request: NextRequest) {
  try {
    // Verified by middleware (httpOnly session cookie)
    requireAdmin(request);

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") || "SHIPPED";

    // Build where clause
    const where: any = {
      orderStatus: status,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No orders found for the selected criteria" },
        { status: 404 }
      );
    }

    // Create PDF
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 150], // Standard shipping label size
    });

    orders.forEach((order, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      // Prisma Json type needs narrowing for TS
      const address = (order.shippingAddress as any) || {};
      const yStart = 10;
      let yPos = yStart;

      // Company/Store Name
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("STN GOLDEN HEALTHY FOODS", 5, yPos);
      yPos += 8;

      // Order ID
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Order ID: ${order.razorpayOrderId}`, 5, yPos);
      yPos += 6;

      // Shipping Address
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("SHIP TO:", 5, yPos);
      yPos += 6;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      if (address.fullName) {
        pdf.text(address.fullName, 5, yPos);
        yPos += 5;
      }
      if (address.addressLine1) {
        pdf.text(address.addressLine1, 5, yPos);
        yPos += 5;
      }
      if (address.addressLine2) {
        pdf.text(address.addressLine2, 5, yPos);
        yPos += 5;
      }
      if (address.city || address.state || address.zipCode) {
        const cityStateZip = [
          address.city,
          address.state,
          address.zipCode,
        ]
          .filter(Boolean)
          .join(", ");
        pdf.text(cityStateZip, 5, yPos);
        yPos += 5;
      }
      if (address.country) {
        pdf.text(address.country, 5, yPos);
        yPos += 5;
      }
      if (address.phone) {
        pdf.text(`Phone: ${address.phone}`, 5, yPos);
        yPos += 5;
      }

      // Order Items
      yPos += 3;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("ITEMS:", 5, yPos);
      yPos += 5;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      order.items.forEach((item: any) => {
        const itemText = `${item.quantity}x ${item.productName}`;
        if (pdf.getTextWidth(itemText) > 85) {
          // Split long text
          const words = itemText.split(" ");
          let line = "";
          words.forEach((word: string) => {
            if (pdf.getTextWidth(line + word) > 85) {
              pdf.text(line, 5, yPos);
              yPos += 4;
              line = word + " ";
            } else {
              line += word + " ";
            }
          });
          if (line) {
            pdf.text(line, 5, yPos);
            yPos += 4;
          }
        } else {
          pdf.text(itemText, 5, yPos);
          yPos += 4;
        }
      });

      // Order Date
      yPos += 3;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN");
      pdf.text(`Order Date: ${orderDate}`, 5, yPos);
    });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="shipping-labels-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Generate shipping labels error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate shipping labels" },
      { status: 500 }
    );
  }
}
