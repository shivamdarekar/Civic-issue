"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Users, Send } from "lucide-react";

interface Issue {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: Date;
  slaHours: number;
  assignedTo?: string;
  status: string;
  ward: string;
  description: string;
}

export default function SLAMonitoring() {
  const [overdueIssues, setOverdueIssues] = useState<Issue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);

  useEffect(() => {
    const mockIssues: Issue[] = [
      {
        id: "ISS001",
        type: "pothole",
        priority: "critical",
        reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        slaHours: 4,
        ward: "Ward 1 - Alkapuri",
        status: "pending",
        description: "Large pothole blocking main road"
      },
      {
        id: "ISS002", 
        type: "garbage",
        priority: "high",
        reportedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        slaHours: 24,
        ward: "Ward 2 - Fatehgunj",
        status: "in_progress",
        description: "Garbage accumulation near market"
      }
    ];
    setOverdueIssues(mockIssues);
  }, []);

  const getOverdueHours = (issue: Issue) => {
    const hoursElapsed = (Date.now() - issue.reportedAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hoursElapsed - issue.slaHours);
  };

  const handleBulkEscalate = () => {
    if (selectedIssues.length === 0) {
      alert("Please select issues to escalate");
      return;
    }
    alert(`Escalated ${selectedIssues.length} issues to Zone Officer and Commissioner`);
    setSelectedIssues([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-red-600">SLA Violations</h3>
        <Button 
          onClick={handleBulkEscalate}
          className="bg-red-600 hover:bg-red-700"
          disabled={selectedIssues.length === 0}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Escalate Selected ({selectedIssues.length})
        </Button>
      </div>

      <div className="grid gap-4">
        {overdueIssues.map((issue) => (
          <Card key={issue.id} className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIssues.includes(issue.id)}
                  onChange={() => setSelectedIssues(prev => 
                    prev.includes(issue.id) 
                      ? prev.filter(id => id !== issue.id)
                      : [...prev, issue.id]
                  )}
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{issue.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      issue.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {issue.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{issue.description}</p>
                  <div className="text-sm text-gray-600">
                    📍 {issue.ward} • ⏰ SLA: {issue.slaHours}h • 🚨 Overdue: {getOverdueHours(issue).toFixed(1)}h
                  </div>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Send className="w-4 h-4 mr-1" />
                Escalate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}