"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { gu } from "./locales/gu";

type Language = "en" | "hi" | "gu";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en,
  hi,
  gu,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = Cookies.get("NEXT_LOCALE") as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    Cookies.set("NEXT_LOCALE", lang, { expires: 365 });
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  // Prevent hydration mismatch by rendering children only after mount
  // However, we MUST provide the context because children might use useLanguage hook
  // We default to 'en' ensuring SSR doesn't crash
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
       {mounted ? children : <div className="invisible">{children}</div>}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
