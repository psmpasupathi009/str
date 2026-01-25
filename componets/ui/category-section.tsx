"use client";

import ProductCard from "./product-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

interface CategorySectionProps {
  category: string;
  products: Product[];
  limit?: number;
}

export default function CategorySection({
  category,
  products,
  limit = 3,
}: CategorySectionProps) {
  const displayProducts = products.slice(0, limit);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3 sm:mb-4">
              {category.toUpperCase()}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-light tracking-wide">
              Discover our curated selection of {category.toLowerCase()} products.
            </p>
          </div>
          <Link
            href={`/products?category=${category.toLowerCase()}`}
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all group"
          >
            <span className="text-xs sm:text-sm font-light tracking-widest">
              VIEW ALL
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
