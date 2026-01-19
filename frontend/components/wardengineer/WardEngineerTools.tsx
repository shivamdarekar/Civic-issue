"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Star, DollarSign } from "lucide-react";

export default function WardEngineerTools() {
  const [activeTab, setActiveTab] = useState('verification');
  
  const pendingVerifications = [
    {
      id: "ISS001",
      type: "pothole",
      reportedBy: "Rajesh Kumar (FW001)",
      description: "Large pothole filled with cement",
      materialsUsed: "2 bags cement, 1 trolley sand",
      timeSpent: "2.5 hours",
      location: "Alkapuri Main Road"
    }
  ];

  const resourceRequests = [
    {
      id: "REQ001",
      requestedBy: "FW001",
      items: "5 bags cement, 2 trolleys sand",
      estimatedCost: "₹3,500",
      priority: "high",
      reason: "Multiple pothole repairs in Ward 1"
    }
  ];

  const handleVerification = (issueId: string, approved: boolean) => {
    alert(`Issue ${issueId} ${approved ? 'approved' : 'rejected'}`);
  };

  const handleResourceApproval = (reqId: string, approved: boolean) => {
    alert(`Resource request ${reqId} ${approved ? 'approved' : 'rejected'}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('verification')}
          className={`pb-2 px-1 ${activeTab === 'verification' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Quality Control
        </button>
        <button 
          onClick={() => setActiveTab('resources')}
          className={`pb-2 px-1 ${activeTab === 'resources' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Resource Approval
        </button>
      </div>

      {activeTab === 'verification' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Photo Verification & Quality Control</h4>
          {pendingVerifications.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-semibold">{item.id} - {item.type}</h5>
                  <p className="text-sm text-gray-600">By: {item.reportedBy}</p>
                  <p className="text-sm text-gray-600">📍 {item.location}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm mb-2"><strong>Work Done:</strong> {item.description}</p>
                <p className="text-sm mb-2"><strong>Materials:</strong> {item.materialsUsed}</p>
                <p className="text-sm"><strong>Time Spent:</strong> {item.timeSpent}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Quality Rating:</span>
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-4 h-4 text-yellow-500 cursor-pointer" />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleVerification(item.id, false)}
                    size="sm" 
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleVerification(item.id, true)}
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Resource Approval Requests</h4>
          {resourceRequests.map((req) => (
            <Card key={req.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-semibold">{req.id}</h5>
                  <p className="text-sm text-gray-600">Requested by: {req.requestedBy}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  req.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {req.priority.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm"><strong>Items:</strong> {req.items}</p>
                <p className="text-sm"><strong>Estimated Cost:</strong> {req.estimatedCost}</p>
                <p className="text-sm"><strong>Reason:</strong> {req.reason}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleResourceApproval(req.id, false)}
                  size="sm" 
                  variant="outline"
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => handleResourceApproval(req.id, true)}
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}