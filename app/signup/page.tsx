"use client";

import { AceternityAuthForm } from "@/componets/ui/aceternity-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (email: string, password?: string, name?: string, otp?: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      // This is called after OTP verification - user is already logged in via API
      // The component handles localStorage, we just need to update context and redirect
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        router.push("/");
        router.refresh();
      } else {
        throw new Error("User data not found. Please try again.");
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  return <AceternityAuthForm type="signup" onSubmit={handleSignUp} isLoading={isLoading} />;
}
