"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/home/signin");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          userId: user.id,
          userName: user.name || user.email.split("@")[0],
          userEmail: user.email,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setRating(0);
      setComment("");
      setHoveredRating(0);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-br from-green-50 via-white to-green-50/30 rounded-lg p-4 border border-green-200/60 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm shrink-0">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 mb-1">
              Share Your Experience
            </p>
            <p className="text-xs text-slate-600 mb-3 font-light">
              <button
                onClick={() => router.push("/home/signin")}
                className="text-green-600 hover:text-green-700 underline font-medium transition-colors"
              >
                Sign in
              </button>
              {" "}to write a review
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-green-200/60 shadow-sm"
    >
      {/* Compact Header */}
      <div className="bg-linear-to-r from-green-50 to-white p-3 border-b border-green-200/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm shrink-0">
            <Edit3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Write Your Review</h3>
            <p className="text-xs text-slate-600 font-light">Help others make informed decisions</p>
          </div>
        </div>
      </div>

      {/* Compact Form Content */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Star Rating Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-900 mb-2">
            Rate this product <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="transition-all"
              >
                <Star
                  className={`w-7 h-7 transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                      : "text-slate-300 hover:text-slate-400"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs font-medium text-slate-600"
            >
              {rating === 5 && "? Excellent"}
              {rating === 4 && "?? Great"}
              {rating === 3 && "? Good"}
              {rating === 2 && "? Fair"}
              {rating === 1 && "? Poor"}
            </motion.p>
          )}
        </div>

        {/* Comment Textarea Section */}
        <div>
          <label
            htmlFor="comment"
            className="block text-xs font-semibold text-slate-900 mb-2"
          >
            Write your review <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900 resize-none transition-all placeholder:text-slate-400 font-light"
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-400 font-light bg-white px-1.5 py-0.5 rounded">
              {comment.length}/500
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700 font-medium">Review submitted successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-green-200/60">
          <motion.button
            type="submit"
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="flex-1 px-4 py-2 bg-linear-to-r from-green-600 to-green-500 text-white text-sm font-semibold rounded-lg hover:shadow-md hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => {
              setRating(0);
              setComment("");
              setError("");
              setSuccess(false);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            Clear
          </button>
        </div>
      </form>
    </motion.div>
  );
}
