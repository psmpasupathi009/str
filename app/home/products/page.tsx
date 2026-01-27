"use client";

import { useState, useMemo } from "react";
import ProductsGrid from "@/componets/ui/products-grid";
import { products, getAllCategories, getProductsByCategory } from "@/lib/products";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";

type SortOption = "default" | "price-low" | "price-high" | "name-asc" | "name-desc";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = getAllCategories();

  // Get all products
  const categoryProducts = useMemo(() => {
    return selectedCategory === "all" ? products : getProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Price range filter
    result = result.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [categoryProducts, searchQuery, priceRange, sortBy]);

  // Get price range from products
  const maxPrice = Math.max(...products.map((p) => p.price));
  const minPrice = Math.min(...products.map((p) => p.price));

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, maxPrice]);
    setSortBy("default");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || priceRange[0] > 0 || priceRange[1] < maxPrice || sortBy !== "default";

  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-6 sm:mb-8 text-slate-900">
            ALL PRODUCTS
          </h1>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border border-sky-300 bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors text-sm sm:text-base"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 sm:px-6 py-2 sm:py-3 border transition-all text-sm sm:text-base font-light tracking-wider rounded ${
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
                  className={`px-4 sm:px-6 py-2 sm:py-3 border transition-all text-sm sm:text-base font-light tracking-wider rounded ${
                    selectedCategory === category
                      ? "border-sky-600 text-white bg-sky-600"
                      : "border-sky-300 text-slate-700 hover:border-sky-500 hover:text-sky-700 bg-white"
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sort and Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-sky-300 hover:border-sky-500 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition-all rounded"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-light tracking-wider">FILTERS</span>
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-sky-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 bg-white text-slate-700 text-xs sm:text-sm font-light tracking-wider rounded"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-slate-600 font-light">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-light rounded flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-sky-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-light rounded flex items-center gap-2">
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                  <button onClick={() => setPriceRange([0, maxPrice])} className="hover:text-sky-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortBy !== "default" && (
                <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-light rounded flex items-center gap-2">
                  Sorted
                  <button onClick={() => setSortBy("default")} className="hover:text-sky-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-xs font-light text-slate-600 hover:text-slate-900 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 border border-sky-200 bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-light tracking-wide">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 font-light mb-2">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>₹{minPrice}</span>
                  <span>₹{maxPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-600 font-light">
          Showing {filteredProducts.length} of {categoryProducts.length} products
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductsGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-20 border border-sky-200 bg-white rounded-lg">
            <p className="text-slate-600 font-light text-lg mb-2">No products found</p>
            <p className="text-slate-500 font-light text-sm">
              Try adjusting your filters or search query
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 border border-sky-600 text-sky-600 hover:bg-sky-50 transition-colors rounded text-sm font-light"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
