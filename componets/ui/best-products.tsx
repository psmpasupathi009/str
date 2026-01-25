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
  featured?: boolean;
  bestSeller?: boolean;
}

interface BestProductsProps {
  products: Product[];
}

export default function BestProducts({ products }: BestProductsProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 md:mb-16 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-3 sm:mb-4">
              BEST
              <br />
              <span className="font-extralight">PRODUCTS</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-light tracking-wide max-w-2xl">
              Our most popular and highly rated products, chosen for their exceptional quality and craftsmanship.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all group"
          >
            <span className="text-xs sm:text-sm font-light tracking-widest">
              VIEW ALL
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {products.slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
