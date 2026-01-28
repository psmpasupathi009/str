"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ArrowLeft, Calendar, MapPin, Eye, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Button from "@/componets/ui/button";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
  customerName: string | null;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/home/signin");
      return;
    }

    if (user?.id) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
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
    });
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-light">Loading orders...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/home/profile"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">
            BACK TO PROFILE
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-600 flex items-center justify-center">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-wider mb-1 sm:mb-2 text-slate-900">
              ORDER HISTORY
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-light">
              View and track all your orders
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
            <p className="text-sm font-light">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="border border-green-200 bg-white shadow-sm p-8 sm:p-12 text-center">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-2 text-slate-900">
              No Orders Yet
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-light mb-6">
              Start shopping to see your order history here.
            </p>
            <Button
              asLink
              href="/home/products"
              variant="primary"
              size="md"
            >
              START SHOPPING
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-green-200 bg-white shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-light tracking-wide text-slate-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <span
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-light rounded border ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-light">{formatDate(order.createdAt)}</span>
                      </div>
                      {order.shippingAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="font-light">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-light text-slate-900 mb-1">
                      ₹{order.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-light">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-4 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-slate-600 font-light mb-2">
                        ITEMS:
                      </p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <p
                            key={item.id}
                            className="text-sm font-light text-slate-900"
                          >
                            {item.productName} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm font-light text-slate-500">
                            +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        asLink
                        href={`/home/orders/${order.id}`}
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                      >
                        VIEW DETAILS
                      </Button>
                      <Button
                        asLink
                        href={`/home/orders/${order.id}/track`}
                        variant="primary"
                        size="sm"
                        icon={<Truck className="w-4 h-4" />}
                      >
                        TRACK
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
