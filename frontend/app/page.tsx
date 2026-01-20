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
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import GovernmentCompliance from "@/components/GovernmentCompliance";

function VadodaraInfo() {
  const { t } = useLanguage();
  const [selectedInfo, setSelectedInfo] = useState("smart.city");
  
  const infoData = {
    "smart.city": { title: t('city.highlight.smart.city'), desc: t('city.highlight.smart.city.desc') },
    "cultural": { title: t('city.highlight.cultural'), desc: t('city.highlight.cultural.desc') },
    "citizen": { title: t('city.highlight.citizen'), desc: t('city.highlight.citizen.desc') },
    "sustainable": { title: t('city.highlight.sustainable'), desc: t('city.highlight.sustainable.desc') },
    "industrial": { title: t('city.highlight.industrial'), desc: t('city.highlight.industrial.desc') }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-800 mb-4">{t('city.highlights.title')}</h3>
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
            <div className="font-medium text-sm">
              <SpeakableText>{infoData[key as keyof typeof infoData].title}</SpeakableText>
            </div>
          </button>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">{infoData[selectedInfo as keyof typeof infoData].title}</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          <SpeakableText>{infoData[selectedInfo as keyof typeof infoData].desc}</SpeakableText>
        </p>
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
              <SpeakableText>{t('home.subtitle')}</SpeakableText>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              <SpeakableText>{t('home.description')}</SpeakableText>
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
              <SpeakableText>{t('home.use.cases.title')}</SpeakableText>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Login Section */}
          <div className="text-center mb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-8 inline-block shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                {t('login.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                <SpeakableText>{t('login.role.description')}</SpeakableText>
              </p>
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors text-white"
              >
                <SpeakableText text="Login to System">{t('home.login')}</SpeakableText>
              </Link>
            </div>
          </div>

          {/* About Vadodara Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-blue-800">
                  <SpeakableText>{t('about.vadodara.title')}</SpeakableText>
                </h3>
                <h4 className="text-lg font-semibold text-blue-700 mb-4">
                  <SpeakableText>{t('about.vadodara.subtitle')}</SpeakableText>
                </h4>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <SpeakableText>{t('about.vadodara.para1')}</SpeakableText>
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <SpeakableText>{t('about.vadodara.para2')}</SpeakableText>
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
      <h3 className="font-semibold mb-2 text-gray-800">
        <SpeakableText>{title}</SpeakableText>
      </h3>
      <p className="text-sm text-gray-600">
        <SpeakableText>{desc}</SpeakableText>
      </p>
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
      <p className="text-sm text-gray-700">
        <SpeakableText>{text}</SpeakableText>
      </p>
    </div>
  );
}
