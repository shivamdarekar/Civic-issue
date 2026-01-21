import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../../utils/cloudinary";
import { ApiError } from "../../utils/apiError";
import { prisma } from "../../lib/prisma";
import type { MediaType } from "@prisma/client";
import type { UploadedFile, UploadedMediaResult } from "../../types";
import { VisionAIService, CONFIDENCE_THRESHOLDS } from "../../services/vision/vision.service";

export class IssueUploadService {
  /**
   * Upload multiple images to Cloudinary
   * Used for BEFORE images (issue creation) and AFTER images (issue resolution)
   */
  static async uploadMultipleImages(
    files: UploadedFile[],
    mediaType: MediaType = "BEFORE"
  ): Promise<UploadedMediaResult[]> {
    if (!files || files.length === 0) {
      throw new ApiError(400, "No files provided");
    }

    if (files.length > 5) {
      throw new ApiError(400, "Maximum 5 images allowed");
    }

    const folder = mediaType === "BEFORE" ? "civic-issues/before" : "civic-issues/after";

    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadOnCloudinary(file.buffer, {
          resource_type: "image",
          folder,
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto:good" },
            { format: "auto" }
          ]
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: `image/${result.format}`,
          fileSize: result.bytes
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("❌ Failed to upload images:", error);
      throw new ApiError(500, "Failed to upload one or more images");
    }
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(urlOrPublicId: string): Promise<boolean> {
    if (!urlOrPublicId) {
      throw new ApiError(400, "URL or publicId is required");
    }

    // Extract publicId if URL is provided
    let publicId = urlOrPublicId;
    if (urlOrPublicId.startsWith("http")) {
      const extracted = extractPublicId(urlOrPublicId);
      if (!extracted) {
        throw new ApiError(400, "Could not extract publicId from URL");
      }
      publicId = extracted;
    }

    try {
      await deleteFromCloudinary(publicId);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete image:", error);
      throw new ApiError(500, "Failed to delete image from cloud storage");
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  static async deleteMultipleImages(urlsOrPublicIds: string[]): Promise<void> {
    if (!urlsOrPublicIds || urlsOrPublicIds.length === 0) {
      return;
    }

    const deletePromises = urlsOrPublicIds.map(async (urlOrPublicId) => {
      try {
        await this.deleteImage(urlOrPublicId);
      } catch (error) {
        // Log but don't throw - continue deleting other images
        console.error(`Failed to delete image ${urlOrPublicId}:`, error);
      }
    });

    await Promise.all(deletePromises);
  }

  //analyze image
  static async analyzeImageWithAI(imageUrl: string) {
    try {
      const visionResult = await VisionAIService.analyzeImage(imageUrl);

      let suggestedCategoryId: string | null = null;
      let description = "Please describe the civic issue you want to report.";

      if (
        visionResult.suggestedCategory &&
        visionResult.confidence >= CONFIDENCE_THRESHOLDS.WEAK_EVIDENCE_THRESHOLD
      ) {
        const category = await prisma.issueCategory.findUnique({
          where: { slug: visionResult.suggestedCategory.slug },
          select: { name: true },
        });

        if (category) {
          description = visionResult.suggestedCategory.description;
          return {
            categoryName: category.name,
            description,
            aiTags: visionResult.detectedTags.slice(0, 10),
            confidence: visionResult.confidence,
            detectedLabels: visionResult.rawVisionResult.labels?.map((l: any) => l.description) || [],
          };
        }
      }

      return {
        categoryName: null,
        description: visionResult.detectedTags.length > 0 
          ? `Civic issue detected. Tags: ${visionResult.detectedTags.slice(0, 3).join(', ')}`
          : "Please describe the civic issue you want to report.",
        aiTags: visionResult.detectedTags.slice(0, 10),
        confidence: visionResult.confidence,
        detectedLabels: visionResult.rawVisionResult.labels?.map((l: any) => l.description) || [],
      };
    } catch {
      return {
        categoryName: null,
        description: "Please describe the civic issue you want to report.",
        aiTags: [],
        confidence: 0,
        detectedLabels: [],
      };
    }
  }
}
