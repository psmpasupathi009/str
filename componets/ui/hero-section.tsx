"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import CategoryLogoCloud from "./category-logo-cloud";

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Green base background */}
        <div className="absolute inset-0 bg-linear-to-br from-green-600 via-green-700 to-emerald-800">
          <Image
            src="/images/favpng_4e520959091f8551d137977200997266.png"
            alt="Traditional Heritage Background"
            fill
            priority
            className="object-cover object-center opacity-25 mix-blend-overlay"
            quality={90}
            sizes="100vw"
          />
        </div>
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-linear-to-b from-green-900/60 via-green-800/50 to-green-900/70" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-green-600/10 via-transparent to-emerald-600/10" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(34, 197, 94, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.15) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full h-screen flex items-center justify-center py-4 sm:py-6 md:py-8">
        <div className="flex flex-col items-center justify-center text-center w-full space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-4">
          {/* Brand Name with enhanced styling - Responsive */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight">
            <span className="block bg-linear-to-r from-white via-green-50 to-white bg-clip-text text-transparent drop-shadow-2xl">
              STN GOLDEN
            </span>
            <span className="block mt-0.5 sm:mt-1 md:mt-1.5 bg-linear-to-r from-white via-green-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              HEALTHY FOODS
            </span>
          </h1>

          {/* Logo - Responsive */}
          <div className="relative w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] xl:max-w-[320px] aspect-[1.4] mx-auto">
            <div className="relative w-full h-full">
              <Image
                src="/images/ghf.jpg"
                alt="STN Golden Healthy Foods"
                fill
                priority
                sizes="(max-width: 640px) 160px, (max-width: 768px) 200px, (max-width: 1024px) 240px, 280px"
                className="object-contain drop-shadow-2xl"
              />
              {/* Glow effect around logo */}
              <div className="absolute inset-0 bg-green-500/30 blur-3xl -z-10 rounded-full" />
            </div>
          </div>

          {/* Tagline with enhanced styling - Responsive */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/95 font-light tracking-wide max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto leading-snug drop-shadow-lg px-2">
            Premium Quality Natural & Healthy Food Products
          </p>

          {/* Decorative Sparkles - Responsive */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-white/80">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="text-[10px] sm:text-xs font-light tracking-widest uppercase">
              Pure • Natural • Authentic
            </span>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>

          {/* CTA Button - Responsive */}
          <div className="pt-1 sm:pt-1.5 md:pt-2">
            <Link href="/home/products">
              <button className="group relative inline-flex items-center gap-2 sm:gap-2.5 px-5 sm:px-7 md:px-9 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl bg-linear-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold text-xs sm:text-sm md:text-base tracking-wide shadow-2xl hover:shadow-green-500/50 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  Shop Now
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </Link>
          </div>

          {/* Category Logo Cloud - Compact spacing */}
          <div className="w-full mt-2 sm:mt-3 md:mt-4">
            <CategoryLogoCloud />
          </div>
        </div>
      </div>
    </section>
  );
}
