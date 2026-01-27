"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function TrackOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setError("Please enter your order ID");
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order not found");
      }

      router.push(`/home/orders/${data.order.id}/track`);
    } catch (err: any) {
      console.error("Track order error:", err);
      setError(err.message || "Order not found. Please check your order ID.");
      setIsSearching(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO HOME</span>
        </Link>

        <div className="text-center mb-8 sm:mb-12">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6">
            <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3 sm:mb-4 text-slate-900">
            TRACK YOUR ORDER
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-light">
            Enter your order ID to see the status of your order
          </p>
        </div>

        <div className="border border-green-200 bg-white shadow-sm rounded-lg p-6 sm:p-8 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm sm:text-base text-slate-600 font-light mb-2">
                Order ID
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter your order ID"
                  className="flex-1 bg-white border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors rounded"
                  style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-light tracking-wider">
                    {isSearching ? "SEARCHING..." : "TRACK"}
                  </span>
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs sm:text-sm mt-2">{error}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                You can use the last 8 characters of your order ID 
              </p>
            </div>

            <div className="pt-4 border-t border-green-200">
              <p className="text-xs sm:text-sm text-slate-500 font-light text-center">
                Don't have your order ID?{" "}
                {user ? (
                  <Link
                    href="/home/orders"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    View your order history
                  </Link>
                ) : (
                  <Link
                    href="/home/signin"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Sign in to view orders
                  </Link>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
