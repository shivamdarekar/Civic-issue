import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { SpeakableText } from "@/components/ui/SpeakableText";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-800 text-white py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <Image 
                src="/VMC.webp" 
                alt="VMC Logo" 
                width={32} 
                height={32} 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
              <h3 className="text-base sm:text-lg font-semibold">VMC CiviSense</h3>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              <SpeakableText>{t('footer.description.line1')}</SpeakableText>
            </p>
            <p className="text-gray-300 text-sm">
              <SpeakableText>{t('footer.description.line2')}</SpeakableText>
            </p>
          </div>
          
          <div className="text-center sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4">
              <SpeakableText>{t('footer.contact.title')}</SpeakableText>
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>0265-242-1111</p>
              <p>info@vmc.gov.in</p>
              <p>vmc.gov.in</p>
            </div>
          </div>
          
          <div className="text-center sm:text-right md:text-right sm:col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Vadodara Municipal Corporation</h3>
            <div className="text-xs text-gray-400">
              <SpeakableText>{t('footer.q')}</SpeakableText>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}