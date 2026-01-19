"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BaseMap from "@/components/maps/BaseMap";
import IssueReport from "@/components/IssueReport";
import SavedIssues from "@/components/SavedIssues";
import Header from "@/components/Header";
import { Plus, Camera, List, User, Wifi, WifiOff, RefreshCw, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import { offlineStorage } from "@/lib/offline-storage";
import SmartFeatures from "@/components/fieldworker/SmartFeatures";
import RouteOptimization from "@/components/fieldworker/RouteOptimization";
import { useLanguage } from "@/lib/language-context";
import UserProfile from "@/components/shared/UserProfile";

export default function FieldWorkerDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [offlineIssues, setOfflineIssues] = useState(0);
  const [draftIssues, setDraftIssues] = useState(0);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [showSavedIssues, setShowSavedIssues] = useState(false);
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0, resolutionRate: 0 });
  const [employeeInfo, setEmployeeInfo] = useState({ id: 'FW001', name: 'Field Worker', ward: 'Ward 1' });
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    initializeDashboard();
    loadOfflineData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOfflineData, 30000);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      await offlineStorage.initializeWards();
      await offlineStorage.initializeEmployees();
      
      const empId = localStorage.getItem('employeeId') || 'FW001';
      const employee = await offlineStorage.getEmployee(empId);
      if (employee) {
        setEmployeeInfo({
          id: employee.id,
          name: employee.name,
          ward: employee.ward || 'Unassigned'
        });
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    }
  };

  const loadOfflineData = async () => {
    try {
      const pending = await offlineStorage.getPendingIssues();
      const drafts = await offlineStorage.getDraftIssues();
      const stats = await offlineStorage.getStatistics();
      
      setOfflineIssues(pending.length);
      setDraftIssues(drafts.length);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const handleIssueReported = () => {
    loadOfflineData();
  };

  const handleQuickPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Store photo with timestamp for later reporting
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoData = {
            timestamp: new Date(),
            photo: event.target?.result as string,
            location: null
          };
          
          // Get location if available
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              photoData.location = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              };
              localStorage.setItem('quickPhoto_' + Date.now(), JSON.stringify(photoData));
              alert('Photo saved! You can report it later from Saved Issues.');
            });
          } else {
            localStorage.setItem('quickPhoto_' + Date.now(), JSON.stringify(photoData));
            alert('Photo saved! You can report it later from Saved Issues.');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSync = async () => {
    if (!isOnline) {
      alert('No internet connection. Will sync when online.');
      return;
    }
    
    if (offlineIssues === 0) {
      alert('No pending issues to sync.');
      return;
    }
    
    try {
      // Simulate sync process
      alert('Syncing ' + offlineIssues + ' issues...');
      
      // In real implementation, this would sync with VMC servers
      setTimeout(async () => {
        try {
          const pendingIssues = await offlineStorage.getPendingIssues();
          
          // Mark all pending issues as synced
          for (const issue of pendingIssues) {
            if (issue.id) {
              await offlineStorage.updateIssueStatus(issue.id, 'synced');
            }
          }
          
          setLastSync(new Date());
          loadOfflineData();
          alert('Sync completed successfully!');
        } catch (error) {
          console.error('Sync error:', error);
          alert('Sync failed. Please try again.');
        }
      }, 2000);
    } catch (error) {
      alert('Sync error occurred.');
    }
  };

  const getLocationInfo = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const ward = await offlineStorage.getWardByLocation(pos.coords.latitude, pos.coords.longitude);
          alert(`Current Location:\nLat: ${pos.coords.latitude.toFixed(6)}\nLng: ${pos.coords.longitude.toFixed(6)}\nWard: ${ward?.name || 'Unknown'}\nAccuracy: ±${pos.coords.accuracy?.toFixed(0)}m`);
        },
        (error) => {
          alert('Location not available. Please enable GPS and try again.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert('Geolocation not supported on this device.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNavigation={true} />
      
      <main className="flex-1 p-4 space-y-4">
        {/* Employee Info Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{employeeInfo.name}</h1>
                <p className="text-sm text-gray-600">{employeeInfo.id} • {employeeInfo.ward}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isOnline 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          {lastSync && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Last sync: {lastSync.toLocaleTimeString()}</span>
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="mt-4 flex gap-2 border-b">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`pb-2 px-1 text-sm ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('smart')}
              className={`pb-2 px-1 text-sm ${activeTab === 'smart' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Smart Tools
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`pb-2 px-1 text-sm ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{statistics.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-orange-600">{offlineIssues + draftIssues}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{statistics.resolved}</p>
                <p className="text-xs text-gray-600">Resolved</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-purple-600">{statistics.resolutionRate}%</p>
                <p className="text-xs text-gray-600">Success</p>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48">
                <BaseMap showIssues={true} />
              </div>
            </div>

            {/* Main Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => setShowIssueReport(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-lg text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Report New Issue
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleQuickPhoto}
                  className="py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Quick Photo
                </Button>
                <Button 
                  onClick={getLocationInfo}
                  className="py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  My Location
                </Button>
              </div>
            </div>

            {/* Secondary Actions */}
            {(offlineIssues > 0 || draftIssues > 0) && (
              <Button 
                onClick={() => setShowSavedIssues(true)}
                className="w-full py-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium"
              >
                <List className="w-4 h-4 mr-2" />
                View Saved Issues ({offlineIssues + draftIssues})
              </Button>
            )}

            <Button 
              onClick={handleSync}
              className={`w-full py-4 rounded-lg font-medium ${
                isOnline && offlineIssues > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!isOnline || offlineIssues === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isOnline 
                ? offlineIssues > 0 
                  ? `Sync Now (${offlineIssues})` 
                  : 'All Synced'
                : 'Offline - Will Sync When Online'
              }
            </Button>
          </>
        )}

        {activeTab === 'smart' && (
          <SmartFeatures 
            onVoiceText={(text) => console.log('Voice text:', text)}
            onPhotoCapture={(photo) => console.log('Photo captured:', photo.substring(0, 50))}
            onFeedback={(rating) => console.log('Citizen feedback:', rating)}
          />
        )}

        {activeTab === 'route' && <RouteOptimization />}
        {activeTab === 'profile' && <UserProfile role="FIELD_WORKER" />}
      </main>

      {/* Modals */}
      {showIssueReport && (
        <IssueReport
          onClose={() => setShowIssueReport(false)}
          onSave={handleIssueReported}
        />
      )}

      {showSavedIssues && (
        <SavedIssues
          onClose={() => setShowSavedIssues(false)}
        />
      )}
    </div>
  );
}
