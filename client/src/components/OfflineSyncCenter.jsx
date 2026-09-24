import React, { useState } from 'react';
import { useOffline } from '../context/OfflineContext';
import { 
  ArrowRightLeft, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export default function OfflineSyncCenter() {
  const { 
    isOffline, 
    toggleOfflineMode, 
    offlineQueue, 
    triggerSync, 
    clearQueue, 
    isSyncing, 
    lastSyncResult 
  } = useOffline();

  const [syncStatus, setSyncStatus] = useState('');

  const handleSync = async () => {
    try {
      setSyncStatus('Initiating batch upload...');
      const res = await triggerSync();
      setSyncStatus(`Sync successful: ${res.appliedCount} operations committed.`);
      setTimeout(() => setSyncStatus(''), 5000);
    } catch (err) {
      setSyncStatus('Sync failed: Could not establish link to server.');
      setTimeout(() => setSyncStatus(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-polar-900 to-polar-900 border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              PRD 7.12 & 7.13 Offline Field App & Conflict Handler
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Offline Data Queue & Multi-Device Sync Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Field personnel operating in Antarctic blizzards outside VHF/satellite coverage can continue logging check-ins and inventory movements. Transactions queue locally and synchronize deterministically when connection is re-established.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleOfflineMode}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition font-mono ${
                isOffline 
                  ? 'bg-amber-500 text-polar-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              <span>{isOffline ? 'Simulating Field Offline' : 'Online Iridium Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Connection State */}
        <div className="frost-panel p-4 rounded-xl border-l-4 border-l-cyan-400">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Field Link State</span>
          <div className="text-lg font-bold text-white font-mono mt-1 flex items-center gap-2">
            {isOffline ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400">OFFLINE FIELD MODE</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300">SATELLITE CONNECTED</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            {isOffline ? 'Client device caching to LocalStorage' : 'Direct REST & WebSocket stream'}
          </span>
        </div>

        {/* Pending Queue Count */}
        <div className="frost-panel p-4 rounded-xl border-l-4 border-l-amber-400">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Pending Operations</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {offlineQueue.length} <span className="text-xs text-amber-300 font-normal">Transactions Queued</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            Deterministic UUID tracking enabled
          </span>
        </div>

        {/* Sync Controls */}
        <div className="frost-panel p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Sync Action</span>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSync}
              disabled={isSyncing || offlineQueue.length === 0}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold font-mono transition ${
                offlineQueue.length > 0 && !isSyncing
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-polar-950'
                  : 'bg-polar-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Commit Batch Sync'}</span>
            </button>
            {offlineQueue.length > 0 && (
              <button
                onClick={clearQueue}
                title="Clear local queue"
                className="p-2 rounded-xl bg-polar-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {syncStatus && (
            <span className="text-[10px] text-cyan-300 font-mono mt-1 block truncate">
              {syncStatus}
            </span>
          )}
        </div>

      </div>

      {/* Pending Offline Queue Items */}
      <div className="frost-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-polar-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            Queued Local Client Operations ({offlineQueue.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Storage Engine: Browser LocalStorage / IndexedDB Fallback
          </span>
        </div>

        {offlineQueue.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400/60" />
            <p className="text-sm font-medium text-white">Local Queue Synchronized</p>
            <p className="text-xs max-w-sm">
              All field transactions, check-ins, and observations have been reconciled with the polar server.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {offlineQueue.map((op) => (
              <div key={op.id} className="p-3 rounded-xl bg-polar-950/70 border border-polar-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-polar-900 text-cyan-300 font-mono text-[10px] border border-polar-700">
                      {op.type}
                    </span>
                    <span className="font-semibold text-white">
                      {op.item || op.personnelName || op.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    OP-ID: {op.id} • {op.reason || op.location || 'Logged in Field'}
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-400">
                  <span className="text-amber-300 font-bold block">Pending Upload</span>
                  <span>{new Date(op.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Server Sync Receipt & Conflict Report */}
      {lastSyncResult && (
        <div className="frost-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
          <div className="flex items-center justify-between border-b border-polar-800 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Server Reconciliation Receipt ({lastSyncResult.syncId})
            </div>
            <span className="text-xs font-mono text-slate-400">
              {new Date(lastSyncResult.serverTime).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-polar-950/80 p-2.5 rounded-lg border border-polar-800">
              <span className="text-slate-400 block text-[10px]">Operations Applied</span>
              <span className="font-bold text-emerald-300 text-sm">{lastSyncResult.appliedCount}</span>
            </div>
            <div className="bg-polar-950/80 p-2.5 rounded-lg border border-polar-800">
              <span className="text-slate-400 block text-[10px]">Conflicts Detected</span>
              <span className="font-bold text-cyan-300 text-sm">{lastSyncResult.conflictsCount}</span>
            </div>
            <div className="bg-polar-950/80 p-2.5 rounded-lg border border-polar-800">
              <span className="text-slate-400 block text-[10px]">Conflict Resolution</span>
              <span className="font-bold text-slate-200 text-sm">Deterministic Last-Write</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
