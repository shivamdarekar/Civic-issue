"use client";

import { useState } from "react";

import StatCard from "@/components/dashboard/StatCard";
import IssueTable from "@/components/dashboard/IssueTable";
import Header from "@/components/Header";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import WardEngineerTools from "@/components/wardengineer/WardEngineerTools";

import UserProfile from "@/components/shared/UserProfile";

export default function WardEngineerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNavigation={true} />
      
      <main className="flex-1 p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Ward Engineer</h1>
              <p className="text-gray-600">Issue Verification & Quality Control - Ward 12</p>
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
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Open Issues" 
                value="18" 
                icon={<AlertTriangle className="w-6 h-6" />}
                color="orange"
                trend={{ value: "+3 today", isPositive: false }}
              />
              <StatCard 
                title="In Progress" 
                value="7" 
                icon={<Clock className="w-6 h-6" />}
                color="blue"
              />
              <StatCard 
                title="Verified Today" 
                value="112" 
                icon={<CheckCircle2 className="w-6 h-6" />}
                color="emerald"
                trend={{ value: "+8 today", isPositive: true }}
              />
              <StatCard 
                title="Overdue" 
                value="3" 
                icon={<XCircle className="w-6 h-6" />}
                color="red"
              />
            </div>

            {/* Action Center */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-8 justify-start text-left">
                  <CheckCircle2 className="w-6 h-6 mr-4" />
                  <div>
                    <div className="font-semibold text-lg">Verify Completed Issues</div>
                    <div className="text-sm opacity-90">Review and approve field worker reports</div>
                  </div>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 justify-start text-left">
                  <Clock className="w-6 h-6 mr-4" />
                  <div>
                    <div className="font-semibold text-lg">Review Pending Issues</div>
                    <div className="text-sm opacity-90">Check issues awaiting verification</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Issue Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Issue Management</h2>
                <p className="text-gray-600 mt-1">Review, verify and manage ward issues</p>
              </div>
              <div className="p-6">
                <IssueTable role="WARD_ENGINEER" />
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Today's Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">85%</div>
                  <p className="text-gray-700 font-medium">Verification Rate</p>
                  <p className="text-sm text-gray-500">Above target (80%)</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.4h</div>
                  <p className="text-gray-700 font-medium">Avg Response Time</p>
                  <p className="text-sm text-gray-500">Within SLA (4h)</p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
                  <p className="text-gray-700 font-medium">Quality Score</p>
                  <p className="text-sm text-gray-500">Excellent rating</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tools' && <WardEngineerTools />}
        {activeTab === 'profile' && <UserProfile role="WARD_ENGINEER" />}
      </main>
    </div>
  );
}
