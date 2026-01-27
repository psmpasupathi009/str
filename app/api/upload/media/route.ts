import { NextRequest } from "next/server";
import { uploadMediaToCloudinary } from "@/lib/cloudinary";
import { requireAdmin, createErrorResponse, createSuccessResponse, handleApiError } from "@/lib/auth-utils";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for videos, 10MB for images

// POST /api/upload/media - Upload image or video to Cloudinary (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";

    // Validate file exists
    if (!file) {
      return createErrorResponse("No file provided", 400);
    }

    // Validate file type (image or video)
    const fileType = file.type || "";
    const isImage = fileType.startsWith("image/");
    const isVideo = fileType.startsWith("video/");

    if (!isImage && !isVideo) {
      return createErrorResponse("File must be an image or video", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        400
      );
    }

    // Upload to Cloudinary (handles both images and videos)
    const { url, type } = await uploadMediaToCloudinary(file, folder);

    return createSuccessResponse(
      { url, type },
      `${type === "VIDEO" ? "Video" : "Image"} uploaded successfully`,
      200
    );
  } catch (error) {
    return handleApiError(error, "Failed to upload media");
  }
}
