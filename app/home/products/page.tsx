"use client";

import { useState } from "react";
import ProductsGrid from "@/componets/ui/products-grid";
import { products, getAllCategories, getProductsByCategory } from "@/lib/products";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categories = getAllCategories();

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : getProductsByCategory(selectedCategory);

  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Filter */}
        <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-6 sm:mb-8 text-slate-900">
            ALL PRODUCTS
          </h1>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 sm:px-6 py-2 sm:py-3 border transition-all text-sm sm:text-base font-light tracking-wider ${
                selectedCategory === "all"
                  ? "border-sky-600 text-white bg-sky-600"
                  : "border-sky-300 text-slate-700 hover:border-sky-500 hover:text-sky-700 bg-white"
              }`}
            >
              ALL
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2 sm:py-3 border transition-all text-sm sm:text-base font-light tracking-wider ${
                  selectedCategory === category
                    ? "border-sky-600 text-white bg-sky-600"
                    : "border-sky-300 text-slate-700 hover:border-sky-500 hover:text-sky-700 bg-white"
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductsGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-600 font-light text-lg">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
