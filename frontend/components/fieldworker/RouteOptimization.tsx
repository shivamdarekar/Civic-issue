"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Clock, Route } from "lucide-react";

interface NearbyIssue {
  id: string;
  type: string;
  distance: number;
  priority: string;
  description: string;
  coordinates: [number, number];
}

export default function RouteOptimization() {
  const [nearbyIssues, setNearbyIssues] = useState<NearbyIssue[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Mock nearby issues
    const mockIssues: NearbyIssue[] = [
      {
        id: "ISS001",
        type: "pothole",
        distance: 0.2,
        priority: "high",
        description: "Large pothole on main road",
        coordinates: [22.3072, 73.1812]
      },
      {
        id: "ISS002", 
        type: "garbage",
        distance: 0.5,
        priority: "medium",
        description: "Garbage accumulation",
        coordinates: [22.3080, 73.1820]
      },
      {
        id: "ISS003",
        type: "streetlight",
        distance: 0.8,
        priority: "low", 
        description: "Street light not working",
        coordinates: [22.3090, 73.1830]
      }
    ];
    setNearbyIssues(mockIssues);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
          alert(`Location updated: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => alert("Unable to get location")
      );
    }
  };

  const optimizeRoute = () => {
    // Simple route optimization (in real app, use proper algorithm)
    const sortedIssues = [...nearbyIssues].sort((a, b) => {
      // Prioritize by: 1) Priority level, 2) Distance
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority as keyof typeof priorityWeight];
      const bPriority = priorityWeight[b.priority as keyof typeof priorityWeight];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return a.distance - b.distance;
    });
    
    setOptimizedRoute(sortedIssues.map(issue => issue.id));
    alert(`Route optimized! Visit ${sortedIssues.length} issues in order of priority and proximity.`);
  };

  const downloadOfflineMap = () => {
    // Mock offline map download
    alert("Downloading ward map for offline use... This may take a few minutes.");
    setTimeout(() => {
      alert("Ward map downloaded successfully! Available for offline use.");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Route Optimization
        </h4>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={getCurrentLocation} variant="outline" className="flex-1">
              <MapPin className="w-4 h-4 mr-2" />
              Update Location
            </Button>
            <Button onClick={optimizeRoute} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Route className="w-4 h-4 mr-2" />
              Optimize Route
            </Button>
          </div>
          
          <Button onClick={downloadOfflineMap} variant="outline" className="w-full">
            📱 Download Offline Map
          </Button>
        </div>

        {currentLocation && (
          <div className="mt-3 p-2 bg-green-50 rounded text-sm">
            📍 Current: {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Nearby Issues ({nearbyIssues.length})
        </h4>
        
        <div className="space-y-3">
          {nearbyIssues.map((issue, index) => (
            <div 
              key={issue.id} 
              className={`p-3 rounded border ${
                optimizedRoute.indexOf(issue.id) === 0 ? 'border-blue-500 bg-blue-50' :
                optimizedRoute.includes(issue.id) ? 'border-green-500 bg-green-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{issue.id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    issue.priority === 'high' ? 'bg-red-100 text-red-700' :
                    issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {issue.priority.toUpperCase()}
                  </span>
                  {optimizedRoute.indexOf(issue.id) >= 0 && (
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      #{optimizedRoute.indexOf(issue.id) + 1}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{issue.distance} km</span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>📍 {issue.coordinates[0].toFixed(4)}, {issue.coordinates[1].toFixed(4)}</span>
                <span>🚶 ~{Math.round(issue.distance * 12)} min walk</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {optimizedRoute.length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Optimized Route Summary
          </h4>
          <div className="text-sm space-y-1">
            <div>📊 Total Issues: {optimizedRoute.length}</div>
            <div>📏 Estimated Distance: {nearbyIssues.reduce((sum, issue) => sum + issue.distance, 0).toFixed(1)} km</div>
            <div>⏱️ Estimated Time: {Math.round(nearbyIssues.length * 45)} minutes</div>
            <div>🎯 Route Order: {optimizedRoute.join(' → ')}</div>
          </div>
        </Card>
      )}
    </div>
  );
}