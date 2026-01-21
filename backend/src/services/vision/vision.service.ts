import * as vision from "@google-cloud/vision";
import axios from "axios";
import { ApiError } from "../../utils/apiError";

type CategoryRule = {
  slug: string;
  keywords: string[];
  description: string;
  priority: number;
};

export type VisionCategoryMatch = {
  slug: string;
  description: string;
  matchCount: number;
  confidence: number;
};

export const CONFIDENCE_THRESHOLDS = {
  MIN_VISION_CONFIDENCE: 0.6,
  MIN_KEYWORD_MATCHES: 1,
  WEAK_EVIDENCE_THRESHOLD: 0.6,
} as const;

const CATEGORY_MAPPING_RULES: CategoryRule[] = [
  { slug: "sewage", keywords: ["sewage", "sewerage", "manhole", "septic", "sewer pipe"], description: "Sewage system issue detected.", priority: 1 },
  { slug: "water-supply", keywords: ["water supply", "tap", "pipeline", "water pipe", "water tank", "bore well"], description: "Water supply issue detected.", priority: 2 },
  { slug: "drainage", keywords: ["storm drain", "waterlogging", "flood", "drainage block"], description: "Drainage issue identified.", priority: 3 },
  { slug: "garbage", keywords: ["garbage", "trash", "waste", "dump", "litter", "refuse", "rubbish"], description: "Garbage dumping observed at the reported location.", priority: 4 },
  { slug: "pothole", keywords: ["pothole", "road damage", "asphalt", "crack", "pavement", "road surface"], description: "Road damage detected - pothole or surface deterioration.", priority: 4 },
  { slug: "stray-cattle", keywords: ["cow", "buffalo", "cattle", "bull", "ox"], description: "Stray cattle spotted on the road causing obstruction.", priority: 4 },
  { slug: "street-light", keywords: ["street light", "lamp", "lighting", "light pole", "illumination"], description: "Street lighting issue detected.", priority: 4 },
  { slug: "tree-cutting", keywords: ["tree", "branch", "fallen tree", "vegetation", "plant"], description: "Tree-related issue requiring attention.", priority: 4 },
  { slug: "encroachment", keywords: ["construction", "building", "structure", "encroachment", "illegal"], description: "Potential encroachment or unauthorized construction detected.", priority: 4 },
];

export class VisionAIService {
  private static client: vision.ImageAnnotatorClient | null = null;

  private static initialize() {
    try {
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_VISION_KEY_PATH,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
    } catch {
      throw new ApiError(500, "Vision AI service unavailable");
    }
  }

  static async analyzeImage(imageUrl: string) {
    if (!this.client) this.initialize();
    if (!this.client) throw new ApiError(500, "Vision AI service unavailable");

    try {
      let result: any;

      try {
        [result] = await this.client.annotateImage({
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: "LABEL_DETECTION", maxResults: 15 },
            { type: "OBJECT_LOCALIZATION", maxResults: 10 },
            { type: "TEXT_DETECTION", maxResults: 5 },
          ],
        });
      } catch {
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const imageBuffer = Buffer.from(response.data);

        [result] = await this.client.annotateImage({
          image: { content: imageBuffer },
          features: [
            { type: "LABEL_DETECTION", maxResults: 15 },
            { type: "OBJECT_LOCALIZATION", maxResults: 10 },
            { type: "TEXT_DETECTION", maxResults: 5 },
          ],
        });
      }

      const labels =
        result.labelAnnotations
          ?.filter((l: any) => (l.score || 0) >= CONFIDENCE_THRESHOLDS.MIN_VISION_CONFIDENCE)
          ?.map((l: any) => l.description?.toLowerCase())
          ?.filter(Boolean) || [];

      const objects =
        result.localizedObjectAnnotations
          ?.filter((o: any) => (o.score || 0) >= CONFIDENCE_THRESHOLDS.MIN_VISION_CONFIDENCE)
          ?.map((o: any) => o.name?.toLowerCase())
          ?.filter(Boolean) || [];

      const textDetected =
        result.textAnnotations
          ?.map((t: any) => t.description?.toLowerCase())
          ?.filter(Boolean) || [];

      const allTags = [...new Set([...labels, ...objects, ...textDetected])];

      const suggestedCategory = this.findBestCategoryMatch(allTags, result.labelAnnotations || []);
      const confidence = this.calculateConfidence(result.labelAnnotations || []);

      return {
        detectedTags: allTags,
        suggestedCategory,
        confidence,
        rawVisionResult: {
          labels: result.labelAnnotations?.slice(0, 5),
          objects: result.localizedObjectAnnotations?.slice(0, 3),
          hasText: (result.textAnnotations?.length || 0) > 0,
        },
      };
    } catch {
      throw new ApiError(500, "Failed to analyze image with Vision AI");
    }
  }

  private static findBestCategoryMatch(detectedTags: string[], visionLabels: any[]): VisionCategoryMatch | null {
    let bestMatch: VisionCategoryMatch | null = null;
    let maxScore = 0;

    const sortedRules = [...CATEGORY_MAPPING_RULES].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        detectedTags.some((tag) => tag.includes(keyword) || keyword.includes(tag))
      );

      if (matchedKeywords.length >= CONFIDENCE_THRESHOLDS.MIN_KEYWORD_MATCHES) {
        const visionConfidence = this.getAverageConfidenceForKeywords(matchedKeywords, visionLabels);
        const priorityBonus = rule.priority === 1 ? 0.3 : 0;
        const score = matchedKeywords.length + priorityBonus + visionConfidence;

        if (score > maxScore) {
          maxScore = score;
          bestMatch = {
            slug: rule.slug,
            description: rule.description,
            matchCount: matchedKeywords.length,
            confidence: visionConfidence,
          };
        }
      }
    }

    const hasSewageKeywords = detectedTags.some((tag) =>
      ["sewage", "sewerage", "manhole", "septic"].some((kw) => tag.includes(kw) || kw.includes(tag))
    );

    if (hasSewageKeywords && bestMatch?.slug === "drainage") {
      const sewageRule = CATEGORY_MAPPING_RULES.find((r) => r.slug === "sewage");
      if (sewageRule) {
        bestMatch = { slug: sewageRule.slug, description: sewageRule.description, matchCount: 1, confidence: 0.8 };
      }
    }

    if (!bestMatch || maxScore < CONFIDENCE_THRESHOLDS.WEAK_EVIDENCE_THRESHOLD) return null;
    return bestMatch;
  }

  private static getAverageConfidenceForKeywords(keywords: string[], visionLabels: any[]): number {
    const relevant = visionLabels.filter((label) =>
      keywords.some((kw) => label.description?.toLowerCase().includes(kw) || kw.includes(label.description?.toLowerCase()))
    );
    if (!relevant.length) return 0;
    return relevant.reduce((sum: number, l: any) => sum + (l.score || 0), 0) / relevant.length;
  }

  private static calculateConfidence(labels: any[]): number {
    if (!labels?.length) return 0;
    const top = labels.slice(0, 3);
    const avg = top.reduce((sum: number, l: any) => sum + (l.score || 0), 0) / top.length;
    return Math.round(avg * 100) / 100;
  }
}