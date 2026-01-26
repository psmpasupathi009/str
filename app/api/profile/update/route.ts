import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, phoneNumber } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate phone number format if provided
    if (phoneNumber && phoneNumber.trim() !== "") {
      // Remove all non-digit characters for validation
      const digitsOnly = phoneNumber.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return NextResponse.json(
          { error: "Phone number must be at least 10 digits" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        isEmailVerified: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
