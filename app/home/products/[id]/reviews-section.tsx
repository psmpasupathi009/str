"use client";

import { useState } from "react";
import ProductReviews from "@/componets/ui/product-reviews";
import ReviewForm from "@/componets/ui/review-form";

interface ReviewsSectionProps {
  productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewSubmitted = () => {
    // Trigger refresh by updating the trigger value
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="mt-12 sm:mt-16 md:mt-20 space-y-12 sm:space-y-16">
      {/* Review Form */}
      <div className="max-w-4xl mx-auto">
        <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={productId} refreshTrigger={refreshTrigger} />
    </div>
  );
}
