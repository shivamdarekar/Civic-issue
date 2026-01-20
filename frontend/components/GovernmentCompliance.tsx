"use client";

import { Shield, Lock, Eye, FileText, Users, Globe } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SpeakableText } from "@/components/ui/SpeakableText";

export default function GovernmentCompliance() {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-xl border-2 border-blue-200">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          <SpeakableText>{t('compliance.title')}</SpeakableText>
        </h2>
        <p className="text-gray-600">
          <SpeakableText>{t('compliance.description')}</SpeakableText>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ComplianceCard
          icon={<Lock className="w-6 h-6" />}
          title={t('compliance.data.security')}
          description={t('compliance.data.security.desc')}
          standards={[
            t('compliance.data.security.std1'),
            t('compliance.data.security.std2'),
            t('compliance.data.security.std3')
          ]}
        />
        
        <ComplianceCard
          icon={<Eye className="w-6 h-6" />}
          title={t('compliance.accessibility')}
          description={t('compliance.accessibility.desc')}
          standards={[
            t('compliance.accessibility.std1'),
            t('compliance.accessibility.std2'),
            t('compliance.accessibility.std3')
          ]}
        />
        
        <ComplianceCard
          icon={<FileText className="w-6 h-6" />}
          title={t('compliance.transparency')}
          description={t('compliance.transparency.desc')}
          standards={[
            t('compliance.transparency.std1'),
            t('compliance.transparency.std2'),
            t('compliance.transparency.std3')
          ]}
        />
        
        <ComplianceCard
          icon={<Users className="w-6 h-6" />}
          title={t('compliance.privacy')}
          description={t('compliance.privacy.desc')}
          standards={[
            t('compliance.privacy.std1'),
            t('compliance.privacy.std2'),
            t('compliance.privacy.std3')
          ]}
        />
        
        <ComplianceCard
          icon={<Globe className="w-6 h-6" />}
          title={t('compliance.digital.india')}
          description={t('compliance.digital.india.desc')}
          standards={[
            t('compliance.digital.india.std1'),
            t('compliance.digital.india.std2'),
            t('compliance.digital.india.std3')
          ]}
        />
        
        <ComplianceCard
          icon={<Shield className="w-6 h-6" />}
          title={t('compliance.cyber.security')}
          description={t('compliance.cyber.security.desc')}
          standards={[
            t('compliance.cyber.security.std1'),
            t('compliance.cyber.security.std2'),
            t('compliance.cyber.security.std3')
          ]}
        />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          <SpeakableText>{t('compliance.certification.title')}</SpeakableText>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">
              <SpeakableText>{t('compliance.cert.security.audit')}</SpeakableText>
            </span>
            <span className="text-sm font-semibold text-green-600">
              {t('compliance.cert.security.audit.status')}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">
              <SpeakableText>{t('compliance.cert.accessibility.test')}</SpeakableText>
            </span>
            <span className="text-sm font-semibold text-green-600">
              {t('compliance.cert.accessibility.test.status')}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">
              <SpeakableText>{t('compliance.cert.data.protection')}</SpeakableText>
            </span>
            <span className="text-sm font-semibold text-green-600">
              {t('compliance.cert.data.protection.status')}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">
              <SpeakableText>{t('compliance.cert.performance')}</SpeakableText>
            </span>
            <span className="text-sm font-semibold text-green-600">
              {t('compliance.cert.performance.status')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComplianceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  standards: string[];
}

function ComplianceCard({ icon, title, description, standards }: ComplianceCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
      <div className="mb-4 text-blue-600">{icon}</div>
      <h3 className="font-semibold mb-2 text-gray-800">
        <SpeakableText>{title}</SpeakableText>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        <SpeakableText>{description}</SpeakableText>
      </p>
      <div className="space-y-1">
        {standards.map((standard, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-700">
              <SpeakableText>{standard}</SpeakableText>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}