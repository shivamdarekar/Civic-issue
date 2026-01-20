"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IssueTableProps {
  role: "FIELD_WORKER" | "WARD_ENGINEER" | "ZONE_OFFICER" | "SUPER_ADMIN";
}

const mockIssues = [
  {
    id: "ISS-001",
    type: "Pothole",
    location: "MG Road, Ward 12",
    status: "Open",
    priority: "High",
    reportedBy: "Field Worker #42",
    date: "2024-01-05",
  },
  {
    id: "ISS-002",
    type: "Garbage",
    location: "Sayaji Gunj, Ward 8",
    status: "In Progress",
    priority: "Medium",
    reportedBy: "Field Worker #17",
    date: "2024-01-05",
  },
  {
    id: "ISS-003",
    type: "Drainage",
    location: "Alkapuri, Ward 5",
    status: "Resolved",
    priority: "Low",
    reportedBy: "Field Worker #23",
    date: "2024-01-04",
  },
];

export default function IssueTable({ role }: IssueTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-700 border-red-200";
      case "in progress":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recent Issues</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockIssues.map((issue) => (
              <tr 
                key={issue.id} 
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-mono text-blue-600">{issue.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{issue.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{issue.location}</td>
                <td className="px-4 py-3">
                  <Badge className={`${getStatusColor(issue.status)} border`}>
                    {issue.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${getPriorityColor(issue.priority)} border`}>
                    {issue.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {role === "WARD_ENGINEER" && (
                    <Button size="sm" variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                      Verify
                    </Button>
                  )}
                  {role === "ZONE_OFFICER" && (
                    <Button size="sm" variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                      View
                    </Button>
                  )}
                  {role === "SUPER_ADMIN" && (
                    <Button size="sm" variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                      Manage
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
