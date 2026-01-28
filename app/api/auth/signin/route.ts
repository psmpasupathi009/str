import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, verifyPassword } from "@/lib/auth";
import { signSession, SESSION_COOKIE_NAME } from "@/lib/session";

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

    // Check if user is admin based on ADMIN_EMAIL env variable
    const adminEmail = process.env.ADMIN_EMAIL;
    let userRole = user.role;
    if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
      userRole = "ADMIN";
      // Update user role in database if not already set
      if (user.role !== "ADMIN") {
        const { prisma } = await import("@/lib/prisma");
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    }

    // Return user without sensitive data
    const { password: _, ...userWithoutSensitive } = { ...user, role: userRole };
    // Signed, httpOnly session cookie (prevents header spoofing & XSS token theft)
    const sessionJwt = await signSession({
      userId: user.id,
      email: user.email,
      role: userRole,
    });

    const res = NextResponse.json(
      {
        message: "Sign in successful",
        user: userWithoutSensitive,
        // kept for backward compatibility (client may still store it) but no longer used for auth
        token: sessionJwt,
      },
      { status: 200 }
    );

    res.cookies.set(SESSION_COOKIE_NAME, sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
