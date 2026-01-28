"use client";

import ProductCard from "./product-card";
import Button from "@/components/ui/button";

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
    <section className="py-12 sm:py-16 md:py-20 bg-linear-to-b from-green-100 to-green-200 text-slate-900 border-t border-green-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3 sm:mb-4">
              {category.toUpperCase()}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-light tracking-wide">
              Discover our curated selection of {category.toLowerCase()} products.
            </p>
          </div>
          <Button
            asLink
            href={`/home/products?category=${category.toLowerCase()}`}
            variant="primary"
            size="md"
            showArrow
          >
            VIEW ALL
          </Button>
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
