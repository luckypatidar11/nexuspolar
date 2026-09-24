import React, { createContext, useContext, useState, useEffect } from 'react';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(() => {
    return localStorage.getItem('nexuspole_offline_mode') === 'true';
  });

  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem('nexuspole_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexuspole_offline_mode', isOffline);
  }, [isOffline]);

  useEffect(() => {
    localStorage.setItem('nexuspole_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const toggleOfflineMode = () => {
    setIsOffline(prev => !prev);
  };

  const enqueueOperation = (operation) => {
    const op = {
      id: `OP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...operation
    };
    setOfflineQueue(prev => [op, ...prev]);
    return op;
  };

  const triggerSync = async () => {
    if (offlineQueue.length === 0) {
      return { message: "No pending operations to synchronize." };
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientDeviceId: 'POLAR-MOBILE-TABLET-04',
          timestamp: new Date().toISOString(),
          operations: offlineQueue
        })
      });

      if (!response.ok) throw new Error("Sync failed on server");
      
      const receipt = await response.json();
      setLastSyncResult(receipt);
      // Clear queue once synced
      setOfflineQueue([]);
      setIsSyncing(false);
      return receipt;
    } catch (err) {
      setIsSyncing(false);
      throw err;
    }
  };

  const clearQueue = () => {
    setOfflineQueue([]);
    localStorage.removeItem('nexuspole_offline_queue');
  };

  return (
    <OfflineContext.Provider
      value={{
        isOffline,
        toggleOfflineMode,
        offlineQueue,
        enqueueOperation,
        triggerSync,
        clearQueue,
        isSyncing,
        lastSyncResult
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
