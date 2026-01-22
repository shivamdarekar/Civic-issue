"use client";

import { useState, useEffect } from "react";
import { Shield, FileText, Users, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAdminDashboard, fetchZonesOverview } from "@/redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StatCard from "@/components/admin/StatCard";
import SystemOverview from "@/components/admin/SystemOverview";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { dashboard, zonesOverview, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchZonesOverview());
  }, [dispatch]);

  useEffect(() => {
    console.log('Zones Overview Data:', zonesOverview);
  }, [zonesOverview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading dashboard: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">System Overview</CardTitle>
              <p className="text-gray-600">Vadodara Municipal Corporation - Complete system oversight</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Issues" 
          value={dashboard?.totalIssues?.toString() || '0'} 
          icon={<FileText className="w-6 h-6" />} 
          color="blue" 
        />
        <StatCard 
          title="Open Issues" 
          value={dashboard?.open?.toString() || '0'} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="orange" 
        />
        <StatCard 
          title="In Progress" 
          value={dashboard?.inProgress?.toString() || '0'} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="purple" 
        />
        <StatCard 
          title="SLA Breached" 
          value={dashboard?.slaBreached?.toString() || '0'} 
          icon={<Clock className="w-6 h-6" />} 
          color="red" 
        />
        <StatCard 
          title="Avg SLA Time" 
          value={`${Number(dashboard?.avgSlaTimeHours || 0).toFixed(1)}h`} 
          icon={<Clock className="w-6 h-6" />} 
          color="emerald" 
        />
        <StatCard 
          title="Resolution Rate" 
          value={`${Number(dashboard?.resolutionRatePercent || 0).toFixed(1)}%`} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="green" 
        />
      </div>

      {/* System Overview Component */}
      <SystemOverview dashboard={dashboard} zonesOverview={zonesOverview} />
    </div>
  );
}