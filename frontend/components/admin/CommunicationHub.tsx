"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Users, AlertTriangle, Megaphone, Bell } from "lucide-react";

export default function CommunicationHub() {
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleBroadcast = () => {
    if (!message || !recipient || !messageType) {
      alert("Please fill all fields");
      return;
    }
    
    alert(`${messageType} sent to ${recipient}: "${message}"`);
    setMessage("");
    setRecipient("");
    setMessageType("");
  };

  const quickMessages = [
    "Monsoon preparedness: Check all drainage systems",
    "Emergency: All field workers report to headquarters",
    "Weekly meeting scheduled for tomorrow 10 AM",
    "New safety protocols effective immediately"
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Communication Hub</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Broadcast Message
          </h4>
          
          <div className="space-y-4">
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Message Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">🚨 Emergency Alert</SelectItem>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="instruction">📋 Work Instruction</SelectItem>
                <SelectItem value="update">ℹ️ Status Update</SelectItem>
              </SelectContent>
            </Select>

            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Send To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_field_workers">All Field Workers</SelectItem>
                <SelectItem value="all_engineers">All Ward Engineers</SelectItem>
                <SelectItem value="all_officers">All Zone Officers</SelectItem>
                <SelectItem value="zone_a">Zone A Team</SelectItem>
                <SelectItem value="zone_b">Zone B Team</SelectItem>
                <SelectItem value="emergency_team">Emergency Response Team</SelectItem>
              </SelectContent>
            </Select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />

            <Button onClick={handleBroadcast} className="w-full bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Quick Messages
          </h4>
          
          <div className="space-y-3">
            {quickMessages.map((msg, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm flex-1">{msg}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setMessage(msg)}
                >
                  Use
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Recent Broadcasts
        </h4>
        
        <div className="space-y-3">
          {[
            { time: "2 hours ago", type: "Emergency", message: "Water pipeline burst in Ward 5", recipient: "Zone B Team" },
            { time: "1 day ago", type: "Announcement", message: "Monthly performance review meeting", recipient: "All Engineers" },
            { time: "2 days ago", type: "Instruction", message: "Pothole filling priority areas updated", recipient: "All Field Workers" }
          ].map((broadcast, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    broadcast.type === 'Emergency' ? 'bg-red-100 text-red-700' :
                    broadcast.type === 'Announcement' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {broadcast.type}
                  </span>
                  <span className="text-sm text-gray-500">{broadcast.time}</span>
                </div>
                <p className="text-sm font-medium">{broadcast.message}</p>
                <p className="text-xs text-gray-500">To: {broadcast.recipient}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}