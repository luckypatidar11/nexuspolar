import React, { useState } from 'react';
import { 
  Globe2, 
  Sparkles, 
  Sliders, 
  Package, 
  Route,
  Boxes, 
  Truck, 
  Users, 
  Flame, 
  AlertOctagon, 
  Mic, 
  FileText, 
  ArrowRightLeft,
  CloudSun,
  Network,
  Radar,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  canAccess, 
  alertCount = 3, 
  incidentCount = 1, 
  pendingSyncCount = 0 
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const categories = [
    {
      name: 'Command & Twin',
      items: [
        {
          id: 'overview',
          label: 'Digital Twin',
          fullName: 'Polar Digital Twin',
          icon: Globe2,
          badge: null
        },
        {
          id: 'mission',
          label: 'Missions',
          fullName: 'Mission Intelligence',
          icon: Network,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
        {
          id: 'weather',
          label: 'Weather',
          fullName: 'Weather Intelligence',
          icon: CloudSun,
          badge: null
        },
        {
          id: 'planner',
          label: 'AI Planner',
          fullName: 'AI Expedition Planner',
          icon: Sparkles,
          badge: 'AI',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        },
        {
          id: 'whatif',
          label: 'Simulator',
          fullName: 'What-If Simulator',
          icon: Sliders,
          badge: null
        }
      ]
    },
    {
      name: 'Logistics & Fleet',
      items: [
        {
          id: 'cargo',
          label: 'Cargo & 3D',
          fullName: 'Cargo Smart Packing',
          icon: Package,
          badge: null
        },
        {
          id: 'inventory',
          label: 'Inventory',
          fullName: 'Inventory & Rations',
          icon: Boxes,
          badge: null
        },
        {
          id: 'shipments',
          label: 'Shipments',
          fullName: 'Shipment Tracking',
          icon: Route,
          badge: null
        },
        {
          id: 'assets',
          label: 'Fleet & Assets',
          fullName: 'Asset Predictive Telemetry',
          icon: Truck,
          badge: '1 Alert',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        },
        {
          id: 'geofence',
          label: 'Geofences',
          fullName: 'Safety Geofenced Zones',
          icon: Radar,
          badge: null
        },
        {
          id: 'personnel',
          label: 'Personnel',
          fullName: 'Field Personnel & Muster',
          icon: Users,
          badge: null
        }
      ]
    },
    {
      name: 'Safety & Tools',
      items: [
        {
          id: 'emergency',
          label: 'Emergency',
          fullName: 'Emergency Orchestrator',
          icon: AlertOctagon,
          badge: incidentCount > 0 ? `${incidentCount}` : null,
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40'
        },
        {
          id: 'risk',
          label: 'Risk Engine',
          fullName: 'Risk Intelligence Engine',
          icon: Flame,
          badge: alertCount > 0 ? `${alertCount}` : null,
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
        },
        {
          id: 'reports',
          label: 'Reports',
          fullName: 'Automated Reports',
          icon: FileText,
          badge: null
        },
        {
          id: 'voice',
          label: 'Voice Assist',
          fullName: 'Polar Voice Assistant',
          icon: Mic,
          badge: null
        },
        {
          id: 'sync',
          label: 'Offline Sync',
          fullName: 'Offline Sync Center',
          icon: ArrowRightLeft,
          badge: pendingSyncCount > 0 ? `${pendingSyncCount} Q` : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        }
      ]
    }
  ];

  return (
    <aside 
      className={`transition-all duration-300 ease-in-out bg-slate-950/80 border border-white/5 rounded-2xl shadow-[0_15px_40px_rgba(2,6,23,0.5)] flex flex-col shrink-0 overflow-hidden backdrop-blur-xl ${
        isCollapsed ? 'w-16' : 'w-56 lg:w-60'
      }`}
    >
      {/* Header & Collapse Toggle */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400 font-semibold">
              Operations
            </span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {categories.map((cat, catIdx) => {
          const visibleItems = cat.items.filter(item => !canAccess || canAccess(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={cat.name} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {cat.name}
                </div>
              )}

              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={isCollapsed ? item.fullName : undefined}
                    className={`group w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-all duration-150 relative ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 shadow-[0_4px_16px_rgba(34,211,238,0.12)] font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive 
                        ? 'bg-cyan-400 text-slate-950 font-bold' 
                        : 'bg-slate-900/80 text-slate-400 group-hover:text-cyan-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="text-xs truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            item.badgeColor || 'bg-slate-800 text-slate-300 border-white/5'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-white/5 bg-slate-950/60">
        {!isCollapsed ? (
          <div className="px-2 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Iridium Link
            </span>
            <span className="font-mono text-cyan-400">99.8%</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Link nominal">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        )}
      </div>
    </aside>
  );
}
