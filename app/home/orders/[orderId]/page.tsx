"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, User, Mail, Phone, Calendar, CreditCard, Truck, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import Invoice from "@/components/shared/invoice";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string | null;
  quantity: number;
  price: number;
  gstRate: number | null;
  gstAmount: number | null;
  totalPrice: number;
}

interface Order {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  invoiceNumber: string | null;
  amount: number;
  subtotal: number | null;
  gstAmount: number | null;
  cgstAmount: number | null;
  sgstAmount: number | null;
  igstAmount: number | null;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/home/signin");
      return;
    }

    if (orderId && orderId.trim() !== "") {
      fetchOrder();
    } else if (!authLoading) {
      setError("Order ID is required");
      setLoading(false);
    }
  }, [orderId, user, authLoading, router]);

  const fetchOrder = async () => {
    if (!orderId || orderId.trim() === "") {
      setError("Order ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order");
      }

      setOrder(data.order);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-light">Loading order details...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/home/orders"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-light tracking-wider">
              BACK TO ORDERS
            </span>
          </Link>
          <div className="border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600 font-light">{error || "Order not found"}</p>
          </div>
        </div>
      </main>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/home/orders"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">
            BACK TO ORDERS
          </span>
        </Link>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider mb-2 text-slate-900">
            ORDER DETAILS
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-light">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Order Items */}
            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                ORDER ITEMS
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between pb-4 border-b border-green-100 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-light text-slate-900 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-slate-600 font-light">
                        Quantity: {item.quantity}
                      </p>
                      <Link
                        href={`/home/products/${item.productId}`}
                        className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-light mt-2 inline-block"
                      >
                        View Product →
                      </Link>
                    </div>
                    <p className="text-base sm:text-lg font-light text-slate-900 ml-4">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  SHIPPING ADDRESS
                </h2>
                <div className="space-y-2 text-sm sm:text-base font-light text-slate-900">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            {/* Order Summary */}
            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6">
                ORDER SUMMARY
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-600 font-light">Subtotal</span>
                  <span className="text-slate-900 font-light">
                    ₹{(order.subtotal || order.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {order.gstAmount && order.gstAmount > 0 && (
                  <>
                    {order.cgstAmount && order.cgstAmount > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-slate-600 font-light">CGST</span>
                        <span className="text-slate-900 font-light">
                          ₹{order.cgstAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {order.sgstAmount && order.sgstAmount > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-slate-600 font-light">SGST</span>
                        <span className="text-slate-900 font-light">
                          ₹{order.sgstAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                    {order.igstAmount && order.igstAmount > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-slate-600 font-light">IGST</span>
                        <span className="text-slate-900 font-light">
                          ₹{order.igstAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-slate-600 font-light">Shipping</span>
                  <span className="text-slate-900 font-light">Free</span>
                </div>
                <div className="border-t border-green-200 pt-4 flex justify-between">
                  <span className="text-lg sm:text-xl font-light text-slate-900">Total</span>
                  <span className="text-lg sm:text-xl font-light text-slate-900">
                    ₹{order.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Order Status */}
              <div className="border-t border-green-200 pt-4 space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 font-light mb-2">
                    ORDER STATUS
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-xs sm:text-sm font-light rounded border ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 font-light mb-2">
                    PAYMENT STATUS
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-xs sm:text-sm font-light rounded border ${getStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="border-t border-green-200 pt-4 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-light">
                    Ordered: {formatDate(order.createdAt)}
                  </span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-light">
                      Payment ID: {order.razorpayPaymentId.slice(-8)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-green-200 pt-4 space-y-3">
                <Link
                  href={`/home/orders/${order.id}/track`}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-light tracking-wider">
                    TRACK ORDER
                  </span>
                </Link>
                <button
                  onClick={() => setShowInvoice(!showInvoice)}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border border-green-600 hover:border-green-700 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-light tracking-wider">
                    {showInvoice ? "HIDE INVOICE" : "VIEW INVOICE"}
                  </span>
                </button>
                {showInvoice && (
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border border-green-600 hover:border-green-700 bg-green-600 hover:bg-green-700 text-white transition-all mt-2"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-light tracking-wider">
                      PRINT INVOICE
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Section */}
        {showInvoice && order && (
          <div className="mt-8 border border-green-200 bg-white shadow-sm p-4 sm:p-6">
            <Invoice order={order} />
          </div>
        )}
      </div>
    </main>
  );
}
