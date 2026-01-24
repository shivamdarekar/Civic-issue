import { offlineDB, OfflineIssue } from './offline-db';
import { toast } from 'sonner';

// Get API base URL from environment or default to correct backend port
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class SyncService {
  private isRunning = false;
  private maxRetries = 3;

  async syncPendingIssues() {
    if (this.isRunning || !navigator.onLine) return;
    
    this.isRunning = true;
    
    try {
      const pendingIssues = await offlineDB.issues
        .where('syncStatus')
        .anyOf(['pending', 'failed'])
        .and(issue => issue.retryCount < this.maxRetries)
        .toArray();

      if (pendingIssues.length === 0) {
        this.isRunning = false;
        return;
      }

      console.log(`Syncing ${pendingIssues.length} offline issues...`);
      
      let successCount = 0;
      for (const issue of pendingIssues) {
        const success = await this.syncSingleIssue(issue);
        if (success) successCount++;
      }

      if (successCount > 0) {
        toast.success(`Synced ${successCount} offline issues!`);
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async syncSingleIssue(issue: OfflineIssue): Promise<boolean> {
    try {
      // Update status to syncing
      await offlineDB.issues.update(issue.id!, { syncStatus: 'syncing' });

      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found. Please login again.');
      }

      // Validate required fields before attempting sync
      // Handle both old format (category) and new format (categoryId)
      const categoryId = issue.categoryId || (issue as { category?: string }).category;
      if (!categoryId || typeof categoryId !== 'string' || categoryId.trim() === '') {
        throw new Error('categoryId is required but was not provided');
      }

      // Step 1: Upload images first if there are any
      let uploadedMedia: Array<{ url: string; mimeType: string; fileSize: number }> = [];
      
      if (issue.images && issue.images.length > 0) {
        console.log(`Uploading ${issue.images.length} images...`);
        uploadedMedia = await this.uploadImages(issue.images, token);
        console.log('Images uploaded:', uploadedMedia);
      }

      // Step 2: Create the issue with JSON body (NOT FormData)
      // Ensure latitude and longitude are numbers (not strings)
      const latitude = typeof issue.location.latitude === 'string' 
        ? parseFloat(issue.location.latitude) 
        : issue.location.latitude;
      const longitude = typeof issue.location.longitude === 'string' 
        ? parseFloat(issue.location.longitude) 
        : issue.location.longitude;

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Invalid location coordinates');
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      // Build payload matching backend schema exactly
      const issuePayload: {
        categoryId: string;
        latitude: number;
        longitude: number;
        description?: string;
        priority?: string;
        address?: string;
        media?: Array<{ type: 'BEFORE' | 'AFTER'; url: string; mimeType?: string; fileSize?: number }>;
      } = {
        categoryId: categoryId,
        latitude,
        longitude,
      };

      // Only add optional fields if they have valid values
      if (issue.description && issue.description.trim().length > 0) {
        issuePayload.description = issue.description.trim();
      }

      if (issue.priority) {
        issuePayload.priority = issue.priority;
      }

      if (issue.location.address && issue.location.address.trim().length > 0) {
        issuePayload.address = issue.location.address.trim();
      }

      // Add media with required 'type' field
      if (uploadedMedia.length > 0) {
        issuePayload.media = uploadedMedia.map(m => ({
          type: 'BEFORE' as const,
          url: m.url,
          mimeType: m.mimeType,
          fileSize: m.fileSize,
        }));
      }

      console.log('Creating issue with payload:', JSON.stringify(issuePayload, null, 2));

      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        body: JSON.stringify(issuePayload),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Issue created successfully:', result);
        
        // Mark as synced
        await offlineDB.issues.update(issue.id!, { 
          syncStatus: 'synced',
          lastError: undefined 
        });
        
        // Delete synced issues after 24 hours
        setTimeout(() => {
          offlineDB.issues.delete(issue.id!);
        }, 24 * 60 * 60 * 1000);
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        // Parse validation errors from backend
        let errorMessage = errorData.message || `HTTP ${response.status}`;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((e: { field?: string; message?: string }) => 
            `${e.field || 'unknown'}: ${e.message || 'invalid'}`
          ).join(', ');
        }
        console.error('Backend validation error:', errorData);
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to sync issue ${issue.tempId}:`, errorMessage);
      
      // Update retry count and status
      const newRetryCount = issue.retryCount + 1;
      await offlineDB.issues.update(issue.id!, {
        syncStatus: newRetryCount >= this.maxRetries ? 'failed' : 'pending',
        retryCount: newRetryCount,
        lastError: errorMessage
      });
      
      return false;
    }
  }

  /**
   * Upload images to the server and return the uploaded media info
   */
  private async uploadImages(
    base64Images: string[], 
    token: string
  ): Promise<Array<{ url: string; mimeType: string; fileSize: number }>> {
    const formData = new FormData();
    
    // Convert base64 images to blobs and add to FormData
    for (let i = 0; i < base64Images.length; i++) {
      const blob = this.base64ToBlob(base64Images[i]);
      const extension = blob.type.split('/')[1] || 'jpg';
      formData.append('images', blob, `offline_image_${i}.${extension}`);
    }

    const response = await fetch(`${API_BASE_URL}/issues/upload/before`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - browser will set it with boundary
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Image upload failed' }));
      throw new Error(errorData.message || `Image upload failed: HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload response:', result);
    
    // Backend returns { data: [...], message: '...' }
    // where data is an array of { url, publicId, mimeType, fileSize }
    const files = result.data || [];
    
    if (!Array.isArray(files)) {
      console.error('Unexpected upload response format:', result);
      throw new Error('Invalid upload response format');
    }
    
    return files.map((file: { url: string; mimeType?: string; fileSize?: number }) => ({
      url: file.url,
      mimeType: file.mimeType || 'image/jpeg',
      fileSize: file.fileSize || 0
    }));
  }

  private base64ToBlob(base64: string): Blob {
    // Handle both data URL and raw base64
    let contentType = 'image/jpeg';
    let base64Data = base64;
    
    if (base64.includes(',')) {
      const parts = base64.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        contentType = match[1];
      }
      base64Data = parts[1];
    }
    
    const raw = window.atob(base64Data);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }

  async getPendingCount(): Promise<number> {
    return await offlineDB.issues
      .where('syncStatus')
      .anyOf(['pending', 'failed'])
      .count();
  }

  async getFailedIssues(): Promise<OfflineIssue[]> {
    return await offlineDB.issues
      .where('syncStatus')
      .equals('failed')
      .toArray();
  }

  async retryFailedIssues() {
    const failedIssues = await this.getFailedIssues();
    
    for (const issue of failedIssues) {
      await offlineDB.issues.update(issue.id!, {
        syncStatus: 'pending',
        retryCount: 0,
        lastError: undefined
      });
    }
    
    await this.syncPendingIssues();
  }

  /**
   * Clear all failed issues from the offline database
   */
  async clearFailedIssues() {
    await offlineDB.issues
      .where('syncStatus')
      .equals('failed')
      .delete();
  }

  /**
   * Clear ALL offline issues (use for debugging/reset)
   */
  async clearAllIssues() {
    await offlineDB.issues.clear();
    console.log('All offline issues cleared');
  }

  /**
   * Get all issues with their sync status for debugging
   */
  async getAllIssues(): Promise<OfflineIssue[]> {
    return await offlineDB.issues.toArray();
  }

  /**
   * Debug: Log all offline issues to console
   */
  async debugIssues() {
    const issues = await this.getAllIssues();
    console.log('=== OFFLINE ISSUES DEBUG ===');
    console.log(`Total issues: ${issues.length}`);
    issues.forEach((issue, index) => {
      console.log(`\n--- Issue ${index + 1} ---`);
      console.log(`ID: ${issue.id}`);
      console.log(`TempID: ${issue.tempId}`);
      console.log(`CategoryID: ${issue.categoryId}`);
      console.log(`Category (legacy): ${(issue as { category?: string }).category}`);
      console.log(`Status: ${issue.syncStatus}`);
      console.log(`Retry Count: ${issue.retryCount}`);
      console.log(`Last Error: ${issue.lastError || 'none'}`);
      console.log(`Location: ${issue.location?.latitude}, ${issue.location?.longitude}`);
      console.log(`Images: ${issue.images?.length || 0}`);
    });
    console.log('=== END DEBUG ===');
    return issues;
  }
}

export const syncService = new SyncService();

// Auto-sync when coming back online (only in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network online - starting sync...');
    setTimeout(() => syncService.syncPendingIssues(), 1000);
  });

  // Periodic sync check (every 5 minutes when online)
  setInterval(() => {
    if (navigator.onLine) {
      syncService.syncPendingIssues();
    }
  }, 5 * 60 * 1000);
}