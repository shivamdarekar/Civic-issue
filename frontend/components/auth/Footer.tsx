"use client";

import { Phone, Mail, Globe, Shield, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-900 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* VMC Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">VMC CiviSense</h3>
                <p className="text-xs text-blue-50">Vadodara Municipal Corporation</p>
              </div>
            </div>
            <p className="text-sm text-blue-50 mb-2 leading-relaxed">
              {t('footer.description.line1') || 'Committed to serving citizens with transparency and efficiency'}
            </p>
            <p className="text-xs text-blue-100">
              {t('footer.description.line2') || 'Building a smarter, more connected Vadodara'}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-200" />
              {t('footer.contact.title') || 'Contact'}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Phone className="w-3 h-3" />
                <span>0265-242-1111</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Mail className="w-3 h-3" />
                <span>info@vmc.gov.in</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Globe className="w-3 h-3" />
                <a href="https://vmc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  vmc.gov.in
                </a>
              </div>
            </div>
          </div>

          {/* Security & Support */}
          <div>
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-200" />
              Security
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-50">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-50">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Government Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-50">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-blue-100">
              <span>{t('footer.copyright') || '© 2024 VMC. All rights reserved.'}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Vadodara, Gujarat
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-blue-200">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Available 24/7
              </span>
              <span>•</span>
              <span>Government Portal</span>
              <span>•</span>
              <span>Secure Access</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}