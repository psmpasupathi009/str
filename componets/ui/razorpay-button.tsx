"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
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
}

export default function RazorpayButton({
  amount,
  items,
  customerName,
  customerEmail,
  customerPhone,
  userId,
  buttonText = "PAY NOW",
  className = "",
}: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setRazorpayLoaded(true);
          resolve();
        });
        existingScript.addEventListener("error", () => {
          reject(new Error("Failed to load Razorpay script"));
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay script"));
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Ensure Razorpay script is loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Create order
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          items,
          customerName,
          customerEmail,
          customerPhone,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      if (!data.key) {
        throw new Error("Razorpay key is not configured. Please check your environment variables.");
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Your Store",
        description: `Payment for ${items.length} item(s)`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: data.orderId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              // Redirect to success page
              router.push(`/payment/success?orderId=${data.orderId}&paymentId=${response.razorpay_payment_id}`);
            } else {
              // Redirect to failure page
              router.push(`/payment/failure?orderId=${data.orderId}&error=${encodeURIComponent(verifyData.error || "Payment verification failed")}`);
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            router.push(`/payment/failure?orderId=${data.orderId}&error=${encodeURIComponent(error.message || "Payment verification failed")}`);
          }
        },
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response);
        router.push(`/payment/failure?orderId=${data.orderId}&error=${encodeURIComponent(response.error.description || "Payment failed")}`);
        setIsLoading(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error.message || "Failed to initiate payment");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`${className} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="text-xs sm:text-sm font-light tracking-widest">
        {isLoading ? "PROCESSING..." : buttonText}
      </span>
    </button>
  );
}
