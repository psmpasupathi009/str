"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Truck, Package, CheckCircle, Clock, MapPin, Calendar, Download, Sparkles, Star, Edit, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { format } from "date-fns";

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
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
}

interface TrackingStep {
  status: string;
  label: string;
  description: string;
  completed: boolean;
  date?: string;
  icon: React.ReactNode;
  color: string;
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { user, isLoading: authLoading } = useAuth();
  const { showError, showSuccess: toastSuccess } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [trackingFormData, setTrackingFormData] = useState({
    shippedDate: "",
    trackingNumber: "",
    orderStatus: "SHIPPED",
    notes: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/home/signin");
      return;
    }

    if (orderId?.trim()) {
      fetchOrder();
      // Auto-refresh every 30 seconds for real-time updates (reduced from 10 seconds)
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    } else if (!authLoading) {
      setError("Order ID is required");
      setLoading(false);
    }
  }, [orderId, user, authLoading, router]);

  const fetchOrder = async () => {
    if (!orderId?.trim()) return;

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
      if (!order) {
        setError(err.message || "Failed to load order");
        setLoading(false);
      }
    } finally {
      if (loading) setLoading(false);
    }
  };

  const confirmDelivery = async () => {
    if (!order || order.orderStatus !== "SHIPPED") return;

    setConfirming(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/confirm-delivery`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm delivery");
      }

      setOrder(data.order);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err: any) {
      console.error("Error confirming delivery:", err);
      showError(err.message || "Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  };

  const updateTracking = async () => {
    if (!order || !user?.email) return;

    setUpdatingTracking(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-user-email": user.email,
      };

      const response = await fetch(`/api/admin/orders/${order.id}/update-tracking`, {
        method: "PUT",
        headers,
        body: JSON.stringify(trackingFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update tracking");
      }

      setOrder(data.order);
      setShowTrackingForm(false);
      setTrackingFormData({
        shippedDate: "",
        trackingNumber: "",
        orderStatus: "SHIPPED",
        notes: "",
      });
      toastSuccess("Tracking updated successfully!");
    } catch (err: any) {
      console.error("Error updating tracking:", err);
      showError(err.message || "Failed to update tracking");
    } finally {
      setUpdatingTracking(false);
    }
  };


  const getTrackingSteps = (): TrackingStep[] => {
    if (!order) return [];

    const steps: TrackingStep[] = [
      {
        status: "PENDING",
        label: "Order Placed",
        description: "Your order has been confirmed and payment is being processed",
        completed: true,
        date: order.createdAt,
        icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
        color: "from-green-500 to-green-500",
      },
      {
        status: "PROCESSING",
        label: "Order Confirmed",
        description: "Your order is being prepared and will be shipped soon",
        completed: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.orderStatus),
        date: order.orderStatus !== "PENDING" ? order.updatedAt : undefined,
        icon: <Package className="w-5 h-5 sm:w-6 sm:h-6" />,
        color: "from-green-500 to-green-400",
      },
      {
        status: "SHIPPED",
        label: "Shipped",
        description: "Your order has been shipped and is on its way to you",
        completed: ["SHIPPED", "DELIVERED"].includes(order.orderStatus),
        date: (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") ? order.updatedAt : undefined,
        icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />,
        color: "from-purple-500 to-pink-500",
      },
      {
        status: "DELIVERED",
        label: "Delivered",
        description: "Your order has been successfully delivered",
        completed: order.orderStatus === "DELIVERED",
        date: order.orderStatus === "DELIVERED" ? order.updatedAt : undefined,
        icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
        color: "from-green-500 to-teal-500",
      },
    ];

    return steps;
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "processing":
        return "text-green-300 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  // Calculate progress percentage
  const getProgress = () => {
    if (!order) return 0;
    const steps = getTrackingSteps();
    const completedSteps = steps.filter((s) => s.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 via-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-light">Loading tracking information...</p>
            </motion.div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  if (error || !order) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 via-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/home/orders"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO ORDERS</span>
          </Link>
          <div className="border border-red-200 bg-red-50 p-6 text-center rounded-lg">
            <p className="text-red-600 font-light">{error || "Order not found"}</p>
          </div>
        </div>
      </main>
    );
  }

  const trackingSteps = getTrackingSteps();
  const progress = getProgress();
  const canConfirmDelivery = order.orderStatus === "SHIPPED";

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 via-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/home/orders/${order.id}`}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO ORDER</span>
          </Link>
        </motion.div>

        {/* Header with Animated Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-green-600 to-green-600 flex items-center justify-center shadow-lg shadow-green-200"
            >
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider text-slate-900">
                TRACK YOUR ORDER
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-light mt-1">
                Order #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-slate-600 font-light">Order Progress</span>
              <span className="text-xs sm:text-sm text-slate-600 font-light">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-linear-to-r from-green-500 via-green-500 to-purple-500 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 text-sm font-light rounded-lg border ${getStatusColor(order.orderStatus)}`}
            >
              {order.orderStatus}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 text-sm font-light rounded-lg border ${getStatusColor(order.paymentStatus)}`}
            >
              Payment: {order.paymentStatus}
            </motion.span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Animated Tracking Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border border-green-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-linear-to-br from-green-50/50 to-blue-50/50 opacity-50" />
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-6 sm:mb-8 flex items-center gap-2">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                  ORDER TRACKING
                </h2>

                <div className="relative">
                  {/* Animated Timeline Line */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="absolute left-6 sm:left-8 top-0 bottom-0 w-1 bg-linear-to-b from-green-200 via-blue-300 to-green-200 rounded-full"
                  />

                  {/* Timeline Steps with Animations */}
                  <div className="space-y-8 sm:space-y-10">
                    {trackingSteps.map((step, index) => {
                      const isActive = step.completed;
                      const delay = 0.4 + index * 0.15;

                      return (
                        <motion.div
                          key={step.status}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay }}
                          className="relative flex items-start gap-4 sm:gap-6"
                        >
                          {/* Animated Icon */}
                          <motion.div
                            animate={isActive ? {
                              scale: [1, 1.2, 1],
                              boxShadow: [
                                "0 0 0 0px rgba(16, 185, 129, 0.4)",
                                "0 0 0 10px rgba(16, 185, 129, 0)",
                                "0 0 0 0px rgba(16, 185, 129, 0)"
                              ]
                            } : {}}
                            transition={{ duration: 2, repeat: isActive ? Infinity : 0, repeatDelay: 3 }}
                            className={`relative z-10 shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? `bg-linear-to-br ${step.color} text-white shadow-lg shadow-green-200`
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {step.icon}
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: delay + 0.3 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                              >
                                <CheckCircle className="w-2.5 h-2.5 text-white" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Content */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.2 }}
                            className="flex-1 pt-1 pb-8"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <h3
                                className={`text-lg sm:text-xl font-light transition-colors ${
                                  isActive ? "text-slate-900" : "text-slate-500"
                                }`}
                              >
                                {step.label}
                              </h3>
                              {step.date && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: delay + 0.4 }}
                                  className="text-xs sm:text-sm text-slate-500 font-light flex items-center gap-1"
                                >
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(step.date)}
                                </motion.span>
                              )}
                            </div>
                            <p className={`text-sm sm:text-base font-light transition-colors ${
                              isActive ? "text-slate-700" : "text-slate-400"
                            }`}>
                              {step.description}
                            </p>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Admin Tracking Update Form */}
            {user?.role === "ADMIN" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="border border-green-200 bg-white shadow-lg rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-light text-slate-900 flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    UPDATE TRACKING
                  </h3>
                  <Dialog open={showTrackingForm} onOpenChange={setShowTrackingForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" icon={<Edit className="w-4 h-4" />}>
                        UPDATE
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Order Tracking</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderStatus">Order Status</Label>
                          <Select
                            value={trackingFormData.orderStatus}
                            onValueChange={(value) => setTrackingFormData({ ...trackingFormData, orderStatus: value })}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="PROCESSING">Processing</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shippedDate">Shipped Date</Label>
                          <Input
                            id="shippedDate"
                            type="datetime-local"
                            value={trackingFormData.shippedDate}
                            onChange={(e) => setTrackingFormData({ ...trackingFormData, shippedDate: e.target.value })}
                            className="bg-white border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trackingNumber">Tracking Number</Label>
                          <Input
                            id="trackingNumber"
                            type="text"
                            value={trackingFormData.trackingNumber}
                            onChange={(e) => setTrackingFormData({ ...trackingFormData, trackingNumber: e.target.value })}
                            placeholder="Enter tracking number"
                            className="bg-white border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Input
                            id="notes"
                            type="text"
                            value={trackingFormData.notes}
                            onChange={(e) => setTrackingFormData({ ...trackingFormData, notes: e.target.value })}
                            placeholder="Additional notes"
                            className="bg-white border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-light">Order Items</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span>{item.productName} × {item.quantity}</span>
                                <span className="text-slate-500">Selected</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={updateTracking}
                            isLoading={updatingTracking}
                            variant="primary"
                            size="md"
                            className="flex-1"
                            icon={<Save className="w-4 h-4" />}
                          >
                            {updatingTracking ? "UPDATING..." : "UPDATE TRACKING"}
                          </Button>
                          <Button
                            onClick={() => setShowTrackingForm(false)}
                            variant="outline"
                            size="md"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-sm text-slate-600 font-light">
                  <p>Current Status: <span className="font-medium">{order.orderStatus}</span></p>
                  <p className="mt-1">Last Updated: {formatDate(order.updatedAt)}</p>
                </div>
              </motion.div>
            )}

            {/* Delivery Confirmation Button */}
            {canConfirmDelivery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="border border-green-200 bg-linear-to-br from-green-50 to-green-50 shadow-lg rounded-2xl p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-light text-slate-900 mb-2">
                      Has your order been delivered?
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 font-light mb-4">
                      If you have received your order, please confirm delivery to update the order status.
                    </p>
                    <Button
                      onClick={confirmDelivery}
                      isLoading={confirming}
                      variant="primary"
                      size="md"
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      {confirming ? "CONFIRMING..." : "CONFIRM DELIVERY"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            <AnimatePresence>
              {showSuccessModal && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-green-200 bg-linear-to-br from-green-50 to-green-50 shadow-lg rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-green-500 flex items-center justify-center"
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-base font-light text-green-900">Delivery Confirmed!</p>
                      <p className="text-sm font-light text-green-700">Your order status has been updated.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="border border-green-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                ORDER DETAILS
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-slate-600 font-light">Order ID</p>
                  <p className="text-sm sm:text-base font-light text-slate-900">{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-slate-600 font-light">Order Date</p>
                  <p className="text-sm sm:text-base font-light text-slate-900">{formatDate(order.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-slate-600 font-light">Total Amount</p>
                  <p className="text-lg sm:text-xl font-light text-slate-900">
                    ₹{order.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                {order.razorpayPaymentId && (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-slate-600 font-light">Payment ID</p>
                    <p className="text-sm sm:text-base font-light text-slate-900">{order.razorpayPaymentId.slice(-8)}</p>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="mt-6 pt-6 border-t border-green-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm sm:text-base text-slate-600 font-light mb-2">Shipping Address</p>
                      <p className="text-sm sm:text-base font-light text-slate-900 leading-relaxed">
                        {order.shippingAddress.fullName}
                        <br />
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 && (
                          <>, {order.shippingAddress.addressLine2}</>
                        )}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        <br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border border-green-200 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 sticky top-24"
            >
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6">ORDER ITEMS</h2>
              
              <div className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start justify-between pb-4 border-b border-green-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-light text-slate-900 mb-1">
                        {item.productName}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 font-light">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm sm:text-base font-light text-slate-900 ml-4">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-green-200 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-slate-600 font-light">Subtotal</span>
                  <span className="text-sm sm:text-base font-light text-slate-900">
                    ₹{order.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-slate-600 font-light">Shipping</span>
                  <span className="text-sm sm:text-base font-light text-slate-900">Free</span>
                </div>
                <div className="border-t border-green-200 pt-3 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-light text-slate-900">Total</span>
                  <span className="text-lg sm:text-xl font-light text-slate-900">
                    ₹{order.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href={`/home/orders/${order.id}`}
                  className="block w-full text-center px-4 sm:px-6 py-3 border border-green-600 hover:border-green-700 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 transition-all rounded-lg"
                >
                  <span className="text-xs sm:text-sm font-light tracking-wider">VIEW FULL ORDER</span>
                </Link>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border border-green-300 hover:border-green-500 bg-white hover:bg-green-50 text-slate-700 hover:text-slate-900 transition-all rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-light tracking-wider">DOWNLOAD INVOICE</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
