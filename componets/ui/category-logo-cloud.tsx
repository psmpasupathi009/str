"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  image?: string | null;
}

export default function CategoryLogoCloud() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.categories) {
          // Take first 9 categories
          const cats = data.categories.slice(0, 9);
          setCategories(cats);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  // Duplicate categories multiple times for seamless infinite scroll
  const duplicatedCategories = [...categories, ...categories];

  return (
    <div className="relative w-full overflow-hidden py-2 sm:py-2.5 md:py-3">
      {/* Gradient fade edges - Responsive */}
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-12 md:w-16 bg-linear-to-r from-green-900/70 via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-12 md:w-16 bg-linear-to-l from-green-900/70 via-transparent to-transparent z-10 pointer-events-none" />
      
      <div className="flex">
        <motion.div
          className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-5"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            },
          }}
        >
          {duplicatedCategories.map((category, index) => (
            <Link
              key={`${category.id}-${index}`}
              href={`/home/products?category=${encodeURIComponent(category.name)}`}
              className="shrink-0 group"
            >
              <motion.div
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-md sm:rounded-lg md:rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px] text-center"
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <p className="text-white/80 font-medium text-[9px] sm:text-[10px] md:text-xs lg:text-sm group-hover:text-white transition-colors whitespace-nowrap">
                  {category.name}
                </p>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
