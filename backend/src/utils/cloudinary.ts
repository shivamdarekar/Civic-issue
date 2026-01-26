import { v2 as cloudinaryV2 } from "cloudinary";
import streamifier from "streamifier";
import { ApiError } from "./apiError";

// Validate Cloudinary configuration
const isConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Cloudinary only if credentials exist
if (isConfigured()) {
  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.warn('⚠️  Cloudinary not configured. Image uploads will fail.');
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
  resource_type: string;
}

interface UploadOptions {
  folder?: string;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: any[];
  public_id?: string;
}

export const uploadOnCloudinary = async (
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  if (!buffer) {
    throw new ApiError(400, "No file buffer provided");
  }

  if (!isConfigured()) {
    throw new ApiError(500, "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
  }

  const defaultOptions = {
    resource_type: "image" as const,
    folder: "civic-issues",
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto:good" },
      { format: "auto" }
    ],
    timeout: 30000, // 30 second timeout
    ...options
  };

  try {
    return await new Promise((resolve, reject) => {
      // Set timeout for the entire operation
      const timeoutId = setTimeout(() => {
        reject(new ApiError(408, "Upload timeout - please try again"));
      }, 35000); // 35 seconds total timeout
      
      const stream = cloudinaryV2.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          clearTimeout(timeoutId);
          
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            return reject(new ApiError(500, `Upload failed: ${error.message}`));
          }
          if (!result) {
            return reject(new ApiError(500, "Upload failed: No result returned"));
          }
          resolve(result as CloudinaryUploadResult);
        }
      );
      
      streamifier.createReadStream(buffer).pipe(stream);
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error instanceof ApiError ? error : new ApiError(500, "Failed to upload image");
  }
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<boolean> => {
  if (!publicId) {
    throw new ApiError(400, "Public ID is required");
  }

  if (!isConfigured()) {
    throw new ApiError(500, "Cloudinary is not configured");
  }

  try {
    const result = await cloudinaryV2.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result !== "ok" && result.result !== "not found") {
      console.error("❌ Cloudinary delete error:", result);
      throw new ApiError(500, `Delete failed: ${result.result}`);
    }

    console.log(`✅ Image deleted from Cloudinary: ${publicId}`);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    throw error instanceof ApiError ? error : new ApiError(500, "Failed to delete image");
  }
};

// Helper to extract public_id from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/civic-issues/before/abc123.jpg
    const match = url.match(/\/civic-issues\/[^/]+\/([^/.]+)/);
    if (match) {
      const folder = url.includes('/before/') ? 'civic-issues/before' : 'civic-issues/after';
      return `${folder}/${match[1]}`;
    }
    // Fallback for simple format
    const simpleMatch = url.match(/\/civic-issues\/([^/.]+)/);
    return simpleMatch ? `civic-issues/${simpleMatch[1]}` : null;
  } catch {
    return null;
  }
};