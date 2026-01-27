"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

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
  razorpayPaymentId: string | null;
  amount: number;
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

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { showError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/home");
      return;
    }

    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user, authLoading, router]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh || !user || user.role !== "ADMIN") return;

    const interval = setInterval(() => {
      fetchData(true);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, user]);

  const fetchData = useCallback(async (silent = false) => {
    if (!user?.email) return;

    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const headers = {
        "Content-Type": "application/json",
        "x-user-email": user.email,
      };

      // Fetch orders and stats in parallel
      const [ordersResponse, statsResponse] = await Promise.all([
        fetch(
          `/api/admin/orders?status=${statusFilter !== "all" ? statusFilter : ""}&paymentStatus=${paymentFilter !== "all" ? paymentFilter : ""}`,
          { headers }
        ),
        fetch("/api/admin/orders/stats", { headers }),
      ]);

      const ordersData = await ordersResponse.json();
      const statsData = await statsResponse.json();

      if (!ordersResponse.ok) {
        throw new Error(ordersData.error || "Failed to fetch orders");
      }

      if (!statsResponse.ok) {
        throw new Error(statsData.error || "Failed to fetch statistics");
      }

      let filteredOrders = ordersData.orders || [];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(
          (order: Order) =>
            order.id.toLowerCase().includes(query) ||
            order.customerEmail?.toLowerCase().includes(query) ||
            order.customerName?.toLowerCase().includes(query) ||
            order.razorpayOrderId.toLowerCase().includes(query)
        );
      }

      setOrders(filteredOrders);
      setStats(statsData.stats);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, statusFilter, paymentFilter, searchQuery]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [statusFilter, paymentFilter, searchQuery, fetchData]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Refresh data
      fetchData();
      setSelectedOrder(null);
    } catch (err: any) {
      console.error("Error updating order status:", err);
      showError(err.message || "Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-light">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/home/profile"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-light tracking-wider">
                BACK TO PROFILE
              </span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-light tracking-wider text-slate-900">
              ADMIN DASHBOARD
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 text-xs sm:text-sm font-light tracking-wider border transition-all ${
                autoRefresh
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-sky-300 text-slate-700 hover:bg-sky-50"
              }`}
            >
              {autoRefresh ? "AUTO-REFRESH ON" : "AUTO-REFRESH OFF"}
            </button>
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="text-xs sm:text-sm font-light tracking-wider">
                REFRESH
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
            <p className="text-sm font-light">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="border border-sky-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600 font-light">Total Orders</p>
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-light text-slate-900">{stats.totalOrders}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.todayOrders} today</p>
            </div>

            <div className="border border-sky-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600 font-light">Total Revenue</p>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-light text-slate-900">
                ₹{stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                ₹{stats.todayRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })} today
              </p>
            </div>

            <div className="border border-sky-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600 font-light">Pending</p>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-light text-slate-900">{stats.pendingOrders}</p>
              <p className="text-xs text-slate-500 mt-1">Processing: {stats.processingOrders}</p>
            </div>

            <div className="border border-sky-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600 font-light">Shipped</p>
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-light text-slate-900">{stats.shippedOrders}</p>
              <p className="text-xs text-slate-500 mt-1">Delivered: {stats.deliveredOrders}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="border border-sky-200 bg-white shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Email, or Name..."
                className="w-full pl-10 pr-4 py-2 border border-sky-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-sky-300 focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-sky-300 focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="all">All Payment</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-sky-200 bg-white shadow-sm overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sky-50 border-b border-sky-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-light tracking-wider text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-light">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-sky-50 transition-colors">
                      <td className="px-4 py-3 text-xs sm:text-sm font-light text-slate-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-light text-slate-900">
                        <div>
                          <p>{order.customerName || "N/A"}</p>
                          <p className="text-slate-500 text-xs">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-light text-slate-900">
                        ₹{order.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-light rounded border ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-light rounded border ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-light text-slate-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-sky-600 hover:bg-sky-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-sky-300 focus:outline-none focus:border-sky-500 rounded"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light tracking-wide">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 font-light">Order ID</p>
                  <p className="text-base font-light">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-light">Customer</p>
                  <p className="text-base font-light">
                    {selectedOrder.customerName} ({selectedOrder.customerEmail})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-light">Items</p>
                  <div className="space-y-2 mt-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-light">Total Amount</p>
                  <p className="text-lg font-light">
                    ₹{selectedOrder.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="text-sm text-slate-600 font-light">Shipping Address</p>
                    <p className="text-sm font-light">
                      {selectedOrder.shippingAddress.addressLine1}
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <>, {selectedOrder.shippingAddress.addressLine2}</>
                      )}
                      <br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
