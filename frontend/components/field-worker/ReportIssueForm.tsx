"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Camera, Upload, Send, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategories, uploadBeforeImages, createIssue, deleteImage } from "@/redux/slices/issuesSlice";
import { fetchFieldWorkerDashboard } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import VMCLoader from "@/components/ui/VMCLoader";
import AIImageScanner from "./AIImageScanner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  department: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

export default function ReportIssueForm() {
  const dispatch = useAppDispatch();
  const { categories, loading: issuesLoading } = useAppSelector((state) => state.issues);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string; publicId: string; mimeType: string; fileSize: number}>>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [deletingImages, setDeletingImages] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [gpsPermission, setGpsPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [open, setOpen] = useState(false);
  const [aiDetectedCategory, setAiDetectedCategory] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const requestGPSPermission = async () => {
    if (!navigator.geolocation) {
      toast.error("GPS is not supported by this browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsPermission("granted");
        setLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsPermission("denied");
        setLoading(false);
        toast.error("GPS permission denied or location unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const requestCameraPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Camera permission denied");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `captured-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
            
            // Clear existing images if replacing
            if (uploadedImages.length > 0) {
              setImages([]);
              setUploadedImages([]);
              setAiDetectedCategory(null);
              setAiConfidence(0);
            }
            
            setImages(prev => [...prev, file]);
            uploadImage(file);
            stopCamera();
          }
        }, "image/jpeg", 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      const fileArray = Array.from(files);
      
      // Clear existing images if replacing
      if (uploadedImages.length > 0) {
        setImages([]);
        setUploadedImages([]);
        setAiDetectedCategory(null);
        setAiConfidence(0);
      }
      
      setImages(prev => [...prev, ...fileArray]);
      
      try {
        await Promise.all(fileArray.map(file => uploadImage(file)));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const uploadImage = async (file: File) => {
    const tempIndex = images.length;
    setUploadingImages(prev => new Set(prev).add(tempIndex));
    
    try {
      const result = await dispatch(uploadBeforeImages([file])).unwrap();
      if (result && result.length > 0) {
        setUploadedImages(prev => [...prev, result[0]]);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image. Please try again.");
      // Remove failed file from images array
      setImages(prev => prev.filter((_, i) => i !== tempIndex));
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempIndex);
        return newSet;
      });
    }
  };

  const getDescriptionForCategory = (categoryName: string, department: string) => {
    const name = categoryName.toLowerCase();
    
    if (name === "pothole") {
      return "Issue Identified for ROAD department - Road potholes and surface damage requiring immediate repair.";
    } else if (name === "stray cattle") {
      return "Issue Identified for TOWN_PLANNING department - Stray animals on roads causing traffic disruption.";
    } else if (name === "garbage dump") {
      return "Issue Identified for SOLID_WASTE_MANAGEMENT department - Illegal garbage dumping affecting public hygiene.";
    } else if (name === "street light not working") {
      return "Issue Identified for STREET_LIGHT department - Street light is not functioning properly.";
    } else if (name === "water supply issue") {
      return "Issue Identified for WATER_WORKS department - Water supply problems affecting residents.";
    } else if (name === "drainage blockage") {
      return "Issue Identified for STORM_WATER_DRAINAGE department - Blocked or overflowing drainage system.";
    } else if (name === "sewage issue") {
      return "Issue Identified for SEWAGE_DISPOSAL department - Sewage overflow or blockage causing health hazards.";
    } else if (name === "tree cutting required") {
      return "Issue Identified for PARKS_GARDENS department - Fallen or dangerous tree requiring attention.";
    } else if (name === "illegal encroachment") {
      return "Issue Identified for ENCROACHMENT department - Unauthorized construction or occupation of public space.";
    } else {
      return `Issue Identified for ${department} department - ${categoryName} reported requiring attention.`;
    }
  };

  const handleAICategoryDetection = (categoryId: string, confidence: number) => {
    setAiDetectedCategory(categoryId);
    setAiConfidence(confidence);
    
    if (confidence >= 0.5) {
      setSelectedCategory(categoryId);
      
      const selectedCat = categories.find(cat => cat.id === categoryId);
      if (selectedCat) {
        setDescription(getDescriptionForCategory(selectedCat.name, selectedCat.department));
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageToDelete = uploadedImages[index];
    if (imageToDelete) {
      setDeletingImages(prev => new Set(prev).add(index));
      
      try {
        await dispatch(deleteImage(imageToDelete.url)).unwrap();
        setImages(prev => prev.filter((_, i) => i !== index));
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
      } catch (error) {
        console.error("Failed to delete image:", error);
        toast.error("Failed to delete image. Please try again.");
      } finally {
        setDeletingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    
    if (!uploadedImages.length) {
      toast.error("Please upload at least one image");
      return;
    }
    
    if (!location) {
      toast.error("Please allow GPS permission to get your location");
      return;
    }

    setLoading(true);
    
    try {
      const issueData = {
        categoryId: selectedCategory,
        description,
        priority: priority,
        latitude: location.latitude,
        longitude: location.longitude,
        media: uploadedImages.map(img => ({
          url: img.url,
          mimeType: img.mimeType,
          fileSize: img.fileSize,
          type: "BEFORE"
        }))
      };

      await dispatch(createIssue(issueData)).unwrap();
      toast.success("Issue reported successfully!");
      
      // Reset form
      setSelectedCategory("");
      setPriority("MEDIUM");
      setDescription("");
      setImages([]);
      setUploadedImages([]);
      setLocation(null);
      setGpsPermission("prompt");
      setAiDetectedCategory(null);
      setAiConfidence(0);
      setOpen(false);
      
      // Fetch updated dashboard data
      dispatch(fetchFieldWorkerDashboard(10));
      
    } catch (error) {
      console.error("Failed to submit issue:", error);
      toast.error("Failed to submit issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        // Reset all form data when dialog closes
        setSelectedCategory("");
        setPriority("MEDIUM");
        setDescription("");
        setImages([]);
        setUploadedImages([]);
        setLocation(null);
        setGpsPermission("prompt");
        setAiDetectedCategory(null);
        setAiConfidence(0);
        setLoading(false);
        setIsUploading(false);
        setUploadingImages(new Set());
        setDeletingImages(new Set());
        stopCamera();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full sm:w-auto" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Report New Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Report New Issue</DialogTitle>
          <DialogDescription>
            Fill out the form below to report a new civic issue. GPS location and photo are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: GPS Permission */}
          {gpsPermission === "prompt" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location (GPS Required) - Step 1
              </label>
              <button
                type="button"
                onClick={requestGPSPermission}
                disabled={loading}
                className="w-full p-3 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {loading ? "Getting Location..." : "Allow GPS Permission"}
              </button>
            </div>
          )}

          {/* GPS Status */}
          {gpsPermission === "granted" && location && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              ✓ Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          )}
          {gpsPermission === "denied" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              ✗ GPS permission denied. Please enable location access.
            </div>
          )}

          {/* Step 2: Photo Upload - Only show if GPS is granted */}
          {gpsPermission === "granted" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Photo <span className="text-red-500">*</span> - Step 2
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={requestCameraPermission}
                  disabled={isUploading}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5" />
                  {uploadedImages.length > 0 ? "Retake Photo" : "Take Photo"}
                </button>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  {isUploading ? "Uploading..." : uploadedImages.length > 0 ? "Reupload Photo" : "Upload Photo"}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {showCamera && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Capture
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Images ({uploadedImages.length})</label>
              <div className="grid grid-cols-4 gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    {deletingImages.has(index) ? (
                      <div className="absolute top-0 right-0 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-xs">
                        <VMCLoader size={12} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={deletingImages.has(index)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* AI Scanner for the first uploaded image */}
              {uploadedImages.length > 0 && (
                <AIImageScanner
                  imageUrl={uploadedImages[0].url}
                  categories={categories}
                  onCategoryDetected={handleAICategoryDetection}
                />
              )}
            </div>
          )}

          {/* Step 3: Category and Description - Only show if photos are uploaded */}
          {uploadedImages.length > 0 && (
            <>
              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span> - Step 3
                  {aiDetectedCategory && aiConfidence >= 0.7 && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (AI Auto-detected)
                    </span>
                  )}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    
                    const selectedCat = categories.find(cat => cat.id === e.target.value);
                    if (selectedCat) {
                      setDescription(getDescriptionForCategory(selectedCat.name, selectedCat.department));
                    }
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    aiDetectedCategory && selectedCategory === aiDetectedCategory
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.department})
                      {aiDetectedCategory === category.id && ` - AI: ${(aiConfidence * 100).toFixed(0)}%`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="LOW">Low - Minor issue, can wait</option>
                  <option value="MEDIUM">Medium - Normal priority</option>
                  <option value="HIGH">High - Needs attention soon</option>
                  <option value="CRITICAL">Critical - Urgent, safety concern</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || issuesLoading || !selectedCategory || !uploadedImages.length || !location}
                className="w-full"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading || issuesLoading ? "Submitting..." : "Report Issue"}
              </Button>
            </>
          )}
        </form>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}