"use client";

import { useState, useEffect } from "react";
import { X, Eye } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { offlineStorage, CivicIssue } from "@/lib/offline-storage";
import { useLanguage } from "@/lib/language-context";

interface SavedIssuesProps {
  onClose: () => void;
}

export default function SavedIssues({ onClose }: SavedIssuesProps) {
  const { t } = useLanguage();
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const pending = await offlineStorage.getPendingIssues();
      const drafts = await offlineStorage.getDraftIssues();
      setIssues([...pending, ...drafts]);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-600';
      case 'pending_sync': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return t('draft');
      case 'pending_sync': return 'Pending Sync';
      default: return status;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'pothole': return '🕳️';
      case 'garbage': return '🗑️';
      case 'drainage': return '🌊';
      case 'streetlight': return '💡';
      case 'road': return '🛣️';
      case 'water': return '💧';
      default: return '📋';
    }
  };

  if (selectedIssue) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Issue Details
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {getIssueIcon(selectedIssue.type)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t(`issue.type.${selectedIssue.type}`)}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(selectedIssue.status)}`}>
                    {getStatusText(selectedIssue.status)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-slate-300">
                  {selectedIssue.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-slate-400">
                  📍 {selectedIssue.location.lat.toFixed(6)}, {selectedIssue.location.lng.toFixed(6)}
                </div>
                <div className="text-sm text-slate-400">
                  🏢 {selectedIssue.ward}
                </div>
                <div className="text-sm text-slate-400">
                  ⏰ {new Date(selectedIssue.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">
                  📷 {selectedIssue.photos.length} photos
                </div>
              </div>

              {selectedIssue.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedIssue.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-slate-600"
                    />
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setSelectedIssue(null)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              {t('back')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {t('dashboard.saved.issues')}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Image 
                src="/VMC.webp" 
                alt="Loading" 
                width={32} 
                height={32} 
                className="w-8 h-8 object-contain mx-auto mb-2 animate-pulse"
              />
              <div className="text-slate-400">Loading...</div>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-8">
              <Image 
                src="/VMC.webp" 
                alt="No Issues" 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain mx-auto mb-4 opacity-50"
              />
              <div className="text-slate-400 mb-2">No saved issues</div>
              <p className="text-sm text-slate-500">
                Issues you save as drafts or report offline will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-650 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-xl">
                        {getIssueIcon(issue.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm">
                            {t(`issue.type.${issue.type}`)}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(issue.status)}`}>
                            {getStatusText(issue.status)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">
                          {issue.ward}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(issue.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedIssue(issue)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-500">
              {issues.length} saved issue{issues.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}