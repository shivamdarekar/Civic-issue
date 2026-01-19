"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  ShieldCheck,
  Smartphone,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import GovernmentCompliance from "@/components/GovernmentCompliance";

function VadodaraInfo() {
  const [selectedInfo, setSelectedInfo] = useState("Smart City Initiatives");
  
  const infoData = {
    "Smart City Initiatives": "Vadodara is part of the Smart Cities Mission, implementing digital infrastructure, intelligent traffic systems, and e-governance services to enhance urban living.",
    "Cultural Heritage": "Home to landmarks like Lukshmi Vilas Palace and Sayaji Garden, Vadodara celebrates its royal legacy and vibrant festivals like Navratri with grandeur.",
    "Citizen Services": "From online bill payments to complaint redressal, VMC provides easy access to essential municipal services through its digital platforms.",
    "Sustainable Development": "Focused on green spaces, water management, and clean energy projects, Vadodara is actively working towards an eco-friendly urban future.",
    "Industrial & Educational Hub": "With key industries and prestigious institutions like The Maharaja Sayajirao University, Vadodara is a center for economic and academic excellence."
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-800 mb-4">City Highlights</h3>
      <div className="space-y-3 mb-4">
        {Object.keys(infoData).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedInfo(key)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedInfo === key 
                ? 'bg-blue-100 border-blue-300 text-blue-800' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-blue-50'
            } border`}
          >
            <div className="font-medium text-sm">{key}</div>
          </button>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">{selectedInfo}</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{infoData[selectedInfo as keyof typeof infoData]}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      
      {/* Image Carousel */}
      <ImageCarousel />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-200">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={48} 
                  height={48} 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3 text-gray-800">
              {t('home.title')}
            </h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-3">
              {t('home.subtitle')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              AI-Based Geo-Fenced Civic Issue Monitoring System for field staff
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <FeatureTile
              icon={<Image src="/VMC.webp" alt="VMC" width={24} height={24} className="w-6 h-6 object-contain" />}
              title={t('feature.geofencing')}
              desc={t('feature.geofencing.desc')}
              bgColor="bg-yellow-50 border-yellow-200"
            />
            <FeatureTile
              icon={<ClipboardList className="w-6 h-6" />}
              title={t('feature.tracking')}
              desc={t('feature.tracking.desc')}
              bgColor="bg-gray-100 border-gray-300"
            />
            <FeatureTile
              icon={<Users className="w-6 h-6" />}
              title={t('feature.dashboard')}
              desc={t('feature.dashboard.desc')}
              bgColor="bg-white border-gray-200"
            />
            <FeatureTile
              icon={<Smartphone className="w-6 h-6" />}
              title={t('feature.mobile')}
              desc={t('feature.mobile.desc')}
              bgColor="bg-yellow-50 border-yellow-200"
            />
            <FeatureTile
              icon={<Wifi className="w-6 h-6" />}
              title={t('feature.offline')}
              desc={t('feature.offline.desc')}
              bgColor="bg-gray-100 border-gray-300"
            />
            <FeatureTile
              icon={<ShieldCheck className="w-6 h-6" />}
              title={t('feature.ai')}
              desc={t('feature.ai.desc')}
              bgColor="bg-white border-gray-200"
            />
          </div>

          {/* Use Cases */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 mb-12 shadow-sm">
            <h3 className="text-2xl font-bold text-center mb-8 text-blue-600">
              Key Use Cases
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UseCaseItem 
                emoji="🕳️" 
                text="Detect potholes after monsoon inspections"
              />
              <UseCaseItem 
                emoji="🗑️" 
                text="Identify garbage accumulation hotspots"
              />
              <UseCaseItem 
                emoji="🐄" 
                text="Report stray cattle on roads"
              />
              <UseCaseItem 
                emoji="⚠️" 
                text="Flag open manholes or damaged roads"
              />
              <UseCaseItem 
                emoji="⚡" 
                text="Enable faster ward-wise issue resolution"
              />
              <UseCaseItem 
                emoji="📸" 
                text="Improve accountability with resolution proof"
              />
            </div>
          </div>

          {/* Login Section */}
          <div className="text-center mb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-8 inline-block shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {t('login.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                Field Worker, Ward Engineer, Zone Officer or Admin
              </p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors text-white"
              >
                {t('home.login')}
              </Link>
            </div>
          </div>

          {/* About Vadodara Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-blue-800">About Our Vadodara</h3>
                <h4 className="text-lg font-semibold text-blue-700 mb-4">Sanskari Nagari</h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vadodara, also known as Baroda, is one of Gujarat's most vibrant cities — a blend of rich heritage, cultural diversity, and rapid urban development. Situated on the banks of the Vishwamitri River, it is renowned for its grand palaces, art museums, and educational institutions. Once the seat of the Gaekwad dynasty, Vadodara continues to reflect regal charm through its architecture and traditions.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Today, Vadodara stands as a fast-growing smart city, embracing digital governance, infrastructure modernization, and sustainable growth. With a strong industrial base, particularly in petrochemicals, engineering, and IT, the city also thrives as a hub for innovation and civic progress. Vadodara is not just a city — it's a progressive community where culture meets technology.
                </p>
              </div>
              
              <div>
                <VadodaraInfo />
              </div>
            </div>
          </div>

          {/* Government Compliance Section */}
          <GovernmentCompliance />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  desc,
  bgColor = "bg-white border-gray-200"
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bgColor?: string;
}) {
  return (
    <div className={`${bgColor} border rounded-lg p-6 hover:shadow-md transition-all`}>
      <div className="mb-4 text-blue-800">{icon}</div>
      <h3 className="font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors">
      <h6 className="font-semibold text-blue-800 mb-2">{title}</h6>
      <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <span className="text-xl">{emoji}</span>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}
