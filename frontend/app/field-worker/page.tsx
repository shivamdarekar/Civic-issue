"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchFieldWorkerDashboard } from "@/redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReportIssueForm from "@/components/field-worker/ReportIssueForm";
import IssueStatistics from "@/components/shared/IssueStatistics";
import VMCLoader from "@/components/ui/VMCLoader";
import OfflineStatus from "@/components/shared/OfflineStatus";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function FieldWorkerPage() {
  const dispatch = useAppDispatch();
  const { fieldWorkerDashboard, loading, error } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.userState);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      dispatch(fetchFieldWorkerDashboard(10));
    }
  }, [dispatch, isOnline]);

  return (
    <div className="space-y-6">
      <OfflineStatus />
      
      {/* Header */}
      <Card>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Field Worker Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600">Issue reporting and tracking</p>
              </div>
            </div>
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <ReportIssueForm />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Statistics */}
      <IssueStatistics 
        reporterId={user?.id}
        title="My Issue Statistics"
      />

      {/* Recent Issues Table */}
      {fieldWorkerDashboard?.recentIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Issues</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {fieldWorkerDashboard.recentIssues.map((issue) => (
                <div key={issue.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={`text-xs ${
                      issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </Badge>
                    {issue.priority && (
                      <Badge className={`text-xs ${
                        issue.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">#{issue.ticketNumber}</p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
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
                  {fieldWorkerDashboard.recentIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {issue.ticketNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${
                          issue.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          issue.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.priority && (
                          <Badge className={`${
                            issue.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.priority}
                          </Badge>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}