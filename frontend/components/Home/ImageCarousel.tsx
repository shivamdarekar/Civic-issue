"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const images = [
  { src: "/kirti mandir.jpeg", alt: "Kirti Mandir" },
  { src: "/random.jpeg", alt: "Vadodara City" },
  { src: "/circle.jpeg", alt: "Circle Area" },
  { src: "/Sursagar-Lake.jpg", alt: "Sursagar Lake" },
  { src: "/bridge.jpeg", alt: "Bridge" },
  { src: "/Sayaji.jpg", alt: "Sayaji Garden" },
  { src: "/Laxmi Vilas Palace.jpg", alt: "Laxmi Vilas Palace" },
  { src: "/Vadodara.jpg", alt: "Vadodara" },
  { src: "/tourist.jpg", alt: "Tourist" },
  { src: "/bridge.jpeg", alt: "Bridge" },
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

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-gray-100">
      <Image
        src={images[currentIndex].src}
        alt={images[currentIndex].alt}
        fill
        className="object-contain w-full h-full transition-opacity duration-500"
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