"use client";

import { useEffect, useState } from 'react';
import { offlineStorage } from './offline-storage';

export function useOfflineInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeOfflineStorage = async () => {
      try {
        await offlineStorage.initializeWards();
        await offlineStorage.initializeEmployees();
        setIsInitialized(true);
      } catch (err) {
        console.error('Offline storage initialization failed:', err);
        setError('Failed to initialize offline storage');
      }
    };

    initializeOfflineStorage();
  }, []);

  return { isInitialized, error };
}
