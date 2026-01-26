import { NextRequest, NextResponse } from "next/server";
import { createOTP, getUserByEmail } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { OTPType } from "@prisma/client";

const OTP_EXPIRY_SECONDS = 600; // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    // Validation
    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    // Validate user existence based on type
    if (type === OTPType.SIGNUP) {
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
    } else if (type === OTPType.FORGOT_PASSWORD) {
      const user = await getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "User with this email does not exist" },
          { status: 404 }
        );
      }
    }

    // Create and send OTP
    const otp = await createOTP(email, type);
    await sendOTPEmail(email, otp.code, type);

    return NextResponse.json(
      {
        message: "OTP sent successfully",
        expiresIn: OTP_EXPIRY_SECONDS,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
