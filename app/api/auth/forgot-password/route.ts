import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { createOTP } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Create and send OTP
    const otp = await createOTP(email, "FORGOT_PASSWORD");
    await sendOTPEmail(email, otp.code, "FORGOT_PASSWORD");

    return NextResponse.json(
      {
        message: "OTP sent to your email. Please verify to reset your password.",
        expiresIn: 600, // 10 minutes
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
