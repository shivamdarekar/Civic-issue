"use client";

import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { SpeakableText } from '@/components/ui/SpeakableText';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm">{currentLanguage?.native}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50 min-w-[120px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as 'en' | 'hi' | 'gu');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}
            >
              <div className="font-medium">
                <SpeakableText language={lang.code as 'en' | 'hi' | 'gu'}>
                  {lang.native}
                </SpeakableText>
              </div>
              <div className="text-xs opacity-75">{lang.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}