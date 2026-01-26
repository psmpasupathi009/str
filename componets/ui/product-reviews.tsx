"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductReviewsProps {
  productId: string;
  refreshTrigger?: number;
}

export default function ProductReviews({ productId, refreshTrigger }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <p className="mt-4 text-slate-600 font-light">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 font-light">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-br from-sky-100 to-sky-200 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-sky-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-light tracking-wider mb-3 text-slate-900">
              No Reviews Yet
            </h3>
            <p className="text-slate-600 font-light text-lg">
              Be the first to share your experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Calculate average rating and distribution
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Overall Rating Card */}
            <div className="lg:w-1/3">
              <div className="p-8 bg-linear-to-br from-white via-sky-50/50 to-white rounded-3xl border border-sky-200/50 shadow-xl shadow-sky-100/50 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <div className="text-5xl sm:text-6xl font-light mb-2 text-slate-900">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 font-light text-sm">
                    Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3 mt-6 pt-6 border-t border-sky-200">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-xs text-slate-600">{star}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-sky-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: star * 0.1 }}
                          className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-slate-900">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-2 text-sky-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-light">{reviews.length} Total</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 bg-linear-to-br from-white via-sky-50/30 to-white rounded-2xl border border-sky-200/50 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                        selectedReview === index ? "ring-2 ring-sky-400" : ""
                      }`}
                      onClick={() => setSelectedReview(selectedReview === index ? null : index)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-medium text-sm">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{review.userName}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-xs text-slate-500">
                              {review.rating} out of 5
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700 font-light leading-relaxed">
                        {review.comment}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
