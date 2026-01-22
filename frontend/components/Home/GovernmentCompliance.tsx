import { ShieldCheck, FileText, Users, Globe, Lock, Eye } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { SpeakableText } from "@/components/ui/SpeakableText";

export default function GovernmentCompliance() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-center mb-4 text-blue-600">
        <SpeakableText>{t('compliance.title')}</SpeakableText>
      </h3>
      <p className="text-center text-gray-600 mb-8">
        <SpeakableText>{t('compliance.description')}</SpeakableText>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ComplianceItem
          icon={<ShieldCheck className="w-8 h-8" />}
          title={t('compliance.data.security')}
          description={t('compliance.data.security.desc')}
          standards={[
            t('compliance.data.security.std1'),
            t('compliance.data.security.std2'),
            t('compliance.data.security.std3')
          ]}
        />
        <ComplianceItem
          icon={<Eye className="w-8 h-8" />}
          title={t('compliance.accessibility')}
          description={t('compliance.accessibility.desc')}
          standards={[
            t('compliance.accessibility.std1'),
            t('compliance.accessibility.std2'),
            t('compliance.accessibility.std3')
          ]}
        />
        <ComplianceItem
          icon={<FileText className="w-8 h-8" />}
          title={t('compliance.transparency')}
          description={t('compliance.transparency.desc')}
          standards={[
            t('compliance.transparency.std1'),
            t('compliance.transparency.std2'),
            t('compliance.transparency.std3')
          ]}
        />
        <ComplianceItem
          icon={<Lock className="w-8 h-8" />}
          title={t('compliance.privacy')}
          description={t('compliance.privacy.desc')}
          standards={[
            t('compliance.privacy.std1'),
            t('compliance.privacy.std2'),
            t('compliance.privacy.std3')
          ]}
        />
        <ComplianceItem
          icon={<Globe className="w-8 h-8" />}
          title={t('compliance.digital.india')}
          description={t('compliance.digital.india.desc')}
          standards={[
            t('compliance.digital.india.std1'),
            t('compliance.digital.india.std2'),
            t('compliance.digital.india.std3')
          ]}
        />
        <ComplianceItem
          icon={<Users className="w-8 h-8" />}
          title={t('compliance.cyber.security')}
          description={t('compliance.cyber.security.desc')}
          standards={[
            t('compliance.cyber.security.std1'),
            t('compliance.cyber.security.std2'),
            t('compliance.cyber.security.std3')
          ]}
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-center mb-4 text-gray-800">
          <SpeakableText>{t('compliance.certification.title')}</SpeakableText>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CertificationItem
            title={t('compliance.cert.security.audit')}
            status={t('compliance.cert.security.audit.status')}
          />
          <CertificationItem
            title={t('compliance.cert.accessibility.test')}
            status={t('compliance.cert.accessibility.test.status')}
          />
          <CertificationItem
            title={t('compliance.cert.data.protection')}
            status={t('compliance.cert.data.protection.status')}
          />
          <CertificationItem
            title={t('compliance.cert.performance')}
            status={t('compliance.cert.performance.status')}
          />
        </div>
      </div>
    </div>
  );
}

function ComplianceItem({ 
  icon, 
  title, 
  description,
  standards
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  standards: string[];
}) {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
      <div className="flex justify-center mb-3 text-blue-600">{icon}</div>
      <h4 className="font-semibold text-gray-800 mb-2 text-center">
        <SpeakableText>{title}</SpeakableText>
      </h4>
      <p className="text-sm text-gray-600 mb-3 text-center">
        <SpeakableText>{description}</SpeakableText>
      </p>
      <ul className="text-xs text-gray-700 space-y-1">
        {standards.map((standard, index) => (
          <li key={index} className="flex items-center gap-1">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            <SpeakableText>{standard}</SpeakableText>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CertificationItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
      <h5 className="font-medium text-green-800 text-sm mb-1">
        <SpeakableText>{title}</SpeakableText>
      </h5>
      <p className="text-xs text-green-600">
        <SpeakableText>{status}</SpeakableText>
      </p>
    </div>
  );
}