"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, ShoppingCart, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1 sm:gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-light tracking-wider hidden xs:inline">
                MENU
              </span>
            </button>

            {/* Logo - Centered */}
            <Link href="/" className="flex flex-col items-center">
              <div className="text-white text-xl sm:text-2xl font-light tracking-[0.2em] sm:tracking-[0.3em]">
                STR
              </div>
              <div className="text-white/60 text-[10px] sm:text-xs font-light tracking-widest mt-0.5 sm:mt-1">
                E-COMMERCE
              </div>
            </Link>

            {/* Right Side Icons */}
            <div className="flex items-center gap-3 sm:gap-6">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-white hover:text-gray-300 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="text-white hover:text-gray-300 transition-colors text-xs sm:text-sm font-light tracking-wider"
                >
                  SIGN IN
                </Link>
              )}
              <Link
                href="/cart"
                className="text-white hover:text-gray-300 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold">
                  0
                </span>
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
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel - Slides from top */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 z-[70] bg-black/90 backdrop-blur-lg border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
                {/* Close Button */}
                <div className="flex justify-end mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-1.5 sm:gap-2 text-white hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="text-[10px] xs:text-xs sm:text-sm font-light tracking-wider">CLOSE</span>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2 sm:gap-3 md:gap-4">
                  <Link
                    href="/"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    HOME
                  </Link>
                  <Link
                    href="/products"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    PRODUCTS
                  </Link>
                  <Link
                    href="/about"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ABOUT
                  </Link>
                  <Link
                    href="/contact"
                    className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-light tracking-wider hover:text-gray-300 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CONTACT
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
