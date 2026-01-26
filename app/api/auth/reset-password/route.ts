import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUserPassword } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 6;

const generateToken = (userId: string, email: string) => {
  return Buffer.from(JSON.stringify({ userId, email })).toString('base64');
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update password
    await updateUserPassword(user.id, password);

    // Return user without sensitive data
    const { password: _, ...userWithoutSensitive } = user;
    const token = generateToken(user.id, user.email);

    return NextResponse.json(
      {
        message: "Password reset successfully",
        user: userWithoutSensitive,
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
