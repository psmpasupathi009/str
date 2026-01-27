import type { UploadApiResponse } from 'cloudinary';

// Lazy load Cloudinary to prevent auto-configuration errors
let cloudinaryInstance: typeof import('cloudinary').v2 | null = null;
let isConfigured = false;

interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

// Validate CLOUDINARY_URL format before importing Cloudinary
function validateCloudinaryUrl(): boolean {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) return false;
  
  // Must start with cloudinary://
  return cloudinaryUrl.startsWith('cloudinary://');
}

async function getCloudinary(): Promise<typeof import('cloudinary').v2> {
  if (!cloudinaryInstance) {
    // Temporarily unset invalid CLOUDINARY_URL to prevent auto-configuration errors
    const originalUrl = process.env.CLOUDINARY_URL;
    const isValidUrl = validateCloudinaryUrl();
    
    if (!isValidUrl && originalUrl) {
      // Temporarily remove invalid URL to prevent Cloudinary SDK from auto-configuring
      delete process.env.CLOUDINARY_URL;
    }
    
    try {
      const { v2 } = await import('cloudinary');
      cloudinaryInstance = v2;
      
      // Restore original URL if we removed it
      if (!isValidUrl && originalUrl) {
        process.env.CLOUDINARY_URL = originalUrl;
      }
      
      configureCloudinary();
    } catch (error) {
      // Restore original URL if import fails
      if (!isValidUrl && originalUrl) {
        process.env.CLOUDINARY_URL = originalUrl;
      }
      throw error;
    }
  }
  return cloudinaryInstance;
}

function configureCloudinary(): void {
  if (isConfigured || !cloudinaryInstance) return;

  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  let config: CloudinaryConfig | null = null;

  // Only process if URL starts with cloudinary://
  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    try {
      // Parse CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)
      const url = new URL(cloudinaryUrl);
      const apiKey = url.username;
      const apiSecret = url.password;
      const cloudName = url.hostname;

      if (cloudName && apiKey && apiSecret) {
        config = {
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        };
      }
    } catch (error) {
      console.warn('Error parsing CLOUDINARY_URL, falling back to individual env vars:', error);
    }
  }

  // Use individual environment variables (or fallback)
  if (!config) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (cloudName && apiKey && apiSecret) {
      config = {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      };
    }
  }

  if (config && cloudinaryInstance) {
    cloudinaryInstance.config(config);
    isConfigured = true;
  }
}

export async function uploadImageToCloudinary(
  file: File | Blob,
  folder: string = 'products'
): Promise<string> {
  const cloudinary = await getCloudinary();

  // Ensure Cloudinary is configured before upload
  if (!isConfigured) {
    configureCloudinary();
  }

  if (!isConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name) ' +
      'or individual Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).'
    );
  }

  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type || 'image/jpeg'};base64,${base64}`;

    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed: No result returned'));
        }
      );
    });

    if (!result.secure_url) {
      throw new Error('Upload failed: No secure URL returned');
    }

    return result.secure_url;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image to Cloudinary';
    console.error('Cloudinary upload error:', error);
    throw new Error(errorMessage);
  }
}

export async function uploadVideoToCloudinary(
  file: File | Blob,
  folder: string = 'gallery'
): Promise<string> {
  const cloudinary = await getCloudinary();

  // Ensure Cloudinary is configured before upload
  if (!isConfigured) {
    configureCloudinary();
  }

  if (!isConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name) ' +
      'or individual Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).'
    );
  }

  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type || 'video/mp4'};base64,${base64}`;

    // Upload to Cloudinary with video resource type
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: folder,
          resource_type: 'video',
          chunk_size: 6000000, // 6MB chunks for large videos
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed: No result returned'));
        }
      );
    });

    if (!result.secure_url) {
      throw new Error('Upload failed: No secure URL returned');
    }

    return result.secure_url;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload video to Cloudinary';
    console.error('Cloudinary upload error:', error);
    throw new Error(errorMessage);
  }
}

export async function uploadMediaToCloudinary(
  file: File | Blob,
  folder: string = 'gallery'
): Promise<{ url: string; type: 'IMAGE' | 'VIDEO' }> {
  const fileType = file.type || '';
  const isVideo = fileType.startsWith('video/');
  const isImage = fileType.startsWith('image/');

  if (!isImage && !isVideo) {
    throw new Error('File must be an image or video');
  }

  const url = isVideo
    ? await uploadVideoToCloudinary(file, folder)
    : await uploadImageToCloudinary(file, folder);

  return {
    url,
    type: isVideo ? 'VIDEO' : 'IMAGE',
  };
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  const cloudinary = await getCloudinary();

  if (!isConfigured) {
    configureCloudinary();
  }

  if (!isConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete image from Cloudinary';
    console.error('Cloudinary delete error:', error);
    throw new Error(errorMessage);
  }
}

// Export a getter for cloudinary instance (for advanced usage)
export async function getCloudinaryInstance(): Promise<typeof import('cloudinary').v2> {
  return await getCloudinary();
}
