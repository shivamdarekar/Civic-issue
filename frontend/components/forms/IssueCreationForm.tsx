"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, AlertCircle } from "lucide-react";
import { issueService } from "@/lib/issueService";

export default function IssueCreationForm() {
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location error:', error);
        setError('Location access required for issue reporting');
      }
    );
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const result = await issueService.getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      setError('Location is required');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const issueData = {
      latitude: location.latitude,
      longitude: location.longitude,
      categoryId: formData.get('categoryId') as string,
      description: formData.get('description') as string,
    };

    const result = await issueService.createIssue(issueData, photo || undefined);
    
    if (result.success) {
      alert(`Issue created! Ticket: ${result.data.ticketNumber}`);
      (e.target as HTMLFormElement).reset();
      setPhoto(null);
    } else {
      setError(result.message || 'Failed to create issue');
    }
    
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">Report New Issue</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select name="categoryId" required className="w-full p-2 border rounded-lg">
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Describe the issue..."
            required
            className="w-full p-2 border rounded-lg h-24"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        )}
        
        <Button type="submit" disabled={loading || !location} className="w-full">
          {loading ? 'Creating Issue...' : 'Report Issue'}
        </Button>
      </form>
    </Card>
  );
}