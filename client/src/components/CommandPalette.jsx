import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Globe2, 
  CloudSun, 
  Network, 
  Radar, 
  Sparkles, 
  Sliders, 
  Package, 
  Boxes, 
  Route, 
  Truck, 
  Users, 
  AlertOctagon, 
  Flame, 
  Mic, 
  FileText, 
  ArrowRightLeft,
  MapPin,
  WifiOff,
  Wifi,
  CornerDownLeft,
  X
} from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onNavigateTab, 
  onSelectStation, 
  stations = [], 
  toggleOfflineMode,
  isOffline 
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const modules = [
    { id: 'overview', title: 'Polar Digital Twin', category: 'Command & Twin', icon: Globe2, desc: 'Situational Map & Station Telemetry' },
    { id: 'weather', title: 'Weather Intelligence', category: 'Command & Twin', icon: CloudSun, desc: 'Wind, visibility & polar forecast' },
    { id: 'mission', title: 'Mission Intelligence', category: 'Command & Twin', icon: Network, desc: 'Readiness, replay & decision trace' },
    { id: 'geofence', title: 'Safety Geofences', category: 'Safety & Field', icon: Radar, desc: 'Restricted zones & field alarms' },
    { id: 'planner', title: 'AI Expedition Planner', category: 'AI & Decision Support', icon: Sparkles, desc: 'Caloric, Fuel & Buffers generator' },
    { id: 'whatif', title: 'What-If Simulator', category: 'AI & Decision Support', icon: Sliders, desc: 'Disruption & DoA impact modeling' },
    { id: 'cargo', title: 'Cargo & 3D Packing', category: 'Logistics & Fleet', icon: Package, desc: 'Smart container & QR distribution' },
    { id: 'inventory', title: 'Inventory & Rations', category: 'Logistics & Fleet', icon: Boxes, desc: 'Consumables & daily burn rate' },
    { id: 'shipments', title: 'Shipment Tracking', category: 'Logistics & Fleet', icon: Route, desc: 'Chain of custody & arrival ETA' },
    { id: 'assets', title: 'Assets & Fleet Health', category: 'Logistics & Fleet', icon: Truck, desc: 'PistenBully & genset telemetry' },
    { id: 'personnel', title: 'Personnel & Field Muster', category: 'Safety & Field', icon: Users, desc: 'Buddy system & check-in timers' },
    { id: 'emergency', title: 'Emergency Response', category: 'Safety & Field', icon: AlertOctagon, desc: 'Polar SOS & triage protocols' },
    { id: 'risk', title: 'Risk Intelligence', category: 'Safety & Field', icon: Flame, desc: 'Explainable multi-factor alerts' },
    { id: 'voice', title: 'Voice Assistant', category: 'Utilities', icon: Mic, desc: 'Speech command interface' },
    { id: 'reports', title: 'Automated Reports', category: 'Utilities', icon: FileText, desc: 'Station readiness & burn audit' },
    { id: 'sync', title: 'Offline Sync Center', category: 'Utilities', icon: ArrowRightLeft, desc: 'Conflict resolution & local cache' },
  ];

  const actions = [
    { 
      id: 'action-toggle-offline', 
      title: isOffline ? 'Switch to Iridium Online' : 'Switch to Polar Offline Field Mode', 
      category: 'System Action', 
      icon: isOffline ? Wifi : WifiOff, 
      action: () => toggleOfflineMode?.() 
    }
  ];

  const stationItems = stations.map(st => ({
    id: `station-${st.id}`,
    title: `Switch to ${st.name}`,
    category: 'Stations',
    icon: MapPin,
    stationId: st.id,
    desc: `${st.id === 'ST-HIMADRI' ? 'Arctic Ny-Ålesund' : 'Antarctica'} • Live Telemetry`
  }));

  const allItems = [
    ...modules.map(m => ({ ...m, type: 'module' })),
    ...stationItems.map(s => ({ ...s, type: 'station' })),
    ...actions.map(a => ({ ...a, type: 'action' }))
  ];

  const filteredItems = allItems.filter(item => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.desc && item.desc.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    if (!item) return;
    if (item.type === 'module') {
      onNavigateTab?.(item.id);
    } else if (item.type === 'station') {
      onSelectStation?.(item.stationId);
    } else if (item.type === 'action') {
      item.action?.();
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/25 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ring-1 ring-white/10"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, module (Cargo, Risk, Planner) or station..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching modules, stations, or actions found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected 
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-white shadow-[0_4px_16px_rgba(34,211,238,0.12)]' 
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.category && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.desc && (
                        <div className="text-[11px] text-slate-400 truncate">{item.desc}</div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-[11px] text-cyan-400 opacity-0 sm:opacity-100 font-mono">
                    <span>Jump</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-white/5 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-cyan-400">NexusPole Telemetry Hub</span>
        </div>
      </div>
    </div>
  );
}
