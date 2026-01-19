"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function FieldWorkerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-500">Assigned Issues</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-gray-500">Resolved Today</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex-col">
            <Camera className="w-6 h-6 mb-2" />
            Report Issue
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <MapPin className="w-6 h-6 mb-2" />
            View Map
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <CheckCircle className="w-6 h-6 mb-2" />
            Update Status
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Clock className="w-6 h-6 mb-2" />
            My Tasks
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Assignments</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="destructive">High</Badge>
                <div>
                  <p className="font-medium">Pothole on Main Road</p>
                  <p className="text-sm text-gray-500">Ward 15 • Reported 2 hours ago</p>
                </div>
              </div>
              <Button size="sm">View Details</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}