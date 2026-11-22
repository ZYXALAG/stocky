'use client';

import { useEffect, useState, useCallback } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { getPendingMovements } from '@/lib/storage-offline';

let networkListenerAttached = false;

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    const movements = await getPendingMovements();
    setPendingCount(movements.length);
  }, []);

  useEffect(() => {
    // Initial check
    setOnline(typeof navigator !== 'undefined' && navigator.onLine);
    refreshPending();

    // Listen for online/offline events
    const onOnline = () => {
      setOnline(true);
      refreshPending();
    };
    const onOffline = () => {
      setOnline(false);
      refreshPending();
    };

    if (typeof window !== 'undefined' && !networkListenerAttached) {
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
      networkListenerAttached = true;
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      }
    };
  }, [refreshPending]);

  if (online && pendingCount === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-2 px-4 py-2 text-sm text-white shadow-lg ${
        online ? 'bg-amber-500' : 'bg-red-500'
      }`}
    >
      <div className="flex items-center gap-2">
        {!online ? (
          <WifiOff className="h-4 w-4" />
        ) : (
          <Wifi className="h-4 w-4" />
        )}
        <span>
          {!online
            ? 'Hors ligne — opérations en attente'
            : 'Connexion rétablie'}
        </span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
            {pendingCount} en attente
          </span>
        )}
      </div>
      {!online && (
        <button
          onClick={refreshPending}
          className="flex items-center gap-1 rounded bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Réessayer
        </button>
      )}
    </div>
  );
}
