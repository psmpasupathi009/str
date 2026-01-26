import { NextRequest, NextResponse } from "next/server";
import { verifyOTP, getUserByEmail } from "@/lib/auth";
import { OTPType } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { email, code, type } = await request.json();

    // Validation
    if (!email || !code || !type) {
      return NextResponse.json(
        { error: "Email, code, and type are required" },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await verifyOTP(email, code, type);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Handle different OTP types
    if (type === OTPType.SIGNUP) {
      return NextResponse.json(
        {
          message: "OTP verified successfully. Please create your password.",
          verified: true,
        },
        { status: 200 }
      );
    }

    if (type === OTPType.FORGOT_PASSWORD) {
      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "OTP verified. Please set your new password.",
          requiresPassword: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid OTP type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
