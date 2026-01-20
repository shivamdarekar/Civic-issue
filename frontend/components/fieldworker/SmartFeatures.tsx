"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Camera, MapPin, Star, QrCode } from "lucide-react";
import { SpeakableText } from "@/components/ui/SpeakableText";

interface SmartFeaturesProps {
  onVoiceText: (text: string) => void;
  onPhotoCapture: (photo: string) => void;
  onFeedback: (rating: number) => void;
}

export default function SmartFeatures({ onVoiceText, onPhotoCapture, onFeedback }: SmartFeaturesProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [citizenRating, setCitizenRating] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setVoiceText(finalTranscript);
          onVoiceText(finalTranscript);
        }
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
        alert('Voice recognition error. Please try again.');
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
  };

  const handleBeforeAfterPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photo = event.target?.result as string;
          onPhotoCapture(photo);
          alert('Photo captured for before/after comparison');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCitizenFeedback = (rating: number) => {
    setCitizenRating(rating);
    onFeedback(rating);
    alert(`Citizen feedback recorded: ${rating}/5 stars`);
    setShowFeedback(false);
  };

  const handleBarcodeScan = () => {
    const mockBarcodes = ['EQ001-SHOVEL', 'EQ002-CEMENT', 'EQ003-TOOLS'];
    const scanned = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    alert(`Equipment scanned: ${scanned}`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Mic className="w-4 h-4" />
          <SpeakableText>Voice Description</SpeakableText>
        </h4>
        <div className="flex gap-2 mb-3">
          <Button 
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`flex-1 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isRecording ? 'Stop Recording' : 'Start Voice Recording'}
          </Button>
        </div>
        {voiceText && (
          <div className="p-3 bg-gray-50 rounded border">
            <p className="text-sm">{voiceText}</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <SpeakableText>Resolution Proof</SpeakableText>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleBeforeAfterPhoto} variant="outline">
            📷 Before Photo
          </Button>
          <Button onClick={handleBeforeAfterPhoto} variant="outline">
            📷 After Photo
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          <SpeakableText>Equipment & Materials</SpeakableText>
        </h4>
        <div className="space-y-2">
          <Button onClick={handleBarcodeScan} variant="outline" className="w-full">
            <SpeakableText text="Scan Equipment Barcode">📱 Scan Equipment Barcode</SpeakableText>
          </Button>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded">
              <div className="font-medium">Materials Used</div>
              <div>Cement: 2 bags</div>
              <div>Sand: 1 trolley</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="font-medium">Time Spent</div>
              <div>Start: 9:30 AM</div>
              <div>Duration: 2.5 hrs</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          <SpeakableText>Citizen Satisfaction</SpeakableText>
        </h4>
        {!showFeedback ? (
          <Button 
            onClick={() => setShowFeedback(true)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <SpeakableText text="Collect Citizen Feedback">Collect Citizen Feedback</SpeakableText>
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">Rate the work quality (1-5 stars):</p>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => handleCitizenFeedback(star)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= citizenRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <Button 
              onClick={() => setShowFeedback(false)}
              variant="outline" 
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}