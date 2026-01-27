"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [mainImgSrc, setMainImgSrc] = useState(mainImage);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const handleMainImageError = () => {
    setMainImgSrc("/placeholder-product.jpg");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative aspect-square overflow-hidden border border-sky-200 bg-slate-100 shadow-sm">
        {mainImgSrc ? (
          <Image
            src={mainImgSrc}
            alt={productName}
            fill
            className="object-cover"
            priority
            onError={handleMainImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-slate-400 text-sm font-light">No Image Available</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {images.slice(1).map((img: string, index: number) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden border border-sky-200 bg-slate-100 shadow-sm"
            >
              {img && !imageErrors.has(index) ? (
                <Image
                  src={img}
                  alt={`${productName} ${index + 2}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-slate-400 text-xs font-light">No Image</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
