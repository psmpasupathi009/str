import Image from "next/image";
import { getProductById, products } from "@/lib/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO PRODUCTS</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square overflow-hidden border border-white/10">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden border border-white/10"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            <div className="mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm text-gray-400 font-light tracking-wider">
                {product.category.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 sm:mb-6">
              {product.name.toUpperCase()}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light mb-6 sm:mb-8 leading-relaxed">
              {product.description}
            </p>
            {product.details && (
              <p className="text-sm sm:text-base text-gray-400 font-light mb-6 sm:mb-8 leading-relaxed">
                {product.details}
              </p>
            )}
            <div className="mb-6 sm:mb-8">
              <span className="text-3xl sm:text-4xl font-light tracking-wide">
                ${product.price.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all group">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-light tracking-widest">
                  ADD TO CART
                </span>
              </button>
              <button className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 border border-white/20 hover:border-white/40 transition-all">
                <span className="text-xs sm:text-sm font-light tracking-widest">
                  BUY NOW
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
