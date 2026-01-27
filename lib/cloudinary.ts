// Lazy load Cloudinary to prevent auto-configuration errors
let cloudinaryInstance: any = null;
let isConfigured = false;

// Validate CLOUDINARY_URL format before importing Cloudinary
function validateCloudinaryUrl(): boolean {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) return false;
  
  // Must start with cloudinary://
  return cloudinaryUrl.startsWith('cloudinary://');
}

async function getCloudinary() {
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

function configureCloudinary() {
  if (isConfigured || !cloudinaryInstance) return;

  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

  // Only process if URL starts with cloudinary://
  if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
    try {
      // Parse CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name)
      const url = new URL(cloudinaryUrl);
      const apiKey = url.username;
      const apiSecret = url.password;
      const cloudName = url.hostname;

      if (cloudName && apiKey && apiSecret) {
        cloudinaryInstance.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });
        isConfigured = true;
        return;
      }
    } catch (error) {
      console.warn('Error parsing CLOUDINARY_URL, falling back to individual env vars:', error);
    }
  }

  // Use individual environment variables (or fallback)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    cloudinaryInstance.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
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
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_URL (format: cloudinary://api_key:api_secret@cloud_name) or individual Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).');
  }

  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type || 'image/jpeg'};base64,${base64}`;

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
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
          else resolve(result);
        }
      );
    });

    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image to Cloudinary');
  }
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
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw new Error(error.message || 'Failed to delete image from Cloudinary');
  }
}

// Export a getter for cloudinary instance (for advanced usage)
export async function getCloudinaryInstance() {
  return await getCloudinary();
}
