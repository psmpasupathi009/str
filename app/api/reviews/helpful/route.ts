import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/reviews/helpful
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userId } = body;

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: "Review ID and User ID are required" },
        { status: 400 }
      );
    }

    // Check if user already marked this review as helpful
    const existing = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existing) {
      // Remove helpful vote
      await prisma.reviewHelpful.delete({
        where: {
          id: existing.id,
        },
      });

      // Decrease helpful count
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ helpful: false }, { status: 200 });
    } else {
      // Add helpful vote
      await prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId,
        },
      });

      // Increase helpful count
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ helpful: true }, { status: 200 });
    }
  } catch (error) {
    console.error("Error toggling helpful:", error);
    return NextResponse.json(
      { error: "Failed to update helpful status" },
      { status: 500 }
    );
  }
}

// GET /api/reviews/helpful?reviewId=xxx&userId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get("reviewId");
    const userId = searchParams.get("userId");

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: "Review ID and User ID are required" },
        { status: 400 }
      );
    }

    const helpful = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    return NextResponse.json({ helpful: !!helpful }, { status: 200 });
  } catch (error) {
    console.error("Error checking helpful:", error);
    return NextResponse.json(
      { error: "Failed to check helpful status" },
      { status: 500 }
    );
  }
}
