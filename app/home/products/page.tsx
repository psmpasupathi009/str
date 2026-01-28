"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductsGrid from "@/components/shared/products-grid";
import { Search, Filter, X } from "lucide-react";

type SortOption = "default" | "price-low" | "price-high" | "name-asc" | "name-desc";

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

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set initial category from URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products?limit=1000&inStock=true"),
          fetch("/api/categories"),
        ]);

        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.products) {
          // Map database products to expected format
          const mappedProducts: Product[] = productsData.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            price: p.salePrice,
            image: p.image || "/placeholder-product.jpg",
            category: p.category?.name || "",
            featured: p.featured,
            bestSeller: p.bestSeller,
            inStock: p.inStock,
          }));
          setProducts(mappedProducts);

          // Calculate price range
          if (mappedProducts.length > 0) {
            const prices = mappedProducts.map((p) => p.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setPriceRange([min, max]);
          }
        }

        if (categoriesRes.ok && categoriesData.categories) {
          setCategories(categoriesData.categories);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all products filtered by category
  const categoryProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    // Match category by name (case-insensitive)
    return products.filter((p) => 
      p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory, products]);

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
          (product.category?.toLowerCase() || "").includes(query)
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
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 10000;
  const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0;

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange([0, maxPrice]);
    setSortBy("default");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || priceRange[0] > 0 || priceRange[1] < maxPrice || sortBy !== "default";

  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-100 to-green-200 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-light">Loading products...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-100 to-green-200 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center py-20 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-red-600 font-light text-lg mb-2">Error Loading Products</p>
            <p className="text-red-500 font-light text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-red-600 text-red-600 hover:bg-red-50 transition-colors rounded text-sm font-light"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-green-100 to-green-200 pt-16 sm:pt-20">
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
                className="w-full pl-12 pr-4 py-3 border border-green-700 bg-white focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-200 transition-colors text-sm sm:text-base"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(16 185 129)' }}
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
                    ? "border-green-700 text-white bg-green-600"
                    : "border-green-700 text-slate-700 hover:border-green-700 hover:text-green-700 bg-white"
                }`}
              >
                ALL
              </button>
              {categories.map((category) => {
                const isSelected = selectedCategory.toLowerCase() === category.name.toLowerCase();
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 border transition-all text-sm sm:text-base font-light tracking-wider rounded ${
                      isSelected
                        ? "border-green-700 text-white bg-green-600"
                        : "border-green-700 text-slate-700 hover:border-green-700 hover:text-green-700 bg-white"
                    }`}
                  >
                    {category.name.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Sort and Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-green-700 hover:border-green-700 bg-white hover:bg-green-50 text-slate-700 hover:text-green-700 transition-all rounded"
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-light tracking-wider">FILTERS</span>
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-green-700 focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-200 bg-white text-slate-700 text-xs sm:text-sm font-light tracking-wider rounded"
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
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-light rounded flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-green-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-light rounded flex items-center gap-2">
                  Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                  <button onClick={() => setPriceRange([0, maxPrice])} className="hover:text-green-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortBy !== "default" && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-light rounded flex items-center gap-2">
                  Sorted
                  <button onClick={() => setSortBy("default")} className="hover:text-green-900">
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
          <div className="mb-6 border border-green-200 bg-white shadow-sm rounded-lg p-6">
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
          {filteredProducts.length === 0 && products.length > 0 && " (filtered)"}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductsGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-20 border border-green-200 bg-white rounded-lg">
            <p className="text-slate-600 font-light text-lg mb-2">No products found</p>
            <p className="text-slate-500 font-light text-sm">
              Try adjusting your filters or search query
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 border border-green-700 text-green-600 hover:bg-green-50 transition-colors rounded text-sm font-light"
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-linear-to-b from-green-100 to-green-200 pt-16 sm:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-light">Loading products...</p>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
