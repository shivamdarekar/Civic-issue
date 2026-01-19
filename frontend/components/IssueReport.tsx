"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Save, Send, X, CheckCircle, Lightbulb, MapPin } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { offlineStorage, CivicIssue } from "@/lib/offline-storage";
import { aiSuggestions, AIAnalysis } from "@/lib/ai-suggestions";
import { useLanguage } from "@/lib/language-context";

interface IssueReportProps {
  onClose: () => void;
  onSave: () => void;
}

const ISSUE_TYPES = [
  { id: "pothole", icon: "🕳️", priority: "high" },
  { id: "garbage", icon: "🗑️", priority: "medium" },
  { id: "drainage", icon: "🌊", priority: "high" },
  { id: "streetlight", icon: "💡", priority: "medium" },
  { id: "road", icon: "🛣️", priority: "high" },
  { id: "water", icon: "💧", priority: "critical" },
  { id: "manhole", icon: "⚠️", priority: "critical" },
  { id: "cattle", icon: "🐄", priority: "medium" },
];

export default function IssueReport({ onClose, onSave }: IssueReportProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [description, setDescription] = useState("");
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [ward, setWard] = useState<string>("");
  const [employeeId, setEmployeeId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    offlineStorage.initializeWards();
    const storedEmployeeId = localStorage.getItem('employeeId') || 'FW001';
    setEmployeeId(storedEmployeeId);
  }, []);

  const captureLocation = () => {
    setIsCapturingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(newLocation);
          
          const detectedWard = await offlineStorage.getWardByLocation(
            newLocation.lat, 
            newLocation.lng
          );
          setWard(detectedWard?.name || "Ward Detection Failed");
          
          setIsCapturingLocation(false);
        },
        (error) => {
          console.error("Location error:", error);
          alert(t('issue.location.error'));
          setIsCapturingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size too large. Please use a smaller image.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPhotos([...photos, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async (asDraft = false) => {
    if (!selectedType || !location || photos.length === 0) {
      alert('Please complete all required fields: Issue type, location, and at least one photo.');
      return;
    }

    setIsSaving(true);
    
    try {
      const issueType = ISSUE_TYPES.find(t => t.id === selectedType);
      const issue: Omit<CivicIssue, 'id'> = {
        type: selectedType,
        description: description || `${selectedType} reported by field worker`,
        location,
        ward: ward || "Unknown Ward",
        photos,
        timestamp: new Date(),
        reportedBy: employeeId,
        status: asDraft ? 'draft' : 'pending_sync',
        priority: (issueType?.priority as any) || 'medium',
        aiSuggestion: aiAnalysis?.description
      };

      await offlineStorage.saveIssue(issue);
      
      alert(asDraft ? t('issue.saved.draft') : t('issue.reported.success'));
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      alert(t('issue.save.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {t('issue.report.title')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > num ? <CheckCircle className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>

          {/* Step 1: Issue Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('issue.select.type')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ISSUE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-gray-800 text-center">
                      {t(`issue.type.${type.id}`)}
                    </div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded ${
                      type.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      type.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {type.priority.toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
              
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedType}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {t('next')}
              </Button>
            </div>
          )}

          {/* Step 2: Location & Photos */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('issue.location.photos')}
              </h3>
              
              {/* Location */}
              <div className="space-y-2">
                <Button
                  onClick={captureLocation}
                  disabled={isCapturingLocation}
                  className={`w-full ${
                    location ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isCapturingLocation 
                    ? t('issue.getting.location')
                    : location 
                    ? t('issue.location.captured')
                    : t('issue.get.location')
                  }
                </Button>
                {location && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="text-xs text-gray-600">
                      📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Accuracy: ±{location.accuracy?.toFixed(0)}m
                    </div>
                    {ward && (
                      <div className="text-sm text-green-700 font-medium mt-1">
                        🏛️ {ward}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {t('issue.take.photo')} ({photos.length}/3)
                </Button>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-gray-200"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-gray-300 bg-white text-gray-800"
                >
                  {t('back')}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!location || photos.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Description & Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t('issue.description.submit')}
              </h3>
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('issue.description.optional')}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder:text-gray-400 resize-none"
                rows={3}
              />

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {ISSUE_TYPES.find(t => t.id === selectedType)?.icon}
                  </span>
                  <span className="text-gray-800 font-medium">
                    {t(`issue.type.${selectedType}`)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  📍 {t('issue.location')}: {location ? "✓ Captured" : "✗ Missing"}
                </div>
                <div className="text-sm text-gray-600">
                  📷 {t('issue.photos')}: {photos.length}
                </div>
                <div className="text-sm text-gray-600">
                  👤 Employee: {employeeId}
                </div>
                {ward && (
                  <div className="text-sm text-blue-600">
                    🏛️ {t('issue.ward')}: {ward}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-gray-300 bg-white text-gray-800"
                >
                  {t('back')}
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  variant="outline"
                  className="flex-1 border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {t('draft')}
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-1" />
                  {t('send')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}