"use client";

import ProductCard from "./product-card";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductsGridProps {
  products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-linear-to-b from-sky-50 to-sky-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 md:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-3 sm:mb-4">
            DISCOVER OUR
            <br />
            <span className="font-extralight">COLLECTION</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light tracking-wide max-w-2xl mx-auto px-4">
            With flawless performance and superior craftsmanship, each piece was
            designed to exhilarate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
