"use client";

import { Shield, Lock, Eye, FileText, Users, Globe } from "lucide-react";

export default function GovernmentCompliance() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-xl border-2 border-blue-200">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Government Compliance</h2>
        <p className="text-gray-600">VMC CiviSense adheres to all government standards and regulations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ComplianceCard
          icon={<Lock className="w-6 h-6" />}
          title="Data Security"
          description="End-to-end encryption, secure data storage, and regular security audits"
          standards={["ISO 27001", "GDPR Compliant", "Government Grade Security"]}
        />
        
        <ComplianceCard
          icon={<Eye className="w-6 h-6" />}
          title="Accessibility"
          description="WCAG 2.1 AA compliant with screen reader support and keyboard navigation"
          standards={["WCAG 2.1 AA", "Section 508", "Multi-language Support"]}
        />
        
        <ComplianceCard
          icon={<FileText className="w-6 h-6" />}
          title="Transparency"
          description="Open data policies, audit trails, and public accountability measures"
          standards={["RTI Compliant", "Audit Trails", "Public Data Access"]}
        />
        
        <ComplianceCard
          icon={<Users className="w-6 h-6" />}
          title="Privacy Protection"
          description="Citizen data protection with consent management and privacy controls"
          standards={["Privacy by Design", "Consent Management", "Data Minimization"]}
        />
        
        <ComplianceCard
          icon={<Globe className="w-6 h-6" />}
          title="Digital India"
          description="Aligned with Digital India initiatives and e-governance standards"
          standards={["Digital India", "e-Governance", "API Standards"]}
        />
        
        <ComplianceCard
          icon={<Shield className="w-6 h-6" />}
          title="Cyber Security"
          description="Regular penetration testing, vulnerability assessments, and security monitoring"
          standards={["CERT-In Guidelines", "Cyber Security Framework", "24/7 Monitoring"]}
        />
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Certification & Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">Security Audit</span>
            <span className="text-sm font-semibold text-green-600">✓ Passed</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">Accessibility Test</span>
            <span className="text-sm font-semibold text-green-600">✓ AA Compliant</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">Data Protection</span>
            <span className="text-sm font-semibold text-green-600">✓ Certified</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-gray-700">Performance</span>
            <span className="text-sm font-semibold text-green-600">✓ Optimized</span>
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
      <h3 className="font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="space-y-1">
        {standards.map((standard, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-700">{standard}</span>
          </div>
        ))}
      </div>
    </div>
  );
}