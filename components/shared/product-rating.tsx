"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ProductRatingProps {
  productId: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProductRating({
  productId,
  showCount = false,
  size = "md",
  className = "",
}: ProductRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          const reviews = data.reviews || [];
          
          if (reviews.length > 0) {
            const avgRating =
              reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
              reviews.length;
            setRating(avgRating);
            setReviewCount(reviews.length);
          } else {
            setRating(null);
            setReviewCount(0);
          }
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
        setRating(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [productId]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`text-slate-300 ${
                size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (rating === null) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs sm:text-sm text-slate-400 font-light">No ratings yet</span>
      </div>
    );
  }

  const roundedRating = Math.round(rating * 10) / 10;
  const displayStars = Math.round(rating);

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`transition-all ${
              star <= displayStars
                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                : "text-slate-300"
            } ${
              size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span
          className={`text-slate-700 font-medium ${
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-xs sm:text-sm"
          }`}
        >
          {roundedRating.toFixed(1)}
        </span>
        {showCount && reviewCount > 0 && (
          <span
            className={`text-slate-500 font-light ${
              size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"
            }`}
          >
            ({reviewCount})
          </span>
        )}
      </div>
    </div>
  );
}
