"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  className?: string;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  className = "",
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const handleAddToCart = () => {
    // Check if user is logged in
    if (!user) {
      router.push("/home/signin");
      return;
    }

    setIsAdding(true);

    try {
      // Get existing cart from localStorage
      const storedCart = localStorage.getItem("cart");
      let cartItems: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
      }> = [];

      if (storedCart) {
        try {
          cartItems = JSON.parse(storedCart);
        } catch (e) {
          console.error("Error parsing cart:", e);
          cartItems = [];
        }
      }

      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        // Increase quantity
        cartItems[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        cartItems.push({
          productId,
          productName,
          quantity: 1,
          price,
        });
      }

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));

      // Dispatch custom event to update navbar cart count
      window.dispatchEvent(new Event("cartUpdated"));

      // Show success message (optional - you can use a toast library)
      alert(`${productName} added to cart!`);

      // Optionally redirect to cart or refresh
      // router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`${className} ${isAdding ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-xs sm:text-sm font-light tracking-widest">
        {isAdding ? "ADDING..." : "ADD TO CART"}
      </span>
    </button>
  );
}
