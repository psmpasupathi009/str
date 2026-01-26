"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Suspense } from "react";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
              PAYMENT FAILED
            </h1>
            <p className="text-base sm:text-lg text-gray-400 font-light">
              {error ? decodeURIComponent(error) : "Your payment could not be processed. Please try again."}
            </p>
          </div>

          {orderId && (
            <div className="w-full max-w-md space-y-4 p-6 sm:p-8 border border-white/10 bg-white/5">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-400 font-light">Order ID:</span>
                <span className="text-sm sm:text-base font-light">{orderId}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-6">
            <Link
              href="/cart"
              className="px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all"
            >
              <span className="text-xs sm:text-sm font-light tracking-widest">
                BACK TO CART
              </span>
            </Link>
            <Link
              href="/products"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-black hover:bg-gray-200 transition-colors"
            >
              <span className="text-xs sm:text-sm font-light tracking-widest">
                CONTINUE SHOPPING
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
            </div>
            <p className="mt-6 text-base sm:text-lg text-gray-400 font-light">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
