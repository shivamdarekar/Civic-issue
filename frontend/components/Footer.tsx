"use client";

import { Phone, Mail, Globe } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-900 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* VMC Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/20 p-1.5 rounded backdrop-blur-sm">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={16} 
                  height={16} 
                  className="w-4 h-4 object-contain"
                />
              </div>
              <h3 className="font-semibold text-white">VMC CiviSense</h3>
            </div>
            <p className="text-sm text-blue-50 mb-2">
              {t('footer.description.line1')}
            </p>
            <p className="text-xs text-blue-100">
              {t('footer.description.line2')}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-3">{t('footer.contact.title')}</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Phone className="w-4 h-4" />
                <span>0265-242-1111</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Mail className="w-4 h-4" />
                <span>info@vmc.gov.in</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Globe className="w-4 h-4" />
                <a href="https://vmc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  vmc.gov.in
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">{t('footer.quick.links.title')}</h4>
            <div className="space-y-2">
              <a href="/field-worker" className="block text-sm text-blue-50 hover:text-white">
                {t('footer.portal.field.worker')}
              </a>
              <a href="/ward-engineer" className="block text-sm text-blue-50 hover:text-white">
                {t('footer.portal.ward.engineer')}
              </a>
              <a href="/zone-officer" className="block text-sm text-blue-50 hover:text-white">
                {t('footer.portal.zone.officer')}
              </a>
              <a href="/admin" className="block text-sm text-blue-50 hover:text-white">
                {t('footer.portal.admin')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-blue-100">
              {t('footer.copyright')}
            </div>
            <div className="flex items-center gap-4 text-xs text-blue-100">
              <span>{t('footer.made.for')}</span>
              <span>•</span>
              <span>{t('footer.offline.pwa')}</span>
              <span>•</span>
              <span>{t('footer.gps.enabled')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}