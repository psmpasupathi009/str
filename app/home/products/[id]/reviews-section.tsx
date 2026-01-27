"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProductReviews from "@/componets/ui/product-reviews";
import ReviewForm from "@/componets/ui/review-form";

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <section className="mt-12 sm:mt-16 md:mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-linear-to-r from-green-500 to-green-400 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Customer Reviews
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-light ml-16">
            Real experiences from verified customers
          </p>
        </motion.div>
        
        {/* Review Form Section */}
        <div className="mb-8 sm:mb-10">
          <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
        </div>

        {/* Product Reviews Section */}
        <ProductReviews productId={productId} refreshTrigger={refreshTrigger} />
      </div>
    </section>
  );
}
