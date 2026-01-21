"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface Zone {
  id: string;
  name: string;
  direction: 'East' | 'West' | 'North' | 'South';
  totalIssues: number;
  resolvedIssues: number;
  performance: number;
}

interface Ward {
  id: string;
  wardNumber: number;
  name: string;
  zoneId: string;
  totalIssues: number;
  resolvedIssues: number;
}

interface Issue {
  id: string;
  ticketNumber: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  wardId: string;
}

export default function ZonePerformance() {
  const [view, setView] = useState<'zones' | 'wards' | 'issues'>('zones');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadZones();
    const interval = setInterval(() => {
      if (view === 'zones') loadZones();
      else if (view === 'wards' && selectedZone) loadWards(selectedZone.id);
      else if (view === 'issues' && selectedWard) loadIssues(selectedWard.id);
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [view, selectedZone, selectedWard]);

  const loadZones = async () => {
    setLoading(true);
    try {
      // const response = await apiClient.get('/admin/zones/performance');
      const zonesData: Zone[] = [
        { id: '1', name: 'East Zone', direction: 'East' as const, totalIssues: Math.floor(Math.random() * 20) + 40, resolvedIssues: Math.floor(Math.random() * 15) + 35, performance: Math.floor(Math.random() * 15) + 80 },
        { id: '2', name: 'West Zone', direction: 'West' as const, totalIssues: Math.floor(Math.random() * 20) + 45, resolvedIssues: Math.floor(Math.random() * 15) + 40, performance: Math.floor(Math.random() * 15) + 85 },
        { id: '3', name: 'North Zone', direction: 'North' as const, totalIssues: Math.floor(Math.random() * 20) + 35, resolvedIssues: Math.floor(Math.random() * 15) + 30, performance: Math.floor(Math.random() * 15) + 80 },
        { id: '4', name: 'South Zone', direction: 'South' as const, totalIssues: Math.floor(Math.random() * 20) + 38, resolvedIssues: Math.floor(Math.random() * 15) + 35, performance: Math.floor(Math.random() * 15) + 90 }
      ];
      setZones(zonesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading zones:', error);
    }
    setLoading(false);
  };

  const loadWards = async (zoneId: string) => {
    setLoading(true);
    try {
      // const response = await apiClient.get(`/admin/zones/${zoneId}/wards`);
      const wardsData = [
        { id: '1', wardNumber: 1, name: 'Ward 1', zoneId, totalIssues: Math.floor(Math.random() * 10) + 8, resolvedIssues: Math.floor(Math.random() * 8) + 6 },
        { id: '2', wardNumber: 2, name: 'Ward 2', zoneId, totalIssues: Math.floor(Math.random() * 10) + 12, resolvedIssues: Math.floor(Math.random() * 8) + 10 },
        { id: '3', wardNumber: 3, name: 'Ward 3', zoneId, totalIssues: Math.floor(Math.random() * 10) + 15, resolvedIssues: Math.floor(Math.random() * 8) + 12 }
      ];
      setWards(wardsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading wards:', error);
    }
    setLoading(false);
  };

  const loadIssues = async (wardId: string) => {
    setLoading(true);
    try {
      // const response = await apiClient.get(`/admin/wards/${wardId}/issues`);
      const statuses = ['RESOLVED', 'IN_PROGRESS', 'PENDING'];
      const priorities = ['High', 'Medium', 'Low'];
      const categories = ['Road Repair', 'Water Supply', 'Garbage', 'Drainage', 'Street Light'];
      
      const issuesData = Array.from({length: 5}, (_, i) => ({
        id: `${i + 1}`,
        ticketNumber: `TKT${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        description: `Issue description ${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        wardId
      }));
      
      setIssues(issuesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading issues:', error);
    }
    setLoading(false);
  };

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    setView('wards');
    loadWards(zone.id);
  };

  const handleWardClick = (ward: Ward) => {
    setSelectedWard(ward);
    setView('issues');
    loadIssues(ward.id);
  };

  const handleBack = () => {
    if (view === 'issues') {
      setView('wards');
      setSelectedWard(null);
    } else if (view === 'wards') {
      setView('zones');
      setSelectedZone(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {view !== 'zones' && (
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h3 className="text-lg font-semibold">
            {view === 'zones' && 'Zone Performance'}
            {view === 'wards' && `${selectedZone?.name} - Wards`}
            {view === 'issues' && `Ward ${selectedWard?.wardNumber} - Issues`}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Button variant="ghost" size="sm" onClick={() => {
            if (view === 'zones') loadZones();
            else if (view === 'wards' && selectedZone) loadWards(selectedZone.id);
            else if (view === 'issues' && selectedWard) loadIssues(selectedWard.id);
          }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <img src="/VMC.webp" alt="Loading" className="w-12 h-12 animate-pulse" />
        </div>
      ) : (
        <>
          {view === 'zones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => handleZoneClick(zone)}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{zone.name}</h4>
                    <Badge className={zone.performance > 85 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {zone.performance}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{zone.resolvedIssues}/{zone.totalIssues} resolved</p>
                    <p className="text-xs mt-1">{zone.direction} Direction</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'wards' && (
            <div className="space-y-3">
              {wards.map((ward) => (
                <div
                  key={ward.id}
                  onClick={() => handleWardClick(ward)}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Ward {ward.wardNumber}</p>
                      <p className="text-sm text-gray-600">{ward.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{ward.resolvedIssues}/{ward.totalIssues}</p>
                    <p className="text-sm text-gray-600">Issues Resolved</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'issues' && (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(issue.status)}
                      <span className="font-medium">{issue.ticketNumber}</span>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-medium mb-1">{issue.category}</p>
                  <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  <p className="text-xs text-gray-500">Created: {issue.createdAt}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}