"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-linear-to-b from-green-100 to-green-200 overflow-hidden text-slate-900">
      {/* Subtle Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(22, 101, 52, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(22, 101, 52, 0.03) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content - Centered */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 md:py-20">
        <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light tracking-tight mb-4 sm:mb-6 text-slate-900">
              <span className="font-light">STN GOLDEN</span>
              <br />
              <span className="font-light">HEALTHY FOODS</span>
            </h1>
          </motion.div>

          {/* Divider Line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-24 h-0.5 bg-linear-to-r from-green-700 to-green-600 mx-auto"
          />

          {/* Tagline */}
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-slate-600 font-light tracking-wide max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Premium Quality Natural & Healthy Food Products
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-slate-500 font-light leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Discover our collection of fresh, organic, and nutritious food products 
            sourced from nature&apos;s finest ingredients.
          </motion.p>

          {/* Shop Now Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="pt-4 sm:pt-6"
          >
            <Link
              href="/home/products"
              className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 border border-green-600 hover:border-green-700 bg-white hover:bg-green-50 text-slate-700 hover:text-green-800 font-light tracking-widest text-sm sm:text-base md:text-lg transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <span>SHOP NOW</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-12 sm:h-16 bg-linear-to-b from-green-600 to-transparent"></div>
      </motion.div>
    </section>
  );
}
