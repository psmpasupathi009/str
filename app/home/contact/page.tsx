"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate form submission - you can replace this with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-green-100 to-green-200 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-8 sm:mb-12">
          CONTACT US
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <div>
            <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6">
              GET IN TOUCH
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-700 font-light">
              <p>
                <span className="text-slate-600">Email:</span> contact@str.com
              </p>
              <p>
                <span className="text-slate-600">Phone:</span> +1 (555) 123-4567
              </p>
              <p>
                <span className="text-slate-600">Address:</span>
                <br />
                123 Luxury Avenue
                <br />
                New York, NY 10001
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-4 sm:mb-6">
              SEND A MESSAGE
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-white border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-white border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
              />
              <textarea
                placeholder="Your Message"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full bg-white border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                style={{ color: 'rgb(15 23 42)', caretColor: 'rgb(14 165 233)' }}
              />
              {submitStatus === "success" && (
                <p className="text-green-600 text-sm">Message sent successfully!</p>
              )}
              {submitStatus === "error" && (
                <p className="text-red-600 text-sm">Failed to send message. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 border border-green-600 hover:border-green-700 bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xs sm:text-sm font-light tracking-widest">
                  {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
