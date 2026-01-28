"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Mail, Phone, Package } from "lucide-react";
import RazorpayButton from "@/components/shared/razorpay-button";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [showPaymentButton, setShowPaymentButton] = useState(false);

  // Check if coming from Buy Now (single item)
  const buyNowItem = searchParams.get("buyNow");
  const buyNowProductId = searchParams.get("productId");
  const buyNowProductName = searchParams.get("productName");
  const buyNowPrice = searchParams.get("price");

  // Redirect to signin if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/home/signin");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (buyNowItem === "true" && buyNowProductId && buyNowProductName && buyNowPrice) {
      // Single item buy now
      const item: CartItem = {
        productId: buyNowProductId,
        productName: decodeURIComponent(buyNowProductName),
        quantity: 1,
        price: parseFloat(buyNowPrice),
      };
      setCartItems([item]);
      setTotal(item.price);
    } else {
      // Load from cart
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          const items: CartItem[] = JSON.parse(storedCart);
          setCartItems(items);
          const totalAmount = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
          setTotal(totalAmount);
        } catch (e) {
          console.error("Error loading cart:", e);
        }
      } else {
        // No items, redirect to products
        router.push("/home/products");
      }
    }
  }, [buyNowItem, buyNowProductId, buyNowProductName, buyNowPrice, router]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }
    if (!shippingAddress.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowPaymentButton(true);
      // Scroll to payment button
      setTimeout(() => {
        const paymentButton = document.getElementById("payment-button");
        if (paymentButton) {
          paymentButton.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  if (cartItems.length === 0 && !buyNowItem) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-4">
            <p className="text-slate-600">No items in cart.</p>
            <Button
              asLink
              href="/home/products"
              variant="primary"
              size="md"
            >
              BROWSE PRODUCTS
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href={buyNowItem === "true" ? "/home/products" : "/home/cart"}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-green-700 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm font-light tracking-wider">
            {buyNowItem === "true" ? "BACK TO PRODUCTS" : "BACK TO CART"}
          </span>
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-8 sm:mb-12">
          CHECKOUT
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Shipping Address Form */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-6 sm:mb-8 flex items-center gap-2">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                SHIPPING ADDRESS
              </h2>

              <div className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
                    <Input
                      id="fullName"
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="pl-10 sm:pl-12 border-green-300 focus:border-green-500 focus:ring-green-200"
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 sm:pl-12 border-green-300 focus:border-green-500 focus:ring-green-200"
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                      Phone *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                        className="pl-10 sm:pl-12 border-green-300 focus:border-green-500 focus:ring-green-200"
                        placeholder="1234567890"
                      />
                    </div>
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                    Address Line 1 *
                  </Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                    className="border-green-300 focus:border-green-500 focus:ring-green-200"
                    placeholder="Street address, P.O. box"
                  />
                  {errors.addressLine1 && <p className="text-red-400 text-xs mt-1">{errors.addressLine1}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                    Address Line 2
                  </Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                    className="border-green-300 focus:border-green-500 focus:ring-green-200"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-200"
                      placeholder="City"
                    />
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-200"
                      placeholder="State"
                    />
                    {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-200"
                      placeholder="ZIP"
                    />
                    {errors.zipCode && <p className="text-red-400 text-xs mt-1">{errors.zipCode}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs sm:text-sm font-light tracking-wider uppercase">
                    Country *
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className="border-green-300 focus:border-green-500 focus:ring-green-200"
                    placeholder="Country"
                  />
                  {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide mb-6 sm:mb-8 flex items-center gap-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                ORDER SUMMARY
              </h2>

              <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start border-b border-green-200 pb-3 sm:pb-4">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-light mb-1 text-slate-900">{item.productName}</p>
                      <p className="text-xs sm:text-sm text-slate-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm sm:text-base font-light text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-green-200 pt-4 sm:pt-5 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-slate-600 font-light">Subtotal</span>
                  <span className="text-sm sm:text-base font-light text-slate-900">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-slate-600 font-light">Shipping</span>
                  <span className="text-sm sm:text-base font-light text-slate-900">Free</span>
                </div>
                <div className="border-t border-green-200 pt-3 sm:pt-4 flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-light tracking-wide text-slate-900">TOTAL</span>
                  <span className="text-xl sm:text-2xl font-light text-slate-900">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {showPaymentButton ? (
                <div id="payment-button" className="mt-6 sm:mt-8">
                  <RazorpayButton
                    amount={total}
                    items={cartItems.map(item => ({
                      productId: item.productId,
                      productName: item.productName,
                      quantity: item.quantity,
                      price: item.price,
                    }))}
                    customerName={shippingAddress.fullName}
                    customerEmail={shippingAddress.email}
                    customerPhone={shippingAddress.phone}
                    userId={user?.id || undefined}
                    buttonText="PROCEED TO PAYMENT"
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white hover:bg-green-700 transition-opacity duration-200"
                    shippingAddress={shippingAddress}
                  />
                </div>
              ) : (
                <div className="mt-6 sm:mt-8">
                  <Button
                    onClick={handleProceedToPayment}
                    variant="secondary"
                    size="md"
                    className="w-full"
                  >
                    PROCEED TO PAYMENT
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-100 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-slate-600">Loading...</p>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
