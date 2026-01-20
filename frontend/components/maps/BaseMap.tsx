"use client";

import { useState, useEffect } from "react";
import { Navigation, MapPin, Layers } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { offlineStorage } from "@/lib/offline-storage";

interface BaseMapProps {
  heatmap?: boolean;
  showIssues?: boolean;
}

export default function BaseMap({ heatmap = false, showIssues = false }: BaseMapProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [ward, setWard] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    if (showIssues) {
      loadNearbyIssues();
    }
  }, [showIssues, location]);

  const loadNearbyIssues = async () => {
    try {
      const allIssues = await offlineStorage.getPendingIssues();
      setIssues(allIssues.slice(0, 10)); // Show max 10 issues
    } catch (error) {
      console.error('Error loading issues:', error);
    }
  };

  const captureLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setLocation(newLocation);
          
          try {
            const detectedWard = await offlineStorage.getWardByLocation(
              newLocation.lat, 
              newLocation.lng
            );
            setWard(detectedWard?.name || "Ward not detected");
          } catch (error) {
            console.error('Ward detection error:', error);
            setWard("Ward detection failed");
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error("Location error:", error);
          let errorMessage = "Unable to get location. ";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Unknown error occurred.";
              break;
          }
          alert(errorMessage);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 60000 // Cache for 1 minute
        }
      );
    } else {
      alert("Geolocation is not supported by this device.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-50 flex flex-col border border-gray-200 rounded-lg overflow-hidden">
      {/* Map Header */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded">
              <Image 
                src="/VMC.webp" 
                alt="VMC Logo" 
                width={16} 
                height={16} 
                className="w-4 h-4 object-contain"
              />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">
              {heatmap ? "Issue Heatmap" : "Location Map"}
            </h3>
          </div>
          
          {showIssues && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Layers className="w-3 h-3" />
              <span>{issues.length} Issues</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center space-y-3 max-w-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full border-2 border-blue-200">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-3">
                {heatmap ? "Issue density visualization" : "Interactive location services"}
              </p>
              
              {location && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                    <div>🎯 Accuracy: ±{location.accuracy?.toFixed(0)}m</div>
                    {ward && (
                      <div className="text-blue-600 font-medium">🏛️ {ward}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={captureLocation}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isLoading ? "Getting Location..." : "Get GPS Location"}
            </Button>
          </div>
        </div>

        {/* Issue Markers (if showing issues) */}
        {showIssues && issues.length > 0 && (
          <div className="absolute top-4 left-4 space-y-2 max-h-32 overflow-y-auto">
            {issues.map((issue, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    issue.priority === 'critical' ? 'bg-red-500' :
                    issue.priority === 'high' ? 'bg-orange-500' :
                    issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="font-medium text-gray-800">{issue.type}</span>
                </div>
                <div className="text-gray-500 mt-1">{issue.ward}</div>
              </div>
            ))}
          </div>
        )}

        {/* Heatmap Legend */}
        {heatmap && (
          <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <p className="text-xs text-gray-700 font-semibold mb-2">Issue Density</p>
            <div className="flex gap-2 items-center">
              <div className="w-8 h-3 rounded bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
              <span className="text-xs text-gray-600">Low → High</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Real-time issue concentration
            </div>
          </div>
        )}

        {/* Map Integration Notice */}
        <div className="absolute bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
          <div className="font-medium">MapMyIndia Ready</div>
          <div className="text-blue-600">Integration placeholder</div>
        </div>
      </div>
    </div>
  );
}
