import { NextRequest } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { requireAdmin, createErrorResponse, createSuccessResponse, handleApiError } from "@/lib/auth-utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/upload/image - Upload image to Cloudinary (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    // Validate file exists
    if (!file) {
      return createErrorResponse("No file provided", 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return createErrorResponse("File must be an image", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse("File size must be less than 10MB", 400);
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImageToCloudinary(file, folder);

    return createSuccessResponse(
      { url: imageUrl },
      "Image uploaded successfully",
      200
    );
  } catch (error) {
    return handleApiError(error, "Failed to upload image");
  }
}
