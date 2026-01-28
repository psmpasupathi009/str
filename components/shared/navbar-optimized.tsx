"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user } = useAuth();

  // Load cart items count from localStorage (same source as cart page)
  const loadCartCount = () => {
    if (typeof window === "undefined") return;

    const storedCart = localStorage.getItem("cart");
    if (!storedCart) {
      setCartItemCount(0);
      return;
    }

    try {
      const items: CartItem[] = JSON.parse(storedCart);
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    } catch (e) {
      console.error("Error loading cart:", e);
      setCartItemCount(0);
    }
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Keep cart count in sync with localStorage and custom events
  useEffect(() => {
    loadCartCount();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        loadCartCount();
      }
    };

    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);

    const interval = setInterval(loadCartCount, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-green-800/95 backdrop-blur-sm border-b border-green-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1 sm:gap-2 text-white hover:text-green-100 transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-light tracking-wider hidden xs:inline">
                MENU
              </span>
            </button>

            {/* Company Name - Center */}
            <Link
              href="/"
              className="flex-1 flex items-center justify-center text-white hover:text-green-100 transition-colors"
            >
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-[0.1em] sm:tracking-[0.2em]">
                STN GOLDEN HEALTHY FOODS
              </h1>
            </Link>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* User Icon */}
              {user ? (
                <Link
                  href="/home/profile"
                  className="text-white hover:text-green-100 transition-colors"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              ) : (
                <Link
                  href="/home/signin"
                  className="text-white hover:text-green-100 transition-colors"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              )}

              {/* Cart Icon with Count */}
              <Link
                href="/home/cart"
                className="relative text-white hover:text-green-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-64 sm:w-80 bg-green-800/98 backdrop-blur-sm z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-green-700/20">
                  <h2 className="text-white text-sm font-light tracking-wider">MENU</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-green-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2">
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                  >
                    HOME
                  </Link>
                  <Link
                    href="/home/products"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                  >
                    PRODUCTS
                  </Link>
                  <Link
                    href="/home/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                  >
                    ABOUT
                  </Link>
                  <Link
                    href="/home/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                  >
                    CONTACT
                  </Link>
                  {user && (
                    <>
                      <div className="border-t border-green-700/20 my-4"></div>
                      <Link
                        href="/home/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                      >
                        MY ORDERS
                      </Link>
                      <Link
                        href="/home/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                      >
                        PROFILE
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/home/admin/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-white hover:text-green-100 transition-colors py-2 text-sm font-light tracking-wider"
                        >
                          ADMIN DASHBOARD
                        </Link>
                      )}
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
