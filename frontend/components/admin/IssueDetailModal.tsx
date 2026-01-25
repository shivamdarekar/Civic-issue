"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Calendar, Clock, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchIssueById, clearIssuesError } from "@/redux";
import StatusUpdateButton from "@/components/ward/StatusUpdateButton";
import VerificationButton from "@/components/zone/VerificationButton";
import ReopenButton from "@/components/zone/ReopenButton";
import MapThumbnail from "@/components/shared/MapButton";

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
}

export default function IssueDetailModal({ isOpen, onClose, issueId }: IssueDetailModalProps) {
  const dispatch = useAppDispatch();
  const { currentIssue, loading } = useAppSelector(state => state.issues);
  const { user } = useAppSelector(state => state.userState);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (isOpen && issueId && (!currentIssue || currentIssue.id !== issueId)) {
      dispatch(clearIssuesError());
      dispatch(fetchIssueById(issueId));
    }
  }, [dispatch, issueId, isOpen]);



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = () => {
    // Status updates are handled by Redux actions automatically
  };

  const hasAfterImages = currentIssue?.media?.some(m => m.type === 'AFTER') || false;
  const canUpdateStatus = user?.role === 'WARD_ENGINEER' && currentIssue?.assignee?.id === user?.id;
  const canVerify = user?.role === 'ZONE_OFFICER';
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <>      
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : currentIssue?.ticketNumber || 'Issue Details'}
              </h2>
              {!loading && currentIssue && (
                <p className="text-blue-600 font-medium mt-1">{currentIssue.category?.name || 'N/A'}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/50">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Skeleton className="h-64 rounded-lg" />
                  <Skeleton className="h-64 rounded-lg" />
                </div>
                <Skeleton className="h-32 rounded-lg" />
              </div>
            ) : currentIssue ? (
              <div className="space-y-6">
                {/* Issue Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Issue Information Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Issue Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Status</span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentIssue.status)}`}>
                          {currentIssue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Priority</span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(currentIssue.priority)}`}>
                          {currentIssue.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Department</span>
                        <span className="font-medium text-gray-900">{currentIssue.category?.department?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Reported By</span>
                        <span className="font-medium text-gray-900">{currentIssue.reporter?.fullName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600 font-medium">Assigned To</span>
                        <span className="font-medium text-gray-900">{currentIssue.assignee?.fullName || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Timeline Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Location & Timeline
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 py-2">
                        <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-md text-gray-700 mb-2 font-semibold">
                            Ward {currentIssue.ward?.wardNumber} - {currentIssue.ward?.name}
                          </p>
                          {currentIssue.latitude && currentIssue.longitude && (
                            <MapThumbnail 
                              latitude={currentIssue.latitude} 
                              longitude={currentIssue.longitude}
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2">
                        <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Created</p>
                          <p className="font-semibold text-gray-900">{formatDate(currentIssue.createdAt)}</p>
                        </div>
                      </div>
                      {currentIssue.slaTargetAt && (
                        <div className="flex items-start gap-3 py-2">
                          <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">SLA Target</p>
                            <p className="font-semibold text-gray-900">{formatDate(currentIssue.slaTargetAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {currentIssue.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Images Card */}
                {currentIssue.media && currentIssue.media.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Images ({currentIssue.media.length} total)
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(currentIssue.media?.filter(m => m.type === 'BEFORE').length || 0) > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            Before Images ({currentIssue.media?.filter(m => m.type === 'BEFORE').length})
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {currentIssue.media?.filter(m => m.type === 'BEFORE').map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image.url}
                                  alt={`Before ${index + 1}`}
                                  className="w-full h-28 object-cover rounded-lg cursor-pointer border border-gray-200"
                                  onClick={() => {
                                    setImageLoading(true);
                                    setSelectedImage(image.url);
                                    setTimeout(() => setImageLoading(false), 100);
                                  }}
                                  crossOrigin="anonymous"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(currentIssue.media?.filter(m => m.type === 'AFTER').length || 0) > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-green-500" />
                            After Images ({currentIssue.media?.filter(m => m.type === 'AFTER').length})
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {currentIssue.media?.filter(m => m.type === 'AFTER').map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image.url}
                                  alt={`After ${index + 1}`}
                                  className="w-full h-28 object-cover rounded-lg cursor-pointer border border-gray-200"
                                  onClick={() => {
                                    setImageLoading(true);
                                    setSelectedImage(image.url);
                                    setTimeout(() => setImageLoading(false), 100);
                                  }}
                                  crossOrigin="anonymous"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Issue not found</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {/* Ward Engineer Status Buttons */}
                {canUpdateStatus && currentIssue && (
                  <StatusUpdateButton
                    issueId={currentIssue.id}
                    currentStatus={currentIssue.status}
                  />
                )}
                
                {/* Zone Officer Verification Buttons */}
                {canVerify && currentIssue && currentIssue.status === 'RESOLVED' && (
                  <VerificationButton
                    issueId={currentIssue.id}
                    currentStatus={currentIssue.status}
                    hasAfterImages={hasAfterImages}
                    onStatusUpdate={handleStatusUpdate}
                  />
                )}
                
                {/* Zone Officer Reopen Button */}
                {canVerify && currentIssue && currentIssue.status === 'VERIFIED' && (
                  <ReopenButton
                    issueId={currentIssue.id}
                    onSuccess={handleStatusUpdate}
                  />
                )}
              </div>
              
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-60 p-4" onClick={() => {
          setSelectedImage(null);
          setImageLoading(false);
        }}>
          <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-700 shadow-lg rounded-full w-10 h-10 p-0"
                onClick={() => {
                  setSelectedImage(null);
                  setImageLoading(false);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {imageLoading ? (
              <div className="flex items-center justify-center w-96 h-96 bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <img
                src={selectedImage}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onLoad={() => setImageLoading(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}