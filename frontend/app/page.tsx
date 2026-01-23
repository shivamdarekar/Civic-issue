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
import { SpeakableText } from "@/components/ui/SpeakableText";
import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import ImageCarousel from "@/components/Home/ImageCarousel";
import GovernmentCompliance from "@/components/Home/GovernmentCompliance";

function VadodaraInfo() {
  const { t } = useLanguage();
  const [selectedInfo, setSelectedInfo] = useState("smart.city");
  
  const infoData = {
    "smart.city": { 
      title: t('city.highlight.smart.city'), 
      desc: t('city.highlight.smart.city.desc'),
      icon: "🏙️",
      color: "bg-blue-50 border-blue-200 text-blue-800"
    },
    "cultural": { 
      title: t('city.highlight.cultural'), 
      desc: t('city.highlight.cultural.desc'),
      icon: "🏛️",
      color: "bg-purple-50 border-purple-200 text-purple-800"
    },
    "citizen": { 
      title: t('city.highlight.citizen'), 
      desc: t('city.highlight.citizen.desc'),
      icon: "👥",
      color: "bg-green-50 border-green-200 text-green-800"
    },
    "sustainable": { 
      title: t('city.highlight.sustainable'), 
      desc: t('city.highlight.sustainable.desc'),
      icon: "🌱",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800"
    },
    "industrial": { 
      title: t('city.highlight.industrial'), 
      desc: t('city.highlight.industrial.desc'),
      icon: "🏭",
      color: "bg-orange-50 border-orange-200 text-orange-800"
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <h3 className="text-xl font-bold text-blue-900 mb-6 text-center">
        <SpeakableText>{t('city.highlights.title')}</SpeakableText>
      </h3>
      
      <div className="grid grid-cols-1 gap-3 mb-6">
        {Object.entries(infoData).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setSelectedInfo(key)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 border-2 ${
              selectedInfo === key 
                ? data.color + ' shadow-md transform scale-[1.02]'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{data.icon}</span>
              <div>
                <div className="font-semibold text-sm">
                  <SpeakableText>{data.title}</SpeakableText>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className={`${infoData[selectedInfo as keyof typeof infoData].color} rounded-xl p-5 border-2 shadow-sm`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{infoData[selectedInfo as keyof typeof infoData].icon}</span>
          <h4 className="font-bold text-lg">
            <SpeakableText>{infoData[selectedInfo as keyof typeof infoData].title}</SpeakableText>
          </h4>
        </div>
        <p className="text-sm leading-relaxed">
          <SpeakableText>{infoData[selectedInfo as keyof typeof infoData].desc}</SpeakableText>
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800 flex flex-col">
      <Header />
      
      {/* Image Carousel */}
      <ImageCarousel />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={64} 
                  height={64} 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-700 mb-6">
              <SpeakableText>{t('home.subtitle')}</SpeakableText>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-xl leading-relaxed">
              <SpeakableText>{t('home.description')}</SpeakableText>
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureTile
                icon={<Image src="/VMC.webp" alt="VMC" width={32} height={32} className="w-8 h-8 object-contain" />}
                title={t('feature.geofencing')}
                desc={t('feature.geofencing.desc')}
                bgColor="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-xl"
              />
              <FeatureTile
                icon={<ClipboardList className="w-8 h-8" />}
                title={t('feature.tracking')}
                desc={t('feature.tracking.desc')}
                bgColor="bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300 hover:shadow-xl"
              />
              <FeatureTile
                icon={<Users className="w-8 h-8" />}
                title={t('feature.dashboard')}
                desc={t('feature.dashboard.desc')}
                bgColor="bg-gradient-to-br from-white to-gray-50 border-gray-300 hover:shadow-xl"
              />
              <FeatureTile
                icon={<Smartphone className="w-8 h-8" />}
                title={t('feature.mobile')}
                desc={t('feature.mobile.desc')}
                bgColor="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 hover:shadow-xl"
              />
              <FeatureTile
                icon={<Wifi className="w-8 h-8" />}
                title={t('feature.offline')}
                desc={t('feature.offline.desc')}
                bgColor="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:shadow-xl"
              />
              <FeatureTile
                icon={<ShieldCheck className="w-8 h-8" />}
                title={t('feature.ai')}
                desc={t('feature.ai.desc')}
                bgColor="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-300 hover:shadow-xl"
              />
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-2xl p-10 mb-20 shadow-lg">
            <h3 className="text-3xl font-bold text-center mb-4 text-blue-700">
              <SpeakableText>{t('home.use.cases.title')}</SpeakableText>
            </h3>
            <p className="text-center text-gray-600 mb-10 text-lg">
              Real-world applications of our civic platform
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <UseCaseItem 
                emoji="🕳️" 
                text={t('home.use.case.pothole')}
              />
              <UseCaseItem 
                emoji="🗑️" 
                text={t('home.use.case.garbage')}
              />
              <UseCaseItem 
                emoji="🐄" 
                text={t('home.use.case.cattle')}
              />
              <UseCaseItem 
                emoji="⚠️" 
                text={t('home.use.case.manhole')}
              />
              <UseCaseItem 
                emoji="⚡" 
                text={t('home.use.case.resolution')}
              />
              <UseCaseItem 
                emoji="📸" 
                text={t('home.use.case.accountability')}
              />
            </div>
          </div>

          {/* About Vadodara Section */}
          <div className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-2xl p-10 shadow-lg mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  About Our City
                </div>
                <h3 className="text-4xl font-bold text-gray-900 leading-tight">
                  <SpeakableText>{t('about.vadodara.title')}</SpeakableText>
                </h3>
                <h4 className="text-2xl font-semibold text-blue-700">
                  <SpeakableText>{t('about.vadodara.subtitle')}</SpeakableText>
                </h4>
                <p className="text-gray-700 leading-relaxed text-lg">
                  <SpeakableText>{t('about.vadodara.para1')}</SpeakableText>
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  <SpeakableText>{t('about.vadodara.para2')}</SpeakableText>
                </p>
              </div>
              
              <div>
                <VadodaraInfo />
              </div>
            </div>
            
            {/* City Images Showcase */}
            <div className="mt-12 pt-8 border-t border-indigo-200">
              <h4 className="text-2xl font-bold text-center mb-8 text-gray-900">
                Explore Vadodara
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative group overflow-hidden rounded-xl bg-gray-200">
                  <Image
                    src="/Laxmi Palace.jpg"
                    alt="Laxmi Palace"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                      Laxmi Palace
                    </div>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-xl bg-gray-200">
                  <Image
                    src="/kirti mandir.jpg"
                    alt="Kirti Mandir"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                      Kirti Mandir
                    </div>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-xl bg-gray-200">
                  <Image
                    src="/Vadodara.jpg"
                    alt="Vadodara"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                      Vadodara
                    </div>
                  </div>
                </div>
                <div className="relative group overflow-hidden rounded-xl bg-gray-200">
                  <Image
                    src="/Sayajirao university.jpg"
                    alt="Sayajirao University"
                    width={300}
                    height={200}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                      Sayajirao University
                    </div>
                  </div>
                </div>
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
    <div className={`${bgColor} border-2 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}>
      <div className="mb-6 text-blue-700 group-hover:text-blue-800 transition-colors duration-300 flex justify-center">
        <div className="p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
          {icon}
        </div>
      </div>
      <h3 className="font-bold mb-4 text-gray-900 text-xl text-center">
        <SpeakableText>{title}</SpeakableText>
      </h3>
      <p className="text-gray-600 leading-relaxed text-center">
        <SpeakableText>{desc}</SpeakableText>
      </p>
    </div>
  );
}

function UseCaseItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{emoji}</div>
      <p className="text-gray-700 leading-relaxed font-medium">
        <SpeakableText>{text}</SpeakableText>
      </p>
    </div>
  );
}
