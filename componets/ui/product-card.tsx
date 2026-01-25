"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
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
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden bg-black border border-white/10 hover:border-white/20 transition-all duration-300">
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
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 text-white">
            <h3 className="text-base sm:text-lg md:text-xl font-light tracking-wider mb-2 group-hover:text-gray-300 transition-colors">
              {product.name.toUpperCase()}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-light mb-3 sm:mb-4 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-light tracking-wide">
                ${product.price.toLocaleString()}
              </span>
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
