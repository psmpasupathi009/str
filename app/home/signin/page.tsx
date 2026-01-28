"use client";

import { AceternityAuthForm } from "@/components/shared/aceternity-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (email: string, password?: string, name?: string, otp?: string, phoneNumber?: string) => {
    setIsLoading(true);
    try {
      // Regular sign in with password
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        router.push("/");
        router.refresh();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
  };

  return <AceternityAuthForm type="signin" onSubmit={handleSignIn} isLoading={isLoading} />;
}
