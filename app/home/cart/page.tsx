"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import RazorpayButton from "@/componets/ui/razorpay-button";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const loadCart = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        setCartItems(items);
        const totalAmount = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
        setTotal(totalAmount);
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  };

  useEffect(() => {
    loadCart();
    // Listen for cart updates from other tabs/windows
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  const removeFromCart = (productId: string) => {
    const updatedItems = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("cartUpdated"));
    const totalAmount = updatedItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    setTotal(totalAmount);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("cartUpdated"));
    const totalAmount = updatedItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    setTotal(totalAmount);
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">CONTINUE SHOPPING</span>
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-8 sm:mb-12">
          SHOPPING CART
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <ShoppingCart className="w-16 h-16 sm:w-24 sm:h-24 text-green-400 mb-4 sm:mb-6" />
            <p className="text-lg sm:text-xl text-slate-600 font-light tracking-wide mb-4 sm:mb-6">
              Your cart is empty
            </p>
            <Link
              href="/home/products"
              className="px-6 sm:px-8 py-3 sm:py-4 border border-green-600 hover:border-green-700 bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              <span className="text-xs sm:text-sm font-light tracking-widest">
                BROWSE PRODUCTS
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border border-green-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-light mb-2">{item.productName}</h3>
                  <p className="text-sm sm:text-base text-slate-600">${item.price.toLocaleString()} each</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 text-green-700 transition-all"
                    >
                      <span className="text-sm">−</span>
                    </button>
                    <span className="text-base sm:text-lg font-light w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 text-green-700 transition-all"
                    >
                      <span className="text-sm">+</span>
                    </button>
                  </div>
                  <div className="text-lg sm:text-xl font-light w-24 sm:w-32 text-right">
                    ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t border-green-200 pt-6 sm:pt-8">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <span className="text-lg sm:text-xl font-light tracking-wide">TOTAL</span>
                <span className="text-xl sm:text-2xl font-light">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Link
                href="/home/checkout"
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white hover:bg-green-700 transition-colors text-center block"
              >
                <span className="text-xs sm:text-sm font-light tracking-widest">
                  PROCEED TO CHECKOUT
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
