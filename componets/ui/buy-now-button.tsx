"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Button from "./button";

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
  const { user } = useAuth();

  const handleBuyNow = () => {
    // Check if user is logged in
    if (!user) {
      router.push("/home/signin");
      return;
    }

    // Redirect to checkout with product details
    const params = new URLSearchParams({
      buyNow: "true",
      productId,
      productName: encodeURIComponent(productName),
      price: price.toString(),
    });
    router.push(`/home/checkout?${params.toString()}`);
  };

  return (
    <Button
      onClick={handleBuyNow}
      variant="primary"
      size="md"
      className={className}
    >
      BUY NOW
    </Button>
  );
}
