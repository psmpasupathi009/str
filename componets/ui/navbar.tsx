"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
            <Link
              href="/profile"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black z-40 pt-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-6 sm:gap-8 py-8 sm:py-12">
                <Link
                  href="/"
                  className="text-white text-xl sm:text-2xl font-light tracking-wider hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  HOME
                </Link>
                <Link
                  href="/products"
                  className="text-white text-xl sm:text-2xl font-light tracking-wider hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  PRODUCTS
                </Link>
                <Link
                  href="/about"
                  className="text-white text-xl sm:text-2xl font-light tracking-wider hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ABOUT
                </Link>
                <Link
                  href="/contact"
                  className="text-white text-xl sm:text-2xl font-light tracking-wider hover:text-gray-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CONTACT
                </Link>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 left-4 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
