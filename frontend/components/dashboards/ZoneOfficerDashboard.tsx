"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, TrendingUp, Users2, Calendar, MapPin, Target } from "lucide-react";

export default function ZoneOfficerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-500">Wards Managed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-sm text-gray-500">Zone Performance</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users2 className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">45</p>
              <p className="text-sm text-gray-500">Staff Members</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-gray-500">Issues Resolved</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Zone Management</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex-col">
            <Building className="w-6 h-6 mb-2" />
            Ward Overview
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <TrendingUp className="w-6 h-6 mb-2" />
            Performance
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users2 className="w-6 h-6 mb-2" />
            Staff Coordination
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Calendar className="w-6 h-6 mb-2" />
            Schedule
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ward Performance</h3>
          <div className="space-y-3">
            {[
              { ward: "Ward 12", issues: 23, resolved: 20, rate: "87%" },
              { ward: "Ward 15", issues: 18, resolved: 17, rate: "94%" },
              { ward: "Ward 18", issues: 31, resolved: 25, rate: "81%" },
              { ward: "Ward 22", issues: 15, resolved: 15, rate: "100%" }
            ].map((ward, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{ward.ward}</p>
                    <p className="text-sm text-gray-500">{ward.resolved}/{ward.issues} resolved</p>
                  </div>
                </div>
                <Badge className={parseInt(ward.rate) > 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {ward.rate}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Zone Coordination</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">Inter-Ward Projects</p>
              <p className="text-sm text-blue-600">3 active cross-ward initiatives</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Resource Sharing</p>
              <p className="text-sm text-green-600">Equipment optimally distributed</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-medium text-orange-800">Escalated Issues</p>
              <p className="text-sm text-orange-600">2 issues need attention</p>
            </div>
            <Button className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Coordination Meeting
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}