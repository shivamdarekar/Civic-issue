"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Shield } from "lucide-react";
import SLAMonitoring from "@/components/admin/SLAMonitoring";
import CommunicationHub from "@/components/admin/CommunicationHub";
import AdvancedAnalytics from "@/components/admin/AdvancedAnalytics";
import AdminOverview from "@/components/admin/AdminOverview";
import UserManagement from "@/components/admin/UserManagement";
import UserCreation from "@/components/admin/UserCreation";
import SystemSettings from "@/components/admin/SystemSettings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey(prev => prev + 1);
  };



  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">User Management</h3>
        <UserCreation onUserCreated={handleUserCreated} />
      </div>
      <UserManagement key={refreshKey} />
    </div>
  );



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNavigation={true} />
      
      <main className="flex-1 p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
              <p className="text-gray-600">Vadodara Municipal Corporation - Complete system oversight and management</p>
            </div>
          </div>
          
          <div className="flex gap-4 border-b overflow-x-auto">
            <button onClick={() => setActiveTab('overview')} className={`pb-2 px-3 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Overview</button>
            <button onClick={() => setActiveTab('users')} className={`pb-2 px-3 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>User Management</button>
            <button onClick={() => setActiveTab('sla')} className={`pb-2 px-3 whitespace-nowrap ${activeTab === 'sla' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>SLA Monitoring</button>
            <button onClick={() => setActiveTab('communication')} className={`pb-2 px-3 whitespace-nowrap ${activeTab === 'communication' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Communications</button>
            <button onClick={() => setActiveTab('settings')} className={`pb-2 px-3 whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>System Settings</button>
          </div>
        </div>

        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'sla' && <SLAMonitoring />}
        {activeTab === 'communication' && <CommunicationHub />}
        {activeTab === 'analytics' && <AdvancedAnalytics />}
        {activeTab === 'settings' && <SystemSettings />}
      </main>
    </div>
  );
}
