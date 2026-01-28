import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Percent, CheckCircle, XCircle } from "lucide-react";
import BuyNowButton from "@/componets/ui/buy-now-button";
import AddToCartButton from "@/componets/ui/add-to-cart-button";
import ProductImageGallery from "@/componets/ui/product-image-gallery";
import ReviewsSection from "./reviews-section";
import ProductRating from "@/componets/ui/product-rating";
import { prisma } from "@/lib/prisma";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  // Fetch product directly from database
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Map database product to expected format
  // Combine main image with additional images, ensuring we have all 5 images
  const productImage = product.image || "/placeholder-product.jpg";
  const additionalImages = product.images && product.images.length > 0 
    ? product.images.filter(img => img && img.trim().length > 0 && img !== productImage)
    : [];
  
  // Combine all images (main image first, then additional images)
  const productImages = [productImage, ...additionalImages].slice(0, 5);
  
  // Calculate discount percentage
  const discountPercentage = product.mrp > product.salePrice 
    ? Math.round(((product.mrp - product.salePrice) / product.mrp) * 100)
    : 0;
  
  // Calculate price with GST
  const priceWithGST = product.salePrice * (1 + product.gst);
  const gstAmount = product.salePrice * product.gst;

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link
          href="/home/products"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">BACK TO PRODUCTS</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Image Gallery */}
          <ProductImageGallery
            mainImage={productImage}
            images={productImages}
            productName={product.name}
          />

          {/* Product Details */}
          <div className="flex flex-col justify-center">
            {/* Category and Badges */}
            <div className="mb-3 sm:mb-4 flex items-center gap-3 flex-wrap">
              <span className="text-xs sm:text-sm text-slate-600 font-light tracking-wider">
                {product.category?.name?.toUpperCase() || "PRODUCT"}
              </span>
              {product.featured && (
                <span className="px-2 py-1 text-xs font-light tracking-wider bg-green-100 text-green-700 border border-green-300">
                  FEATURED
                </span>
              )}
              {product.bestSeller && (
                <span className="px-2 py-1 text-xs font-light tracking-wider bg-green-100 text-green-700 border border-green-300">
                  BEST SELLER
                </span>
              )}
              {product.inStock ? (
                <span className="px-2 py-1 text-xs font-light tracking-wider bg-green-100 text-green-700 border border-green-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  IN STOCK
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-light tracking-wider bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  OUT OF STOCK
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-3 sm:mb-4 text-slate-900">
              {product.name.toUpperCase()}
            </h1>

            {/* Product Rating */}
            <div className="mb-4 sm:mb-6">
              <ProductRating productId={product.id} showCount size="md" />
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-base sm:text-lg md:text-xl text-slate-700 font-light mb-6 sm:mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price Section */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 border border-green-200 bg-white rounded-lg">
              <div className="space-y-3">
                {product.mrp > product.salePrice && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl text-slate-500 line-through">
                      MRP: ₹{product.mrp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="px-2 py-1 text-xs sm:text-sm font-light bg-red-100 text-red-700 border border-red-300 flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-light tracking-wide text-slate-900">
                    ₹{product.salePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-sm text-slate-600 font-light">(Excluding GST)</span>
                </div>
                <div className="pt-2 border-t border-green-100 space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-light">Price:</span>
                    <span className="font-light">₹{product.salePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-light">GST ({(product.gst * 100).toFixed(0)}%):</span>
                    <span className="font-light">₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-green-100 font-medium text-slate-900">
                    <span>Total Price:</span>
                    <span>₹{priceWithGST.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {product.inStock ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  price={product.salePrice}
                  className="flex-1"
                />
                <BuyNowButton
                  productId={product.id}
                  productName={product.name}
                  price={product.salePrice}
                  className="flex-1 sm:flex-none"
                />
              </div>
            ) : (
              <div className="px-6 sm:px-8 py-3 sm:py-4 border border-slate-300 bg-slate-100 text-slate-600 text-center rounded mb-6 sm:mb-8">
                <p className="text-sm sm:text-base font-light">OUT OF STOCK</p>
              </div>
            )}

            {/* Product Specifications */}
            <div className="border border-green-200 bg-white rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-light tracking-wide mb-4 sm:mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                PRODUCT DETAILS
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-slate-500 font-light mb-1">Item Code</span>
                  <span className="text-sm sm:text-base text-slate-900 font-light">{product.itemCode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-slate-500 font-light mb-1">Weight</span>
                  <span className="text-sm sm:text-base text-slate-900 font-light">{product.weight}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-slate-500 font-light mb-1">HSN Code</span>
                  <span className="text-sm sm:text-base text-slate-900 font-light">{product.hsnCode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-slate-500 font-light mb-1">GST Rate</span>
                  <span className="text-sm sm:text-base text-slate-900 font-light">{(product.gst * 100).toFixed(0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-slate-500 font-light mb-1">Category</span>
                  <span className="text-sm sm:text-base text-slate-900 font-light">{product.category?.name || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-slate-500 font-light mb-1">Stock Status</span>
                  <span className={`text-sm sm:text-base font-light ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product.id} />
      </div>
    </main>
  );
}
