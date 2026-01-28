"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductRating from "./product-rating";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <Link href={`/home/products/${product.id}`}>
        <div className="relative overflow-hidden bg-white border border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Badges */}
          {(product.bestSeller || product.featured) && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              {product.bestSeller && (
                <span className="px-2 py-1 text-xs font-light tracking-wider bg-white text-black">
                  BEST SELLER
                </span>
              )}
              {product.featured && (
                <span className="px-2 py-1 text-xs font-light tracking-wider bg-white/90 text-black">
                  FEATURED
                </span>
              )}
            </div>
          )}

          {/* Image Container */}
          <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-product.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200">
                <span className="text-slate-400 text-xs font-light">No Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-green-600/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 text-slate-900">
            <h3 className="text-base sm:text-lg md:text-xl font-light tracking-wider mb-2 group-hover:text-green-700 transition-colors">
              {product.name.toUpperCase()}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-light mb-3 sm:mb-4 line-clamp-2">
              {product.description}
            </p>
            {/* Rating - Enhanced */}
            <div className="mb-3 sm:mb-4 flex items-center gap-2">
              <ProductRating productId={product.id} showCount size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-light tracking-wide">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.inStock === false && (
                  <span className="text-xs text-red-600 font-light">Out of Stock</span>
                )}
              </div>
              <motion.div
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-light tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ x: 5 }}
              >
                <span className="hidden sm:inline">EXPLORE</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
