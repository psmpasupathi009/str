import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 6;

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phoneNumber } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
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

    // Create user (OTP was already verified in previous step)
    const user = await createUser(email, password, name, phoneNumber);
    const { password: _, ...userWithoutSensitive } = user;

    // Generate token for auto login
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: userWithoutSensitive,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
