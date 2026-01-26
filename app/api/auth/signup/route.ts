import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";

const OTP_EXPIRY_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber, name } = await request.json();

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create and send OTP
    const otp = await createOTP(email, "SIGNUP");
    await sendOTPEmail(email, otp.code, "SIGNUP");

    return NextResponse.json(
      {
        message: "OTP sent to your email. Please verify to complete signup.",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
