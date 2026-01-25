"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WifiOff, Camera, MapPin, Clock, Upload } from "lucide-react";
import { offlineDB, OfflineIssue } from "@/lib/offline-db";
import { toast } from "sonner";

const OFFLINE_CATEGORIES = [
  {
    id: "0031ab9c-8434-4abf-ad1d-371b0396ab0d",
    name: "Drainage Blockage",
    slug: "drainage",
    description: "Blocked or overflowing drainage",
    department: "STORM_WATER_DRAINAGE"
  },
  {
    id: "872983d4-9f87-483e-897a-d629c0639bcc",
    name: "Garbage Dump",
    slug: "garbage",
    description: "Illegal garbage dumping",
    department: "SOLID_WASTE_MANAGEMENT"
  },
  {
    id: "1dfe9c28-c4cb-4736-96be-5914d873e995",
    name: "Illegal Encroachment",
    slug: "encroachment",
    description: "Unauthorized construction or occupation",
    department: "ENCROACHMENT"
  },
  {
    id: "9e713776-f4df-490b-8e83-fd3ffbac1576",
    name: "Pothole",
    slug: "pothole",
    description: "Road potholes and surface damage",
    department: "ROAD"
  },
  {
    id: "f42a894b-beea-4821-9b57-37f533bd036f",
    name: "Sewage Issue",
    slug: "sewage",
    description: "Sewage overflow or blockage",
    department: "SEWAGE_DISPOSAL"
  },
  {
    id: "82dc9c43-a032-4e6f-821b-f91633fa0ab4",
    name: "Stray Cattle",
    slug: "stray-cattle",
    description: "Stray animals on roads",
    department: "TOWN_PLANNING"
  },
  {
    id: "7193ad4f-23de-4d52-8176-258cc69cefa1",
    name: "Street Light Not Working",
    slug: "street-light",
    description: "Street light is not functioning",
    department: "STREET_LIGHT"
  },
  {
    id: "623ecb30-31bc-4933-8014-7cfa9feed3bf",
    name: "Tree Cutting Required",
    slug: "tree-cutting",
    description: "Fallen or dangerous tree",
    department: "PARKS_GARDENS"
  },
  {
    id: "c357a108-6c00-4abd-b791-a54a031190ac",
    name: "Water Supply Issue",
    slug: "water-supply",
    description: "Water supply problems",
    department: "WATER_WORKS"
  }
];

interface OfflineReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation?: { latitude: number; longitude: number; address: string };
}

export default function OfflineReportDialog({
  open,
  onOpenChange,
  currentLocation
}: OfflineReportDialogProps) {
  const [formData, setFormData] = useState<{
    description: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>({
    description: "",
    category: "",
    priority: "MEDIUM"
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(currentLocation || null);
  const [gpsPermission, setGpsPermission] = useState<"granted" | "denied" | "prompt">(currentLocation ? "granted" : "prompt");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

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
          const newLocation = { ...coords, address };
          setLocation(newLocation);
        } catch (error) {
          // Fallback to coordinates if reverse geocoding fails
          const newLocation = { ...coords, address: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` };
          setLocation(newLocation);
        }
        
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

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Use backend API to avoid CORS issues
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/geo/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      
      if (data && data.data && data.data.address) {
        return data.data.address;
      }
      
      throw new Error('No address found');
    } catch (error) {
      // Fallback to coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
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
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setImages([event.target!.result as string]);
              }
            };
            reader.readAsDataURL(blob);
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

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages([event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !images.length || !location) return;

    setIsSubmitting(true);
    
    try {
      const offlineIssue: OfflineIssue = {
        tempId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.description || `${OFFLINE_CATEGORIES.find(c => c.id === formData.category)?.name} Issue`,
        description: formData.description,
        categoryId: formData.category,
        location: location,
        images,
        priority: formData.priority,
        createdAt: new Date(),
        syncStatus: 'pending',
        retryCount: 0
      };

      await offlineDB.issues.add(offlineIssue);
      
      toast.success("Issue saved offline! Will sync when online.", {
        description: "Your report has been stored locally and will be uploaded automatically when you're back online."
      });

      // Reset form
      setFormData({ description: "", category: "", priority: "MEDIUM" });
      setImages([]);
      stopCamera();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Failed to save offline issue:', error);
      toast.error("Failed to save issue offline");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-orange-600" />
            Report Issue Offline
          </DialogTitle>
        </DialogHeader>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-orange-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">You&apos;re offline</span>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            This issue will be saved locally and synced when you&apos;re back online.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GPS Permission */}
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
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">✓ Location captured:</p>
                  <p className="text-sm mt-1">{location.address}</p>
                </div>
              </div>
            </div>
          )}
          {gpsPermission === "denied" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              ✗ GPS permission denied. Please enable location access.
            </div>
          )}

          {/* Photo Upload - Only show if GPS is granted */}
          {gpsPermission === "granted" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Photo <span className="text-red-500">*</span> - Step 2
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={requestCameraPermission}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  {images.length > 0 ? "Retake Photo" : "Take Photo"}
                </button>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {images.length > 0 ? "Replace Photo" : "Upload Photo"}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
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

          {/* Image Preview & Form fields - Only show if GPS granted and photo uploaded */}
          {gpsPermission === "granted" && images.length > 0 && (
            <>
              {/* Image Preview */}
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={images[0]}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setImages([])}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span> - Step 3
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }));
                    
                    const selectedCat = OFFLINE_CATEGORIES.find(cat => cat.id === value);
                    if (selectedCat) {
                      setFormData(prev => ({ 
                        ...prev, 
                        description: getDescriptionForCategory(selectedCat.name, selectedCat.department)
                      }));
                    }
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFLINE_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-gray-700">Priority <span className="text-red-500">*</span></label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Minor issue, can wait</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Normal priority</SelectItem>
                    <SelectItem value="HIGH">High - Needs attention soon</SelectItem>
                    <SelectItem value="CRITICAL">Critical - Urgent, safety concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{location.address}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.category || !images.length || !location}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Saving..." : "Save Offline"}
              </Button>
            </>
          )}

          {/* Cancel Button - Always show */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}