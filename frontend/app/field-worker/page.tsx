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

export default function FieldWorkerPage() {
  const dispatch = useAppDispatch();
  const { fieldWorkerDashboard, loading, error } = useAppSelector((state) => state.user);
  const { user } = useAppSelector((state) => state.userState);

  useEffect(() => {
    dispatch(fetchFieldWorkerDashboard(10));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Field Worker Dashboard</h1>
                <p className="text-gray-600">Issue reporting and tracking</p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
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
            <CardTitle>Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
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