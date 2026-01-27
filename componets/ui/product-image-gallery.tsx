"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  mainImage: string;
  images: string[];
  productName: string;
}

export default function ProductImageGallery({
  mainImage,
  images,
  productName,
}: ProductImageGalleryProps) {
  // Combine main image with additional images, ensuring main image is first
  const allImages = mainImage 
    ? [mainImage, ...images.filter(img => img !== mainImage && img.trim().length > 0)]
    : images.filter(img => img.trim().length > 0);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showZoom, setShowZoom] = useState(false);

  const currentImage = allImages[selectedIndex] || "/placeholder-product.jpg";

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden border border-sky-200 bg-slate-100 rounded-lg">
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-slate-400 text-sm font-light">No Image Available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display - Amazon Style */}
      <div className="relative aspect-square overflow-hidden border border-sky-200 bg-white rounded-lg shadow-sm group">
        {!imageErrors.has(selectedIndex) ? (
          <>
            <Image
              src={currentImage}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain cursor-zoom-in"
              priority={selectedIndex === 0}
              onError={() => handleImageError(selectedIndex)}
              onClick={() => setShowZoom(true)}
            />
            {/* Zoom Icon Overlay */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                <ZoomIn className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400 text-sm font-light">Image not available</span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip - Amazon Style */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-sky-300 scrollbar-track-sky-100">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 rounded-lg transition-all ${
                selectedIndex === index
                  ? "border-sky-600 shadow-md ring-2 ring-sky-200"
                  : "border-sky-200 hover:border-sky-400"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              {!imageErrors.has(index) ? (
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-slate-400 text-xs">No Image</span>
                </div>
              )}
              {/* Selected Indicator */}
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-sky-600/10 border-2 border-sky-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {showZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 text-white hover:text-sky-300 transition-colors z-10"
            aria-label="Close zoom"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-6xl w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={currentImage}
              alt={`${productName} - Zoomed`}
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* Navigation in Zoom */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
