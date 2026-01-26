"use client";

import { useRouter } from "next/navigation";

interface BuyNowButtonProps {
  productId: string;
  productName: string;
  price: number;
  className?: string;
}

export default function BuyNowButton({
  productId,
  productName,
  price,
  className = "",
}: BuyNowButtonProps) {
  const router = useRouter();

  const handleBuyNow = () => {
    // Redirect to checkout with product details
    const params = new URLSearchParams({
      buyNow: "true",
      productId,
      productName: encodeURIComponent(productName),
      price: price.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <button
      onClick={handleBuyNow}
      className={className}
    >
      <span className="text-xs sm:text-sm font-light tracking-widest">
        BUY NOW
      </span>
    </button>
  );
}
