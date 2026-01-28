"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ShoppingBag,
  Tag,
  Video,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import ImageUpload from "@/components/shared/image-upload";
import MediaModal from "@/components/shared/media-modal";
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
  const { showError, showSuccess } = useToast();
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
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "gallery">("orders");
  
  // Product management state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: "",
    categoryId: "",
    itemCode: "",
    weight: "",
    mrp: "",
    salePrice: "",
    gst: "0.05",
    hsnCode: "",
    image: "",
    images: [] as string[],
    description: "",
    featured: false,
    bestSeller: false,
    inStock: true,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  // Gallery management state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null);
  const [galleryFormData, setGalleryFormData] = useState({
    url: "",
    type: "IMAGE" as "IMAGE" | "VIDEO",
    title: "",
    description: "",
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: "IMAGE" | "VIDEO"; title?: string; description?: string } | null>(null);

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
      if (activeTab === "products") {
        fetchProducts();
        fetchCategories();
      }
      if (activeTab === "gallery") {
        fetchGallery();
      }
    }
  }, [statusFilter, paymentFilter, searchQuery, fetchData, activeTab, user]);

  const fetchProducts = async () => {
    if (!user?.email) return;
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/products?limit=1000", {
        headers: { "x-user-email": user.email },
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch("/api/categories", {
        headers: { "x-user-email": user.email },
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchGallery = async () => {
    if (!user?.email) return;
    setLoadingGallery(true);
    try {
      const response = await fetch("/api/gallery", {
        headers: { "x-user-email": user.email },
      });
      const data = await response.json();
      if (response.ok) {
        // Sort by order
        const sortedItems = (data.gallery || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        setGalleryItems(sortedItems);
      }
    } catch (err: any) {
      console.error("Error fetching gallery:", err);
      showError("Failed to fetch gallery items");
    } finally {
      setLoadingGallery(false);
    }
  };

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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({
          ...productFormData,
          mrp: parseFloat(productFormData.mrp),
          salePrice: parseFloat(productFormData.salePrice),
          gst: parseFloat(productFormData.gst),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      showError(`Product ${editingProduct ? "updated" : "created"} successfully`);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({
        name: "",
        categoryId: "",
        itemCode: "",
        weight: "",
        mrp: "",
        salePrice: "",
        gst: "0.05",
        hsnCode: "",
        image: "",
        images: [],
        description: "",
        featured: false,
        bestSeller: false,
        inStock: true,
      });
      fetchProducts();
    } catch (err: any) {
      showError(err.message || "Failed to save product");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify(categoryFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      showSuccess(`Category ${editingCategory ? "updated" : "created"} successfully`);
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({ name: "", description: "", image: "" });
      fetchCategories();
      fetchProducts();
    } catch (err: any) {
      showError(err.message || "Failed to save category");
    }
  };

  const handleMediaUpload = async (file: File) => {
    if (!user?.email) return;

    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");

      const response = await fetch("/api/upload/media", {
        method: "POST",
        headers: {
          "x-user-email": user.email,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload media");
      }

      const data = await response.json();
      // Auto-detect type from upload response
      const detectedType = data.type || (file.type.startsWith("video/") ? "VIDEO" : "IMAGE");
      setGalleryFormData({ 
        ...galleryFormData, 
        url: data.url, 
        type: detectedType 
      });
      showSuccess(`${detectedType === "VIDEO" ? "Video" : "Image"} uploaded successfully`);
    } catch (err: any) {
      showError(err.message || "Failed to upload media");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    if (!galleryFormData.url) {
      showError("Please upload an image or provide a URL");
      return;
    }

    try {
      // Get max order value for new items
      const maxOrder = galleryItems.length > 0 
        ? Math.max(...galleryItems.map(item => item.order || 0))
        : -1;

      const url = editingGalleryItem
        ? `/api/gallery/${editingGalleryItem.id}`
        : "/api/gallery";
      const method = editingGalleryItem ? "PUT" : "POST";

      const payload = {
        ...galleryFormData,
        order: editingGalleryItem ? editingGalleryItem.order : maxOrder + 1,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save gallery item");
      }

      showSuccess(`Gallery item ${editingGalleryItem ? "updated" : "created"} successfully`);
      setShowGalleryForm(false);
      setEditingGalleryItem(null);
      setGalleryFormData({
        url: "",
        type: "IMAGE",
        title: "",
        description: "",
      });
      fetchGallery();
    } catch (err: any) {
      showError(err.message || "Failed to save gallery item");
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetItemId || !user?.email) return;

    // Get sorted items by current order
    const sortedItems = [...galleryItems].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const draggedIndex = sortedItems.findIndex(item => item.id === draggedItem);
    const targetIndex = sortedItems.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder items locally
    const newItems = [...sortedItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update order values based on new position
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Update state immediately for instant feedback
    setGalleryItems(updatedItems);

    // Update orders in database
    try {
      const updatePromises = updatedItems.map((item, index) =>
        fetch(`/api/gallery/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({ order: index }),
        })
      );

      await Promise.all(updatePromises);
      showSuccess("Gallery order updated successfully");
      // Refresh to ensure consistency
      fetchGallery();
    } catch (err: any) {
      console.error("Error updating order:", err);
      showError("Failed to update gallery order");
      // Revert on error
      fetchGallery();
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!user?.email || !confirm("Are you sure you want to delete this gallery item?")) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: {
          "x-user-email": user.email,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete gallery item");
      }

      showSuccess("Gallery item deleted successfully");
      fetchGallery();
    } catch (err: any) {
      showError(err.message || "Failed to delete gallery item");
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    // Combine main image with additional images, ensuring main image is first
    const allImages = product.image 
      ? [product.image, ...(product.images || []).filter((img: string) => img !== product.image)]
      : (product.images || []);
    
    setProductFormData({
      name: product.name,
      categoryId: product.categoryId,
      itemCode: product.itemCode,
      weight: product.weight,
      mrp: product.mrp.toString(),
      salePrice: product.salePrice.toString(),
      gst: product.gst.toString(),
      hsnCode: product.hsnCode,
      image: allImages[0] || "",
      images: allImages,
      description: product.description || "",
      featured: product.featured || false,
      bestSeller: product.bestSeller || false,
      inStock: product.inStock !== false,
    });
    setShowProductForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setShowCategoryForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user?.email || !confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-user-email": user.email },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete product");
      }

      showSuccess("Product deleted successfully");
      fetchProducts();
    } catch (err: any) {
      showError(err.message || "Failed to delete product");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user?.email || !confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { "x-user-email": user.email },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete category");
      }

      showSuccess("Category deleted successfully");
      fetchCategories();
      fetchProducts();
    } catch (err: any) {
      showError(err.message || "Failed to delete category");
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/home/profile"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors"
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
                  : "bg-white border-green-300 text-slate-700 hover:bg-green-50"
              }`}
            >
              {autoRefresh ? "AUTO-REFRESH ON" : "AUTO-REFRESH OFF"}
            </button>
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-green-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 text-sm font-light tracking-wider border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-600 hover:text-green-600"
            }`}
          >
            ORDERS
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 text-sm font-light tracking-wider border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-600 hover:text-green-600"
            }`}
          >
            PRODUCTS
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-6 py-3 text-sm font-light tracking-wider border-b-2 transition-colors ${
              activeTab === "gallery"
                ? "border-green-600 text-green-600"
                : "border-transparent text-slate-600 hover:text-green-600"
            }`}
          >
            GALLERY
          </button>
        </div>

        {activeTab === "orders" && (
          <>
            {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600 font-light">Total Orders</p>
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-light text-slate-900">{stats.totalOrders}</p>
              <p className="text-xs text-slate-500 mt-1">{stats.todayOrders} today</p>
            </div>

            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
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

            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-600 font-light">Pending</p>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-light text-slate-900">{stats.pendingOrders}</p>
              <p className="text-xs text-slate-500 mt-1">Processing: {stats.processingOrders}</p>
            </div>

            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
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
        <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Email, or Name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 text-sm"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
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
                className="px-4 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
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
        <div className="border border-green-200 bg-white shadow-sm overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50 border-b border-green-200">
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
              <tbody className="divide-y divide-green-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-light">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-green-50 transition-colors">
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
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-slate-300 focus:outline-none focus:border-slate-500 rounded"
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
          </>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Categories Section */}
            <div className="border border-green-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light tracking-wide flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  PRODUCT CATEGORIES
                </h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryFormData({ name: "", description: "", image: "" });
                    setShowCategoryForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-light"
                >
                  <Plus className="w-4 h-4" />
                  ADD CATEGORY
                </button>
              </div>

              {categories.length === 0 ? (
                <p className="text-slate-500 font-light text-sm">No categories found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border border-green-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-light text-slate-900 mb-1">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-slate-600 font-light">{category.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products Section */}
            <div className="border border-green-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light tracking-wide flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  PRODUCTS
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormData({
                      name: "",
                      categoryId: "",
                      itemCode: "",
                      weight: "",
                      mrp: "",
                      salePrice: "",
                      gst: "0.05",
                      hsnCode: "",
                      image: "",
                      images: [],
                      description: "",
                      featured: false,
                      bestSeller: false,
                      inStock: true,
                    });
                    setShowProductForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-light"
                >
                  <Plus className="w-4 h-4" />
                  ADD PRODUCT
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-600 font-light text-sm">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <p className="text-slate-500 font-light text-sm">No products found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50 border-b border-green-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">Item Code</th>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">MRP</th>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">Sale Price</th>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-light tracking-wider text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-green-50">
                          <td className="px-4 py-3 text-sm font-light">{product.name}</td>
                          <td className="px-4 py-3 text-sm font-light">{product.category?.name || "N/A"}</td>
                          <td className="px-4 py-3 text-sm font-light">{product.itemCode}</td>
                          <td className="px-4 py-3 text-sm font-light">₹{product.mrp}</td>
                          <td className="px-4 py-3 text-sm font-light">₹{product.salePrice}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light tracking-wide">
                  {editingProduct ? "EDIT PRODUCT" : "ADD PRODUCT"}
                </h2>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">Category *</label>
                    <select
                      required
                      value={productFormData.categoryId}
                      onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">Item Code *</label>
                    <input
                      type="text"
                      required
                      value={productFormData.itemCode}
                      onChange={(e) => setProductFormData({ ...productFormData, itemCode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">Weight *</label>
                    <input
                      type="text"
                      required
                      value={productFormData.weight}
                      onChange={(e) => setProductFormData({ ...productFormData, weight: e.target.value })}
                      placeholder="e.g., 250 gms"
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">MRP *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productFormData.mrp}
                      onChange={(e) => setProductFormData({ ...productFormData, mrp: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">Sale Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productFormData.salePrice}
                      onChange={(e) => setProductFormData({ ...productFormData, salePrice: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">GST</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productFormData.gst}
                      onChange={(e) => setProductFormData({ ...productFormData, gst: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 font-light mb-1">HSN Code *</label>
                    <input
                      type="text"
                      required
                      value={productFormData.hsnCode}
                      onChange={(e) => setProductFormData({ ...productFormData, hsnCode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <ImageUpload
                      images={productFormData.images.length > 0 
                        ? productFormData.images 
                        : (productFormData.image ? [productFormData.image] : [])
                      }
                      maxImages={5}
                      onChange={(uploadedImages) => {
                        // First image becomes main image
                        setProductFormData({
                          ...productFormData,
                          image: uploadedImages[0] || "",
                          images: uploadedImages,
                        });
                      }}
                      folder="products"
                      userEmail={user?.email}
                    />
                    <p className="text-xs text-slate-500 font-light mt-2">
                      Note: First image will be used as the main product image. You can also enter image URLs manually below.
                    </p>
                    <div className="mt-2 space-y-2">
                      <label className="block text-xs text-slate-600 font-light">Main Image URL (optional):</label>
                      <input
                        type="url"
                        value={productFormData.image}
                        onChange={(e) => {
                          const newImage = e.target.value;
                          const currentImages = productFormData.images.length > 0 
                            ? productFormData.images 
                            : (productFormData.image ? [productFormData.image] : []);
                          const updatedImages = newImage 
                            ? [newImage, ...currentImages.filter(img => img !== newImage && img !== productFormData.image)]
                            : currentImages;
                          setProductFormData({
                            ...productFormData,
                            image: newImage,
                            images: updatedImages,
                          });
                        }}
                        placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-600 font-light mb-1">Description</label>
                    <textarea
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productFormData.featured}
                      onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-slate-600 font-light">Featured</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productFormData.bestSeller}
                      onChange={(e) => setProductFormData({ ...productFormData, bestSeller: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-slate-600 font-light">Best Seller</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productFormData.inStock}
                      onChange={(e) => setProductFormData({ ...productFormData, inStock: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-slate-600 font-light">In Stock</label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-light"
                  >
                    <Save className="w-4 h-4" />
                    {editingProduct ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="px-6 py-2 border border-green-300 text-slate-700 hover:bg-green-50 transition-colors text-sm font-light"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light tracking-wide">
                  {editingCategory ? "EDIT CATEGORY" : "ADD CATEGORY"}
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 font-light mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 font-light mb-1">Description</label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 font-light mb-1">Image URL</label>
                  <input
                    type="url"
                    value={categoryFormData.image}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:border-slate-500 text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-light"
                  >
                    <Save className="w-4 h-4" />
                    {editingCategory ? "UPDATE CATEGORY" : "CREATE CATEGORY"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                    }}
                    className="px-6 py-2 border border-green-300 text-slate-700 hover:bg-green-50 transition-colors text-sm font-light"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="border border-green-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light tracking-wide flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  Gallery Management
                </h2>
                <button
                  onClick={() => {
                    setShowGalleryForm(true);
                    setEditingGalleryItem(null);
                    setGalleryFormData({
                      url: "",
                      type: "IMAGE",
                      title: "",
                      description: "",
                    });
                  }}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-light flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  ADD GALLERY ITEM
                </button>
              </div>

              {showGalleryForm && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleGallerySubmit}
                  className="relative bg-white border border-green-200 rounded-2xl p-6 md:p-8 mb-6 shadow-lg shadow-green-100/50 space-y-6"
                >
                  <div className="space-y-6">
                    {/* Type Selection */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider uppercase block">
                        Media Type
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          {galleryFormData.type === "IMAGE" ? (
                            <ImageIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <Video className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <select
                          value={galleryFormData.type}
                          onChange={(e) => setGalleryFormData({ ...galleryFormData, type: e.target.value as "IMAGE" | "VIDEO", url: "" })}
                          className="w-full bg-white border border-green-300 pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 appearance-none cursor-pointer"
                          required
                        >
                          <option value="IMAGE">Image</option>
                          <option value="VIDEO">Video</option>
                        </select>
                      </div>
                    </div>

                    {/* Media Upload/URL */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider uppercase block">
                        Upload Media (Image or Video) *
                      </label>
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Auto-detect type from file
                                const fileType = file.type || "";
                                const detectedType = fileType.startsWith("video/") ? "VIDEO" : "IMAGE";
                                setGalleryFormData({ ...galleryFormData, type: detectedType });
                                handleMediaUpload(file);
                              }
                            }}
                            className="w-full bg-white border-2 border-dashed border-slate-300 rounded-xl px-4 py-6 text-sm text-slate-600 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                            disabled={uploadingMedia}
                          />
                          {uploadingMedia && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                              <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        
                        {galleryFormData.url && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-48 md:h-64 border-2 border-green-200 rounded-xl overflow-hidden bg-slate-100 shadow-md group"
                          >
                            {galleryFormData.type === "VIDEO" ? (
                              <video
                                src={galleryFormData.url}
                                controls
                                className="w-full h-full object-cover"
                                preload="metadata"
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img 
                                src={galleryFormData.url} 
                                alt="Preview" 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                              />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-3 left-3 right-3">
                                <p className="text-white text-xs font-medium truncate">
                                  {galleryFormData.type === "VIDEO" ? "Video" : "Image"} Uploaded Successfully
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            {galleryFormData.type === "IMAGE" ? (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            ) : (
                              <Video className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <input
                            type="url"
                            value={galleryFormData.url}
                            onChange={(e) => setGalleryFormData({ ...galleryFormData, url: e.target.value })}
                            placeholder={galleryFormData.type === "VIDEO" ? "Or enter video URL (YouTube, Vimeo, etc.)" : "Or enter image URL manually"}
                            className="w-full bg-white border border-green-300 pl-12 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider uppercase block">
                        Title <span className="text-slate-400 normal-case">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={galleryFormData.title}
                        onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                        placeholder="Enter a title for this media"
                        className="w-full bg-white border border-green-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider uppercase block">
                        Description <span className="text-slate-400 normal-case">(optional)</span>
                      </label>
                      <textarea
                        value={galleryFormData.description}
                        onChange={(e) => setGalleryFormData({ ...galleryFormData, description: e.target.value })}
                        rows={4}
                        placeholder="Add a description for this media item"
                        className="w-full bg-white border border-green-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-slate-200 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-green-200">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium rounded-lg shadow-md shadow-green-200 hover:shadow-lg hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {editingGalleryItem ? "UPDATE GALLERY ITEM" : "CREATE GALLERY ITEM"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGalleryForm(false);
                        setEditingGalleryItem(null);
                        setGalleryFormData({
                          url: "",
                          type: "IMAGE",
                          title: "",
                          description: "",
                        });
                      }}
                      className="px-6 py-3 border-2 border-green-300 text-slate-700 hover:bg-slate-50 hover:border-green-400 transition-all duration-200 text-sm font-medium rounded-lg"
                    >
                      CANCEL
                    </button>
                  </div>
                </motion.form>
              )}

              {loadingGallery ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : galleryItems.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No gallery items. Add your first item above.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-light">
                    <GripVertical className="w-5 h-5 text-green-600" />
                    <span>Drag and drop items to change their display order</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {galleryItems
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((item, index) => {
                        const isDragging = draggedItem === item.id;
                        const isDragOver = draggedItem && draggedItem !== item.id;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: isDragging ? 0.5 : 1, 
                              y: 0,
                              scale: isDragging ? 0.95 : isDragOver ? 1.05 : 1,
                            }}
                            whileHover={{ scale: 1.02 }}
                            className={`relative border-2 bg-white p-4 rounded-xl cursor-move transition-all duration-200 shadow-md ${
                              isDragging 
                                ? "border-green-400 shadow-green-200 z-50" 
                                : isDragOver
                                ? "border-green-500 shadow-lg shadow-green-300 z-40"
                                : "border-green-200 hover:border-green-300 hover:shadow-lg"
                            }`}
                            draggable
                            onDragStart={(e) => {
                              const event = e as unknown as React.DragEvent;
                              handleDragStart(event, item.id);
                            }}
                            onDragOver={(e) => {
                              const event = e as unknown as React.DragEvent;
                              handleDragOver(event);
                            }}
                            onDrop={(e) => {
                              const event = e as unknown as React.DragEvent;
                              handleDrop(event, item.id);
                            }}
                            onDragEnd={() => handleDragEnd()}
                          >
                          {/* Position Badge */}
                          <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
                            {index + 1}
                          </div>
                          
                          {/* Drag Handle */}
                          <div className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                            <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing text-slate-500" />
                          </div>

                          {/* Type Badge */}
                          <div className="mb-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                              item.type === "IMAGE" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {item.type === "IMAGE" ? (
                                <ImageIcon className="w-3 h-3" />
                              ) : (
                                <Video className="w-3 h-3" />
                              )}
                              {item.type}
                            </span>
                          </div>

                          {/* Media Preview */}
                          <div 
                            className="relative aspect-video mb-3 bg-slate-100 rounded-lg overflow-hidden group cursor-pointer"
                            onClick={() => setSelectedMedia({ url: item.url, type: item.type, title: item.title, description: item.description })}
                          >
                            {item.type === "IMAGE" ? (
                              <img 
                                src={item.url} 
                                alt={item.title || "Gallery"} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                              />
                            ) : (
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                muted
                                onMouseEnter={(e) => {
                                  // Auto-play on hover for preview
                                  const video = e.currentTarget;
                                  video.play().catch(() => {});
                                }}
                                onMouseLeave={(e) => {
                                  // Pause when mouse leaves
                                  const video = e.currentTarget;
                                  video.pause();
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-2 left-2 right-2">
                                {item.title && (
                                  <p className="text-white text-xs font-medium truncate">{item.title}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {item.title && <p className="text-sm font-medium text-slate-900">{item.title}</p>}
                            {item.description && <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                setEditingGalleryItem(item);
                                setGalleryFormData({
                                  url: item.url,
                                  type: item.type,
                                  title: item.title || "",
                                  description: item.description || "",
                                });
                                setShowGalleryForm(true);
                              }}
                              className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-xs font-light rounded-lg"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteGalleryItem(item.id)}
                              className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-xs font-light rounded-lg"
                            >
                              DELETE
                            </button>
                          </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <MediaModal
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          mediaUrl={selectedMedia.url}
          mediaType={selectedMedia.type}
          title={selectedMedia.title}
          description={selectedMedia.description}
        />
      )}
    </main>
  );
}
