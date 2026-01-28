"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Suspense } from "react";
import Button from "@/components/ui/button";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
              PAYMENT FAILED
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-light">
              {error ? decodeURIComponent(error) : "Your payment could not be processed. Please try again."}
            </p>
            <p className="text-sm text-slate-500 font-light">
              No order was created. Your items are still in your cart.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 sm:pt-6">
            <Button
              asLink
              href="/home/cart"
              variant="primary"
              size="md"
            >
              BACK TO CART
            </Button>
            <Button
              asLink
              href="/home/products"
              variant="primary"
              size="md"
            >
              CONTINUE SHOPPING
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
              <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
            </div>
            <p className="mt-6 text-base sm:text-lg text-slate-600 font-light">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
