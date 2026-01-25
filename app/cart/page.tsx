import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
  // This would typically fetch from a cart context or state management
  const cartItems: any[] = []; // Empty for now

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">CONTINUE SHOPPING</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-8 sm:mb-12">
          SHOPPING CART
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <ShoppingCart className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600 mb-4 sm:mb-6" />
            <p className="text-lg sm:text-xl text-gray-400 font-light tracking-wide mb-4 sm:mb-6">
              Your cart is empty
            </p>
            <Link
              href="/products"
              className="px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all"
            >
              <span className="text-xs sm:text-sm font-light tracking-widest">
                BROWSE PRODUCTS
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Cart items would be rendered here */}
            <div className="border-t border-white/10 pt-6 sm:pt-8">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <span className="text-lg sm:text-xl font-light tracking-wide">TOTAL</span>
                <span className="text-xl sm:text-2xl font-light">$0.00</span>
              </div>
              <button className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-white text-black hover:bg-gray-200 transition-colors">
                <span className="text-xs sm:text-sm font-light tracking-widest">
                  PROCEED TO CHECKOUT
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
