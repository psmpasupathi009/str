"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, ThumbsUp, ChevronDown, ChevronUp, Verified, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductReviewsProps {
  productId: string;
  refreshTrigger?: number;
}

export default function ProductReviews({ productId, refreshTrigger }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [helpfulStatus, setHelpfulStatus] = useState<Record<string, boolean>>({});
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

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

      if (user) {
        const helpfulPromises = (data.reviews || []).map(async (review: Review) => {
          const helpfulResponse = await fetch(
            `/api/reviews/helpful?reviewId=${review.id}&userId=${user.id}`
          );
          if (helpfulResponse.ok) {
            const helpfulData = await helpfulResponse.json();
            return { reviewId: review.id, helpful: helpfulData.helpful };
          }
          return { reviewId: review.id, helpful: false };
        });

        const helpfulResults = await Promise.all(helpfulPromises);
        const helpfulMap: Record<string, boolean> = {};
        helpfulResults.forEach(({ reviewId, helpful }) => {
          helpfulMap[reviewId] = helpful;
        });
        setHelpfulStatus(helpfulMap);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger, user]);

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      return;
    }

    try {
      const response = await fetch("/api/reviews/helpful", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          userId: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHelpfulStatus((prev) => ({
          ...prev,
          [reviewId]: data.helpful,
        }));

        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpfulCount: data.helpful
                    ? review.helpfulCount + 1
                    : Math.max(0, review.helpfulCount - 1),
                }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Error toggling helpful:", error);
    }
  };

  const toggleReviewExpanded = (reviewId: string) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="py-16 sm:py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-sky-600 border-t-transparent"></div>
          <p className="mt-6 text-base sm:text-lg text-slate-600 font-light">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 sm:py-20">
        <div className="text-center p-6 bg-red-50 border-2 border-red-200 rounded-2xl max-w-md mx-auto">
          <p className="text-red-600 text-base sm:text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-16 sm:py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-sky-100 to-sky-200 mb-6">
          <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-sky-500" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">No reviews yet</h3>
        <p className="text-base sm:text-lg text-slate-600 font-light">Be the first to share your experience!</p>
      </div>
    );
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="border-t border-sky-200/60 pt-6 sm:pt-8">
      <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 lg:gap-10">
        {/* Rating Summary - Left Sidebar */}
        <div className="xl:w-96 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="sticky top-6 bg-linear-to-br from-white via-sky-50/30 to-white rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-sky-200/60"
          >
            {/* Average Rating */}
            <div className="text-center mb-8 pb-8 border-b-2 border-sky-200/60">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-5xl sm:text-6xl font-bold text-slate-900">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-base sm:text-lg text-slate-700 font-semibold">
                Based on <span className="text-sky-600">{reviews.length}</span> {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Rating Breakdown</h4>
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-700 w-6">{star}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{count}</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: star * 0.1 }}
                      className="h-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews List - Scrollable */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </h3>
              <div className="flex items-center gap-1 text-sky-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold">Verified</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6 max-h-[750px] overflow-y-auto pr-3 sm:pr-5 custom-scrollbar">
            <AnimatePresence>
              {reviews.map((review, index) => {
                const isExpanded = expandedReviews.has(review.id);
                const COMMENT_PREVIEW_LENGTH = 200;
                const isLongComment = review.comment.length > COMMENT_PREVIEW_LENGTH;
                const displayComment = isLongComment && !isExpanded
                  ? review.comment.substring(0, COMMENT_PREVIEW_LENGTH).trim() + "..."
                  : review.comment;

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-sky-100/60 hover:shadow-xl hover:border-sky-200/80 transition-all duration-300"
                  >
                    {/* Review Header */}
                    <div className="flex items-start gap-4 sm:gap-5 mb-5">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center shadow-lg">
                          <span className="text-lg sm:text-xl font-bold text-white">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                          <Verified className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                          <span className="text-base sm:text-lg font-bold text-slate-900">
                            {review.userName}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 font-medium">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm sm:text-base font-bold text-slate-700">
                            {review.rating}.0 out of 5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <div className="mb-6">
                      <p className="text-base sm:text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-light">
                        {displayComment}
                      </p>
                      {isLongComment && (
                        <button
                          onClick={() => toggleReviewExpanded(review.id)}
                          className="text-sm sm:text-base text-sky-600 hover:text-sky-700 mt-3 flex items-center gap-2 font-semibold hover:underline transition-colors group"
                          type="button"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                              <span>Show less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                              <span>Read more</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Helpful Button */}
                    <div className="flex items-center gap-4 pt-5 border-t-2 border-sky-100/60">
                      <motion.button
                        onClick={() => handleHelpful(review.id)}
                        disabled={!user}
                        whileHover={{ scale: user ? 1.08 : 1, y: -2 }}
                        whileTap={{ scale: user ? 0.95 : 1 }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border-2 transition-all text-sm sm:text-base font-semibold ${
                          helpfulStatus[review.id]
                            ? "border-sky-500 bg-sky-50 text-sky-700 shadow-md"
                            : "border-sky-200 bg-white text-slate-600 hover:border-sky-400 hover:bg-sky-50 hover:shadow-sm"
                        } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-sky-200 disabled:hover:shadow-none`}
                      >
                        <ThumbsUp className={`w-5 h-5 transition-all ${
                          helpfulStatus[review.id] ? "fill-sky-600 text-sky-600" : ""
                        }`} />
                        <span>Helpful</span>
                        {review.helpfulCount > 0 && (
                          <span className="text-slate-500 font-medium">({review.helpfulCount})</span>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
