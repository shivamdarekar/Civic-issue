"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, Star, BarChart3, MapPin, Calendar } from "lucide-react";

export default function AdvancedAnalytics() {
  const hotspots = [
    { area: "Alkapuri Main Road", issues: 45, trend: "+15%", risk: "High" },
    { area: "Fatehgunj Market", issues: 32, trend: "+8%", risk: "Medium" },
    { area: "Sayajigunj Circle", issues: 28, trend: "-5%", risk: "Low" }
  ];

  const costAnalysis = [
    { type: "Pothole Repair", avgCost: "₹2,500", totalSpent: "₹1,25,000", count: 50 },
    { type: "Garbage Collection", avgCost: "₹800", totalSpent: "₹64,000", count: 80 },
    { type: "Drainage Cleaning", avgCost: "₹1,200", totalSpent: "₹36,000", count: 30 }
  ];

  const wardPerformance = [
    { ward: "Ward 1", efficiency: 92, satisfaction: 4.2, issues: 45, resolved: 41 },
    { ward: "Ward 2", efficiency: 88, satisfaction: 4.0, issues: 52, resolved: 46 },
    { ward: "Ward 3", efficiency: 95, satisfaction: 4.5, issues: 38, resolved: 36 }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Advanced Analytics & Insights</h3>
      
      {/* Predictive Analytics */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Predictive Issue Hotspots
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotspots.map((spot, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold">{spot.area}</h5>
                <span className={`px-2 py-1 rounded text-xs ${
                  spot.risk === 'High' ? 'bg-red-100 text-red-700' :
                  spot.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {spot.risk} Risk
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>📊 {spot.issues} issues predicted</div>
                <div>📈 Trend: {spot.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cost Analysis */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Cost Analysis by Issue Type
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Issue Type</th>
                <th className="text-left p-2">Count</th>
                <th className="text-left p-2">Avg Cost</th>
                <th className="text-left p-2">Total Spent</th>
                <th className="text-left p-2">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {costAnalysis.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{item.type}</td>
                  <td className="p-2">{item.count}</td>
                  <td className="p-2">{item.avgCost}</td>
                  <td className="p-2 font-semibold">{item.totalSpent}</td>
                  <td className="p-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${85 + index * 5}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Benchmarking */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Ward Performance Comparison
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wardPerformance.map((ward, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <h5 className="font-semibold mb-3">{ward.ward}</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Efficiency</span>
                    <span className="font-semibold">{ward.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${ward.efficiency}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Satisfaction</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {ward.satisfaction}/5
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>📋 Issues: {ward.issues}</div>
                  <div>✅ Resolved: {ward.resolved}</div>
                  <div>📊 Rate: {Math.round((ward.resolved/ward.issues)*100)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Citizen Satisfaction Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Citizen Satisfaction Trends
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Overall Rating</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span className="font-bold">4.2/5</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span>4.5/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Work Quality</span>
                <span>4.1/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Communication</span>
                <span>3.9/5</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Monthly Trends
          </h4>
          <div className="space-y-3">
            {['January', 'February', 'March'].map((month, index) => (
              <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{month}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{450 + index * 20} issues</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    index === 2 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {index === 2 ? '↓ 12%' : '↑ 5%'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}