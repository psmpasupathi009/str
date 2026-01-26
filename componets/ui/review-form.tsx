"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Loader2, Sparkles } from "lucide-react";
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
    setSuccess(false);

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

      // Reset form
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-10 bg-linear-to-br from-white via-sky-50/50 to-white rounded-3xl border border-sky-200/50 shadow-xl shadow-sky-100/50 text-center backdrop-blur-sm"
      >
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-sky-100 to-sky-200 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-sky-600" />
          </div>
          <p className="text-slate-700 font-light text-lg mb-2">
            Sign in to share your experience
          </p>
          <p className="text-slate-500 font-light text-sm">
            Join our community and help others make better choices
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/home/signin")}
          className="px-8 py-4 bg-linear-to-r from-sky-600 to-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all text-sm font-light tracking-wider"
        >
          SIGN IN TO REVIEW
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-8 sm:p-10 bg-linear-to-br from-white via-sky-50/30 to-white rounded-3xl border border-sky-200/50 shadow-xl shadow-sky-100/50 backdrop-blur-sm"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-sky-200/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-purple-200/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="mb-6">
          <h3 className="text-2xl sm:text-3xl font-light tracking-wide mb-2 text-slate-900">
            Share Your Experience
          </h3>
          <p className="text-slate-500 font-light text-sm">
            Your feedback helps others make informed decisions
          </p>
        </div>

        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            How would you rate this product?
          </label>
          <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="transition-all"
              >
                <Star
                  className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
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
              className="text-center sm:text-left mt-2 text-sm text-slate-600 font-light"
            >
              {rating === 5 && "Excellent! ⭐"}
              {rating === 4 && "Great! 👍"}
              {rating === 3 && "Good! ✓"}
              {rating === 2 && "Fair"}
              {rating === 1 && "Poor"}
            </motion.p>
          )}
        </div>

        {/* Comment Textarea */}
        <div className="mb-6">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-slate-700 mb-3"
          >
            Tell us more about your experience
          </label>
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about the product quality, delivery, packaging, or any other aspects that would help other customers..."
              rows={5}
              className="w-full px-5 py-4 border-2 border-sky-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 bg-white/80 text-slate-900 font-light resize-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-light">
              {comment.length}/500
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              Review submitted successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          whileHover={{ scale: isSubmitting ? 1 : 1.02, y: -2 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className="w-full px-8 py-4 bg-linear-to-r from-sky-600 to-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-3 text-sm font-light tracking-wider"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>SUBMITTING...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>SUBMIT REVIEW</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
