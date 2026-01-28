import { NextRequest, NextResponse } from "next/server";
import { uploadMediaToCloudinary } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for videos, 10MB for images

// POST /api/upload/media - Upload image or video to Cloudinary (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication (same pattern as admin/orders)
    const userEmail = request.headers.get("x-user-email");
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type (image or video)
    const fileType = file.type || "";
    const isImage = fileType.startsWith("image/");
    const isVideo = fileType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "File must be an image or video" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Upload to Cloudinary (handles both images and videos)
    const { url, type } = await uploadMediaToCloudinary(file, folder);

    return NextResponse.json(
      { url, type, message: `${type === "VIDEO" ? "Video" : "Image"} uploaded successfully` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload media" },
      { status: 500 }
    );
  }
}
