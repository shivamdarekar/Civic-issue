"use client";

import { useState } from "react";

import StatCard from "@/components/dashboard/StatCard";
import BaseMap from "@/components/maps/BaseMap";
import Header from "@/components/Header";
import { TrendingUp, Users, AlertTriangle, Shield } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import ZoneOfficerTools from "@/components/zoneofficer/ZoneOfficerTools";

import UserProfile from "@/components/shared/UserProfile";

export default function ZoneOfficerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const wardData = [
    { ward: "Ward 8", issues: 24, resolved: 18, status: "Good" },
    { ward: "Ward 12", issues: 18, resolved: 12, status: "Fair" },
    { ward: "Ward 15", issues: 31, resolved: 21, status: "Good" },
    { ward: "Ward 19", issues: 15, resolved: 13, status: "Excellent" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Good": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Fair": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNavigation={true} />
      
      <main className="flex-1 p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Zone Officer</h1>
              <p className="text-gray-600">Multi-Ward Oversight & Analytics - Zone East</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-4 flex gap-4 border-b">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-1 ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Zone Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Wards" 
                value="5" 
                icon={<Image src="/VMC.webp" alt="VMC" width={24} height={24} className="w-6 h-6 object-contain" />}
                color="blue"
              />
              <StatCard 
                title="Active Issues" 
                value="88" 
                icon={<AlertTriangle className="w-6 h-6" />}
                color="orange"
                trend={{ value: "+12 today", isPositive: false }}
              />
              <StatCard 
                title="Resolved Today" 
                value="64" 
                icon={<TrendingUp className="w-6 h-6" />}
                color="emerald"
                trend={{ value: "+21 vs yesterday", isPositive: true }}
              />
              <StatCard 
                title="Field Workers" 
                value="23" 
                icon={<Users className="w-6 h-6" />}
                color="purple"
              />
            </div>

            {/* Zone Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Zone Coverage Map</h2>
                <p className="text-gray-600 mt-1">Real-time issue distribution across wards</p>
              </div>
              <div className="h-[400px]">
                <BaseMap heatmap />
              </div>
            </div>

            {/* Ward Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Ward Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wardData.map((ward) => (
                  <div key={ward.ward} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{ward.ward}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ward.status)}`}>
                        {ward.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{ward.issues}</div>
                        <div className="text-sm text-gray-600">Active Issues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{ward.resolved}</div>
                        <div className="text-sm text-gray-600">Resolved</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Zone Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-8 justify-start text-left">
                  <TrendingUp className="w-6 h-6 mr-4" />
                  <div>
                    <div className="font-semibold text-lg">Generate Zone Report</div>
                    <div className="text-sm opacity-90">Comprehensive analytics and insights</div>
                  </div>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 justify-start text-left">
                  <Image 
                    src="/VMC.webp" 
                    alt="VMC Logo" 
                    width={24} 
                    height={24} 
                    className="w-6 h-6 object-contain mr-4"
                  />
                  <div>
                    <div className="font-semibold text-lg">Ward Coordination</div>
                    <div className="text-sm opacity-90">Manage cross-ward operations</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Zone Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">87%</div>
                  <p className="text-gray-700 font-medium">Overall SLA Compliance</p>
                  <p className="text-sm text-gray-500">Above target (85%)</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">3.2h</div>
                  <p className="text-gray-700 font-medium">Avg Resolution Time</p>
                  <p className="text-sm text-gray-500">Improved by 15%</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
                  <p className="text-gray-700 font-medium">Citizen Satisfaction</p>
                  <p className="text-sm text-gray-500">Excellent rating</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'management' && <ZoneOfficerTools />}
        {activeTab === 'profile' && <UserProfile role="ZONE_OFFICER" />}
      </main>
    </div>
  );
}
