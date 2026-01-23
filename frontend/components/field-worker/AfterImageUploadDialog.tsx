"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/redux/hooks";
import { uploadAfterImages, addAfterMedia } from "@/redux/slices/issuesSlice";
import VMCLoader from "@/components/ui/VMCLoader";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AfterImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  onSuccess?: () => void;
}

export default function AfterImageUploadDialog({
  isOpen,
  onClose,
  issueId,
  onSuccess
}: AfterImageUploadDialogProps) {
  const dispatch = useAppDispatch();
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string; mimeType: string; fileSize: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
            const file = new File([blob], `after-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
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
      const fileArray = Array.from(files);
      setImages(prev => [...prev, ...fileArray]);
      
      for (const file of fileArray) {
        await uploadImage(file);
      }
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await dispatch(uploadAfterImages([file])).unwrap();
      if (result && result.length > 0) {
        setUploadedImages(prev => [...prev, result[0]]);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one after image");
      return;
    }

    setLoading(true);
    try {
      const result = await dispatch(addAfterMedia({
        issueId,
        media: uploadedImages,
        markResolved: false // Don't change status, just add images
      })).unwrap();
      
      console.log('After media upload result:', result);
      toast.success("After images uploaded successfully!");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Failed to submit after images:", error);
      toast.error(`Failed to submit after images: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setImages([]);
    setUploadedImages([]);
    setLoading(false);
    setUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add After Images</DialogTitle>
          <DialogDescription>
            Upload photos showing the completed work for this resolved issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="button"
              onClick={requestCameraPermission}
              disabled={loading || uploading}
              variant="outline"
              className="p-4 h-auto flex flex-col items-center gap-2"
            >
              {uploading ? (
                <>
                  <VMCLoader size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  Take Photo
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              variant="outline"
              className="p-4 h-auto flex flex-col items-center gap-2"
            >
              {uploading ? (
                <>
                  <VMCLoader size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  Upload Photos
                </>
              )}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

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
                <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                After Images ({uploadedImages.length})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`After image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose} disabled={loading || uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || uploading || uploadedImages.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <VMCLoader size={16} />
                  Uploading...
                </>
              ) : (
                "Submit After Images"
              )}
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}