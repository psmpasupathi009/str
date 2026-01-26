"use client";

import RazorpayButton from "./razorpay-button";
import { useAuth } from "@/lib/auth-context";

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
  const { user } = useAuth();

  return (
    <RazorpayButton
      amount={price}
      items={[
        {
          productId,
          productName,
          quantity: 1,
          price,
        },
      ]}
      customerName={user?.name || undefined}
      customerEmail={user?.email || undefined}
      customerPhone={user?.phoneNumber || undefined}
      userId={user?.id || undefined}
      buttonText="BUY NOW"
      className={className}
    />
  );
}
