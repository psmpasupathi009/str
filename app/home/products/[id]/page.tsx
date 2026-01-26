import Image from "next/image";
import { getProductById, products } from "@/lib/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BuyNowButton from "@/componets/ui/buy-now-button";
import AddToCartButton from "@/componets/ui/add-to-cart-button";
import ReviewsSection from "./reviews-section";
import ProductRating from "@/componets/ui/product-rating";

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
    <main className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          href="/home/products"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO PRODUCTS</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square overflow-hidden border border-sky-200 bg-white shadow-sm">
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
                    className="relative aspect-square overflow-hidden border border-sky-200 bg-white shadow-sm"
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
              <span className="text-xs sm:text-sm text-slate-600 font-light tracking-wider">
                {product.category.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-3 sm:mb-4 text-slate-900">
              {product.name.toUpperCase()}
            </h1>
            {/* Product Rating */}
            <div className="mb-4 sm:mb-6">
              <ProductRating productId={product.id} showCount size="md" />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 font-light mb-6 sm:mb-8 leading-relaxed">
              {product.description}
            </p>
            {product.details && (
              <p className="text-sm sm:text-base text-slate-600 font-light mb-6 sm:mb-8 leading-relaxed">
                {product.details}
              </p>
            )}
            <div className="mb-6 sm:mb-8">
              <span className="text-3xl sm:text-4xl font-light tracking-wide text-slate-900">
                ${product.price.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border border-sky-600 hover:border-sky-700 bg-sky-600 text-white hover:bg-sky-700 transition-all group"
              />
              <BuyNowButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 border border-sky-600 hover:border-sky-700 bg-sky-600 text-white hover:bg-sky-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />
      </div>
    </main>
  );
}
