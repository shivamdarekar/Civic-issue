"use client";

import { useEffect } from 'react';
import { syncService } from '@/lib/sync-service';

export default function SyncInitializer() {
  useEffect(() => {
    // Initialize sync service
    if (typeof window !== 'undefined') {
      // Import sync service to register event listeners
      import('@/lib/sync-service');
    }
  }, []);

  return null;
}