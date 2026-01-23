"use client";

import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Globe, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LanguageOption {
  code: "en" | "hi" | "gu";
  label: string;
  native: string;
}

const languages: LanguageOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelect = (code: "en" | "hi" | "gu") => {
    setLanguage(code);
    setOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full text-white hover:bg-white/10">
            <Globe className="h-5 w-5" />
            <span className="sr-only">Select Language</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Select Language / भाषा चुनें / ભાષા પસંદ કરો</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                className={cn(
                  "w-full justify-between h-14 text-lg",
                  language === lang.code && "bg-blue-600 hover:bg-blue-700"
                )}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="flex items-center gap-3">
                  <span className="font-bold">{lang.native}</span>
                  <span className="text-sm opacity-70">({lang.label})</span>
                </span>
                {language === lang.code && <Check className="h-5 w-5" />}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className="flex justify-between items-center gap-4 cursor-pointer"
          >
            <span>{lang.native}</span>
            {language === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
