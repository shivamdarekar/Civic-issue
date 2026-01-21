"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Users, BarChart3, FileText, Settings, Truck } from "lucide-react";

export default function WardEngineerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">28</p>
              <p className="text-sm text-gray-500">Active Projects</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">15</p>
              <p className="text-sm text-gray-500">Team Members</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-sm text-gray-500">Equipment Active</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Engineering Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex-col">
            <Wrench className="w-6 h-6 mb-2" />
            Technical Review
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users className="w-6 h-6 mb-2" />
            Assign Teams
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Truck className="w-6 h-6 mb-2" />
            Equipment Log
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <FileText className="w-6 h-6 mb-2" />
            Reports
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Issues</h3>
          <div className="space-y-3">
            {[
              { title: "Water Pipeline Burst", location: "Sector 12", priority: "Critical" },
              { title: "Road Reconstruction", location: "Main Street", priority: "High" },
              { title: "Drainage Cleaning", location: "Ward 8", priority: "Medium" }
            ].map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{issue.title}</p>
                  <p className="text-sm text-gray-500">{issue.location}</p>
                </div>
                <Badge variant={issue.priority === 'Critical' ? 'destructive' : 'secondary'}>
                  {issue.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resource Management</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Heavy Machinery</span>
              <Badge variant="outline">4/6 Available</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Field Teams</span>
              <Badge variant="outline">12/15 Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Materials Stock</span>
              <Badge className="bg-green-100 text-green-700">Good</Badge>
            </div>
            <Button className="w-full mt-4">
              <Settings className="w-4 h-4 mr-2" />
              Manage Resources
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}