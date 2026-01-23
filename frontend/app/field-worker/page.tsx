"use client";

import { useState, useEffect } from "react";
import { Users, FileText, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchFieldWorkerDashboard } from "@/redux";
import StatCard from "@/components/admin/StatCard";
import ReportIssueForm from "@/components/field-worker/ReportIssueForm";

export default function FieldWorkerPage() {
  const dispatch = useAppDispatch();
  const { fieldWorkerDashboard, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchFieldWorkerDashboard(10));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const dashboard = fieldWorkerDashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Field Worker Dashboard</h1>
              <p className="text-gray-600">Issue reporting and tracking</p>
            </div>
          </div>
          <ReportIssueForm />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Issues Created" 
          value={dashboard?.totalIssuesCreated?.toString() || '0'} 
          icon={<FileText className="w-6 h-6" />} 
          color="blue" 
        />
        <StatCard 
          title="Open Issues" 
          value={dashboard?.issuesByStatus?.OPEN?.toString() || '0'} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="orange" 
        />
        <StatCard 
          title="In Progress" 
          value={dashboard?.issuesByStatus?.IN_PROGRESS?.toString() || '0'} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="purple" 
        />
        <StatCard 
          title="Resolved" 
          value={dashboard?.issuesByStatus?.RESOLVED?.toString() || '0'} 
          icon={<CheckCircle className="w-6 h-6" />} 
          color="green" 
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Issues by Status</h3>
          <div className="space-y-3">
            {dashboard?.issuesByStatus && Object.entries(dashboard.issuesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                <span className="font-semibold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Created</span>
              <span className="font-semibold text-gray-800">{dashboard?.totalIssuesCreated || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-gray-800">{dashboard?.recentIssues?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Issues</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboard?.recentIssues?.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {issue.ticketNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {issue.priority && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        issue.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}