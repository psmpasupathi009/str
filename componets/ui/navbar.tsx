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

  // Load cart items count
  const loadCartCount = () => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          const items: CartItem[] = JSON.parse(storedCart);
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartItemCount(totalItems);
        } catch (e) {
          console.error("Error loading cart:", e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
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

  // Load cart count on mount and listen for changes
  useEffect(() => {
    loadCartCount();

    // Listen for storage events (cart updates from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        loadCartCount();
      }
    };

    // Listen for custom cart update events (same tab)
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleCartUpdate);

    // Poll for cart changes (in case storage event doesn't fire in same tab)
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

            

            {/* Right Side Icons */}
            <div className="flex items-center gap-3 sm:gap-6">
              {user ? (
                <Link
                  href="/home/profile"
                  className="text-white hover:text-green-100 transition-colors"
                  title="Profile"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              ) : (
                <Link
                  href="/home/signin"
                  className="text-white hover:text-green-100 transition-colors text-xs sm:text-sm font-light tracking-wider"
                >
                  SIGN IN
                </Link>
              )}
              <Link
                href="/home/cart"
                className="text-white hover:text-green-100 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] sm:text-xs rounded-full min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center font-semibold px-1">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Overlay - Slides from top */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-green-900/40 backdrop-blur-md z-60"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel - Slides from top */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 z-70 bg-green-600/90 backdrop-blur-lg border-b border-green-300/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
                {/* Close Button */}
                <div className="flex justify-end mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-1.5 sm:gap-2 text-white hover:text-green-100 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="text-[10px] xs:text-xs sm:text-sm font-light tracking-wider">CLOSE</span>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                  <Link
                    href="/"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-green-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    HOME
                  </Link>
                  <Link
                    href="/home/products"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-green-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    PRODUCTS
                  </Link>
                  <Link
                    href="/home/about"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-green-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ABOUT
                  </Link>
                  <Link
                    href="/home/contact"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-green-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CONTACT
                  </Link>
                  <Link
                    href="/home/track-order"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-green-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    TRACK ORDER
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
