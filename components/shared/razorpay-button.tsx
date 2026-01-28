"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface RazorpayButtonProps {
  amount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;
  buttonText?: string;
  className?: string;
  shippingAddress?: ShippingAddress;
}

/**
 * Razorpay Payment Button Component
 * Simplified implementation following Razorpay best practices
 */
export default function RazorpayButton({
  amount,
  items,
  customerName,
  customerEmail,
  customerPhone,
  userId,
  buttonText = "PAY NOW",
  className = "",
  shippingAddress,
}: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  // Preload Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Wait for Razorpay script to load
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const checkRazorpay = setInterval(() => {
            if (window.Razorpay) {
              clearInterval(checkRazorpay);
              resolve(true);
            }
          }, 100);
          setTimeout(() => clearInterval(checkRazorpay), 5000);
        });
      }

      if (!window.Razorpay) {
        throw new Error("Failed to load Razorpay. Please check your internet connection.");
      }

      // Step 1: Create order on server
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount.toFixed(2)), // Ensure 2 decimal places
          items: items.map(item => ({
            productId: String(item.productId),
            productName: String(item.productName),
            quantity: Number(item.quantity) || 1,
            price: Number(item.price.toFixed(2)),
          })),
          customerName: customerName || "",
          customerEmail: customerEmail || "",
          customerPhone: customerPhone || "",
          userId: userId || undefined,
          shippingAddress: shippingAddress || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error || "Failed to create order";
        console.error("[Payment] Order creation failed:", errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.key || !data.razorpayOrderId) {
        throw new Error("Invalid order response from server. Please try again.");
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "STN Golden Healthy Foods",
        description: `Payment for ${items.length} item(s)`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            setIsLoading(true);

            // Validate response data
            if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
              throw new Error("Invalid payment response from Razorpay");
            }

            // Step 3: Verify payment on server
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: String(response.razorpay_order_id),
                razorpayPaymentId: String(response.razorpay_payment_id),
                razorpaySignature: String(response.razorpay_signature),
                orderData: data.orderData,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.orderId) {
              // Clear cart on successful payment
              if (typeof window !== "undefined") {
                localStorage.removeItem("cart");
                window.dispatchEvent(new Event("cartUpdated"));
              }
              
              showSuccess("Payment successful! Redirecting...");
              setTimeout(() => {
                router.push(
                  `/home/payment/success?orderId=${verifyData.orderId}&paymentId=${response.razorpay_payment_id}`
                );
              }, 500);
            } else {
              const errorMsg = verifyData.error || "Payment verification failed";
              console.error("[Payment] Verification failed:", errorMsg);
              showError(errorMsg);
              router.push(
                `/home/payment/failure?error=${encodeURIComponent(errorMsg)}&orderId=${data.razorpayOrderId}`
              );
            }
          } catch (error: any) {
            console.error("[Payment] Verification error:", error);
            const errorMsg = error.message || "Payment verification failed. Please contact support.";
            showError(errorMsg);
            router.push(
              `/home/payment/failure?error=${encodeURIComponent(errorMsg)}&orderId=${data.razorpayOrderId || ""}`
            );
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        theme: {
          color: "#16a34a", // Green theme
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // Handle payment failures
      razorpay.on("payment.failed", function (response: any) {
        console.error("[Payment] Failed:", response);
        const errorMsg = response.error?.description || response.error?.reason || "Payment failed";
        showError(errorMsg);
        router.push(
          `/home/payment/failure?error=${encodeURIComponent(errorMsg)}&orderId=${data.razorpayOrderId}`
        );
        setIsLoading(false);
      });

      razorpay.open();
      setIsLoading(false); // Reset after opening modal
    } catch (error: any) {
      console.error("[Payment] Error:", error);
      setIsLoading(false);
      showError(error.message || "Failed to initiate payment. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`${className} ${isLoading ? "opacity-70 cursor-not-allowed" : ""} transition-opacity`}
      aria-label={buttonText}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        buttonText
      )}
    </button>
  );
}
