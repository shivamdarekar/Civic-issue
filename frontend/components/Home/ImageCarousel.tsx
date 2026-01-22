"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const images = [
  { src: "/Vadodara.jpg", alt: "Vadodara" },
  { src: "/Laxmi Palace.jpg", alt: "Laxmi Palace" },
  { src: "/kirti mandir.jpg", alt: "Kirti Mandir" },
  { src: "/bridge.jpg", alt: "Bridge" },
  { src: "/tourist.jpg", alt: "Tourist" },
  { src: "/Sayajirao university.jpg", alt: "Sayajirao University" },
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (!images[currentIndex]) {
    return <div className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-gray-100" />;
  }

  return (
    <div className="relative w-full bg-gray-100 max-h-[600px] overflow-hidden">
      <Image
        src={images[currentIndex].src}
        alt={images[currentIndex].alt}
        width={1920}
        height={1080}
        className="w-full h-auto max-h-[600px] object-cover transition-opacity duration-500"
        priority
      />
      
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Image Title Overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
        <p className="text-sm font-medium">{images[currentIndex].alt}</p>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}