"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, FileText, BarChart3 } from "lucide-react";

export default function ZoneOfficerTools() {
  const [activeTab, setActiveTab] = useState('coordination');

  const crossWardProjects = [
    {
      id: "PROJ001",
      name: "Main Road Pothole Campaign",
      wards: ["Ward 1", "Ward 2", "Ward 3"],
      budget: "₹2,50,000",
      progress: 65,
      deadline: "2024-02-15"
    },
    {
      id: "PROJ002", 
      name: "Drainage System Upgrade",
      wards: ["Ward 2", "Ward 4"],
      budget: "₹4,00,000",
      progress: 30,
      deadline: "2024-03-30"
    }
  ];

  const budgetAllocation = [
    { ward: "Ward 1", allocated: "₹1,50,000", spent: "₹1,20,000", remaining: "₹30,000" },
    { ward: "Ward 2", allocated: "₹1,80,000", spent: "₹1,45,000", remaining: "₹35,000" },
    { ward: "Ward 3", allocated: "₹1,60,000", spent: "₹1,30,000", remaining: "₹30,000" }
  ];

  const contractorOversight = [
    {
      name: "ABC Construction",
      project: "Road Repair Contract",
      performance: 92,
      issues: 2,
      status: "Active"
    },
    {
      name: "XYZ Services", 
      project: "Garbage Collection",
      performance: 88,
      issues: 1,
      status: "Active"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('coordination')}
          className={`pb-2 px-1 ${activeTab === 'coordination' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Cross-Ward Projects
        </button>
        <button 
          onClick={() => setActiveTab('budget')}
          className={`pb-2 px-1 ${activeTab === 'budget' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Budget Allocation
        </button>
        <button 
          onClick={() => setActiveTab('contractors')}
          className={`pb-2 px-1 ${activeTab === 'contractors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Contractor Oversight
        </button>
      </div>

      {activeTab === 'coordination' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Cross-Ward Project Coordination</h4>
          {crossWardProjects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-semibold">{project.name}</h5>
                  <p className="text-sm text-gray-600">Project ID: {project.id}</p>
                  <p className="text-sm text-gray-600">Wards: {project.wards.join(", ")}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{project.budget}</div>
                  <div className="text-sm text-gray-500">Budget</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deadline: {project.deadline}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Manage</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Budget Allocation & Tracking</h4>
          
          <Card className="p-4">
            <h5 className="font-semibold mb-4">Zone Budget Overview</h5>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">₹15,00,000</div>
                <div className="text-sm text-gray-600">Total Allocated</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">₹11,95,000</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">₹3,05,000</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h5 className="font-semibold mb-4">Ward-wise Budget Status</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Ward</th>
                    <th className="text-left p-2">Allocated</th>
                    <th className="text-left p-2">Spent</th>
                    <th className="text-left p-2">Remaining</th>
                    <th className="text-left p-2">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetAllocation.map((ward, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{ward.ward}</td>
                      <td className="p-2">{ward.allocated}</td>
                      <td className="p-2">{ward.spent}</td>
                      <td className="p-2">{ward.remaining}</td>
                      <td className="p-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${80 + index * 5}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Contractor Performance Oversight</h4>
          {contractorOversight.map((contractor, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h5 className="font-semibold">{contractor.name}</h5>
                  <p className="text-sm text-gray-600">{contractor.project}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  contractor.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {contractor.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{contractor.performance}%</div>
                  <div className="text-xs text-gray-600">Performance Score</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{contractor.issues}</div>
                  <div className="text-xs text-gray-600">Open Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">15</div>
                  <div className="text-xs text-gray-600">Completed Tasks</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">View Contract</Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Performance Review</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}