"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Camera, Upload, Send, Plus, WifiOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategories, uploadBeforeImages, createIssue, deleteImage } from "@/redux/slices/issuesSlice";
import { fetchFieldWorkerDashboard } from "@/redux/slices/userSlice";
import { fetchIssueStats } from "@/redux/slices/issuesSlice";
import { Button } from "@/components/ui/button";
import VMCLoader from "@/components/ui/VMCLoader";
import AIImageScanner from "./AIImageScanner";
import OfflineReportDialog from "./OfflineReportDialog";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
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
  address?: string;
}

interface ReportIssueFormProps {
  onIssueReported?: () => void;
}

export default function ReportIssueForm({ onIssueReported }: ReportIssueFormProps) {
  const dispatch = useAppDispatch();
  const { categories, loading: issuesLoading } = useAppSelector((state) => state.issues);
  const { user } = useAppSelector((state) => state.userState);
  const isOnline = useOnlineStatus();
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
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [aiDetectedCategory, setAiDetectedCategory] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

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
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        // Get address from coordinates using reverse geocoding
        try {
          const address = await reverseGeocode(coords.latitude, coords.longitude);
          setLocation({ ...coords, address });
        } catch (error) {
          // Fallback to coordinates if reverse geocoding fails
          setLocation({ ...coords, address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` });
        }
        
        setGpsPermission("granted");
        setLoading(false);
      },
      (error) => {
        setGpsPermission("denied");
        setLoading(false);
        toast.error("GPS permission denied or location unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Simple coordinate validation - no address lookup
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const requestCameraPermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      if (facingMode === 'environment') {
        try {
          const fallbackConstraints = { video: { facingMode: 'user' } };
          const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          setStream(mediaStream);
          setShowCamera(true);
          setFacingMode('user');
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (fallbackError) {
          toast.error("Camera not available");
        }
      } else {
        toast.error("Camera permission denied");
      }
    }
  };

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    try {
      const constraints = { video: { facingMode: newFacingMode } };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error("Failed to switch camera");
      setFacingMode(facingMode);
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
      toast.error("Failed to upload image. Please try again.");
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
        address: location.address,
        media: uploadedImages.map(img => ({
          url: img.url,
          mimeType: img.mimeType,
          fileSize: img.fileSize,
          type: "BEFORE"
        }))
      };

      await dispatch(createIssue(issueData)).unwrap();
      toast.success("Issue reported successfully!");
      
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
      
      // Refresh dashboard and statistics
      dispatch(fetchFieldWorkerDashboard(10));
      
      // Refresh issue statistics for the field worker
      if (user?.id) {
        dispatch(fetchIssueStats({ reporterId: user.id }));
      }
      
      onIssueReported?.(); // Call the callback to trigger refresh
      
    } catch (error: any) {
      if (error?.message?.includes("outside VMC jurisdiction") || 
          error?.message?.includes("ward boundaries") ||
          error?.message?.includes("not in any VMC ward")) {
        toast.error("❌ Outside VMC area! Please report issues only within VMC boundaries.");
      } else {
        toast.error(error?.message || "❌ Issue creation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = () => {
    if (isOnline) {
      setOpen(true);
    } else {
      setOfflineOpen(true);
    }
  };

  return (
    <>
      {isOnline ? (
        <Button 
          onClick={handleReportClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 w-full sm:w-auto" 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report New Issue
        </Button>
      ) : (
        <Button 
          onClick={handleReportClick}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 w-full sm:w-auto" 
          size="sm"
        >
          <WifiOff className="w-4 h-4 mr-2" />
          Report Offline
        </Button>
      )}

      <OfflineReportDialog
        open={offlineOpen}
        onOpenChange={setOfflineOpen}
        currentLocation={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        } : undefined}
      />

      {isOnline && (
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Report New Issue</DialogTitle>
          <DialogDescription>
            Fill out the form below to report a new civic issue. GPS location and photo are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                {availableCameras.length > 1 && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    🔄
                  </button>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  📸 Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  ❌ Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Using {facingMode === 'environment' ? 'Back' : 'Front'} Camera
                {availableCameras.length > 1 && ' • Tap 🔄 to switch'}
              </p>
            </div>
          )}

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
              
              {uploadedImages.length > 0 && (
                <AIImageScanner
                  imageUrl={uploadedImages[0].url}
                  categories={categories}
                  onCategoryDetected={handleAICategoryDetection}
                />
              )}
            </div>
          )}

          {uploadedImages.length > 0 && (
            <>
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
      )}
    </>
  );
}