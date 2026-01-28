import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Returns the currently authenticated user (based on httpOnly session cookie)
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      role: true,
      isEmailVerified: true,
    },
  });

  return NextResponse.json({ user }, { status: 200 });
}

