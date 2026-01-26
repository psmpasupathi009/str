"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Suspense, useEffect } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");

  // Clear cart after successful payment
  useEffect(() => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
              PAYMENT SUCCESSFUL
            </h1>
            <p className="text-base sm:text-lg text-gray-400 font-light">
              Thank you for your purchase!
            </p>
          </div>

          {orderId && (
            <div className="w-full max-w-md space-y-4 p-6 sm:p-8 border border-white/10 bg-white/5">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-400 font-light">Order ID:</span>
                <span className="text-sm sm:text-base font-light">{orderId}</span>
              </div>
              {paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-400 font-light">Payment ID:</span>
                  <span className="text-sm sm:text-base font-light">{paymentId}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-6">
            <Link
              href="/products"
              className="px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all"
            >
              <span className="text-xs sm:text-sm font-light tracking-widest">
                CONTINUE SHOPPING
              </span>
            </Link>
            <Link
              href="/profile"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-black hover:bg-gray-200 transition-colors"
            >
              <span className="text-xs sm:text-sm font-light tracking-widest">
                VIEW ORDERS
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
            </div>
            <p className="mt-6 text-base sm:text-lg text-gray-400 font-light">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
