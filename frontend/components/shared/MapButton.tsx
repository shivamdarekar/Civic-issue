"use client";

import { MapPin } from "lucide-react";

interface MapThumbnailProps {
  latitude: number;
  longitude: number;
}

export default function MapThumbnail({ 
  latitude, 
  longitude
}: MapThumbnailProps) {
  const openMap = () => {
    const coords = `${latitude},${longitude}`;
    // Open Google Maps with directions (same as previous directions button)
    const directionsUrl = `https://maps.google.com/maps?daddr=${coords}`;
    window.open(directionsUrl, '_blank');
  };

  // Fallback to OpenStreetMap static image
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div 
      className="relative cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group w-full h-32 sm:h-40 md:h-48"
      onClick={openMap}
    >
      {/* Map iframe as fallback */}
      <iframe
        src={osmUrl}
        className="w-full h-full"
        style={{ border: 0 }}
        loading="lazy"
        title="Location Map"
      />
      
      {/* Overlay with pin icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-red-500 rounded-full p-2 shadow-lg">
          <MapPin className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {/* Hover overlay - desktop only */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors hidden md:flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1 rounded-full text-sm font-medium">
          Click for directions
        </div>
      </div>
      
      {/* Mobile overlay - always visible */}
      <div className="absolute bottom-2 left-2 md:hidden bg-white/90 px-2 py-1 rounded text-xs font-medium">
        Tap for directions
      </div>
    </div>
  );
}