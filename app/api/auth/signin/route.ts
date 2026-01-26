import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, verifyPassword } from "@/lib/auth";

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

    // Find and verify user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user without sensitive data
    const { password: _, ...userWithoutSensitive } = user;
    const token = generateToken(user.id, user.email);

    return NextResponse.json(
      {
        message: "Sign in successful",
        user: userWithoutSensitive,
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
