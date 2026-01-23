"use client";

import { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import { Brain, CheckCircle, AlertCircle } from "lucide-react";

interface Prediction {
  className: string;
  probability: number;
}

interface AIImageScannerProps {
  imageUrl: string;
  categories: any[];
  onCategoryDetected: (categoryId: string, confidence: number) => void;
}

export default function AIImageScanner({ 
  imageUrl, 
  categories, 
  onCategoryDetected 
}: AIImageScannerProps) {
  const modelRef = useRef<tmImage.CustomMobileNet | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load model once
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Suppress TensorFlow warnings
        console.warn = () => {};
        
        const modelURL = "/model/model.json";
        const metadataURL = "/model/metadata.json";
        modelRef.current = await tmImage.load(modelURL, metadataURL);
        setLoading(false);
        
        // Restore console.warn
        console.warn = console.log;
      } catch (err) {
        setError("Failed to load AI model");
        console.error(err);
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  // Scan image when URL changes
  useEffect(() => {
    if (imageUrl && modelRef.current && !loading) {
      scanImage();
    }
  }, [imageUrl, loading]);

  const scanImage = async () => {
    if (!modelRef.current || !imageRef.current) return;

    setScanning(true);
    setError(null);

    try {
      const predictions = await modelRef.current.predict(imageRef.current);
      predictions.sort((a: Prediction, b: Prediction) => b.probability - a.probability);
      
      const topPrediction = predictions[0];
      setResult(topPrediction);

      // Map AI prediction to category
      const detectedCategory = mapPredictionToCategory(topPrediction.className);
      if (detectedCategory && topPrediction.probability > 0.4) {
        onCategoryDetected(detectedCategory.id, topPrediction.probability);
      }
      
      // Handle "Normal" detection
      if (topPrediction.className.toLowerCase() === "normal" && topPrediction.probability > 0.7) {
        // Don't auto-select category for normal images
        console.log("AI detected normal image - no issue found");
      }
    } catch (err) {
      setError("Failed to scan image");
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const mapPredictionToCategory = (prediction: string): any | null => {
    const normalizedPrediction = prediction.toLowerCase().trim();
    
    // Direct mapping from AI model labels to category matching
    const aiToCategoryMap: { [key: string]: string[] } = {
      "drainage blockage": ["drainage", "drain", "water logging", "flood"],
      "garbage dump": ["garbage", "waste", "solid waste", "trash", "litter"],
      "illegal encroachment": ["encroachment", "illegal", "unauthorized"],
      "pothole": ["pothole", "road", "street", "pavement"],
      "stray cattle": ["stray", "cattle", "animal"],
      "street light not working": ["street light", "streetlight", "light", "lighting"],
      "tree cutting required": ["tree", "cutting", "pruning", "garden"],
      "water supply issue": ["water supply", "water", "pipe", "tap"],
      "sewage issue": ["sewage", "sewer", "drainage"]
    };

    // First try direct match with AI prediction
    for (const category of categories) {
      const categoryName = category.name.toLowerCase();
      const categorySlug = category.slug.toLowerCase();
      
      // Check if AI prediction matches category directly
      if (normalizedPrediction === categoryName || 
          normalizedPrediction === categorySlug) {
        return category;
      }
    }

    // Then try mapping through keywords
    const mappingKeys = aiToCategoryMap[normalizedPrediction] || [];
    
    for (const category of categories) {
      const categoryName = category.name.toLowerCase();
      const categorySlug = category.slug.toLowerCase();
      
      // Check if any mapping keywords match the category
      for (const keyword of mappingKeys) {
        if (categoryName.includes(keyword) || 
            categorySlug.includes(keyword) ||
            keyword.includes(categoryName) ||
            keyword.includes(categorySlug)) {
          return category;
        }
      }
    }

    return null;
  };

  const getConfidenceColor = (probability: number) => {
    if (probability >= 0.8) return "text-green-600";
    if (probability >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceIcon = (probability: number) => {
    if (probability >= 0.6) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-700">Loading AI model...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Hidden image for AI processing */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="AI Analysis"
        className="hidden"
        crossOrigin="anonymous"
        onLoad={() => {
          if (modelRef.current && !scanning) {
            scanImage();
          }
        }}
      />

      {/* AI Scanning Status */}
      {scanning && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-sm text-blue-700">AI scanning image...</span>
        </div>
      )}

      {/* AI Results */}
      {result && !scanning && (
        <div className={`p-3 border rounded-lg ${
          result.className.toLowerCase() === 'normal' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">AI Detection</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConfidenceIcon(result.probability)}
              <span className={`text-sm font-medium ${
                result.className.toLowerCase() === 'normal' 
                  ? 'text-green-700' 
                  : ''
              }`}>
                {result.className}
                {result.className.toLowerCase() === 'normal' && ' - No Issue Detected'}
              </span>
            </div>
            <span className={`text-sm font-medium ${getConfidenceColor(result.probability)}`}>
              {(result.probability * 100).toFixed(1)}%
            </span>
          </div>

          {result.probability < 0.6 && (
            <p className="text-xs text-gray-500 mt-1">
              Low confidence - please verify category manually
            </p>
          )}
          
          {result.className.toLowerCase() === 'normal' && result.probability > 0.7 && (
            <p className="text-xs text-green-600 mt-1">
              AI suggests this image shows no civic issues
            </p>
          )}
        </div>
      )}
    </div>
  );
}