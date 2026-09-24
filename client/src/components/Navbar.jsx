import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { 
  Compass, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Thermometer, 
  Wind, 
  ChevronDown, 
  CheckCircle2,
  AlertTriangle,
  Radio,
  User,
  Eye,
  Gauge,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  selectedStation, 
  onSelectStation, 
  stations = [], 
  onOpenCommandPalette 
}) {
  const { currentUser, availableRoles, switchRole, signOut } = useAuth();
  const { isOffline, toggleOfflineMode, offlineQueue, triggerSync, isSyncing } = useOffline();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [weatherPopoverOpen, setWeatherPopoverOpen] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const currentStationData = stations.find(s => s.id === selectedStation) || stations[0] || {};
  const weather = currentStationData.weather || {};

  const handleManualSync = async () => {
    try {
      const res = await triggerSync();
      setSyncStatusMsg(`Synced ${res.appliedCount || 0} ops!`);
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } catch {
      setSyncStatusMsg('Sync Failed');
      setTimeout(() => setSyncStatusMsg(''), 4000);
    }
  };

  const isBlizzard = weather.condition && weather.condition.toLowerCase().includes('blizzard');

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,6,23,0.4)] px-3 sm:px-6 py-2.5">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Emblem & Station Selector */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_20px_rgba(34,211,238,0.35)] ring-1 ring-white/20">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-[spin_16s_linear_infinite]" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-cyan-300"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-200 via-sky-100 to-white bg-clip-text text-transparent">
                  NexusPole
                </span>
                <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
                  MoES / NCPOR
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block shrink-0" />

          {/* Station Switcher with Coordinates Pill */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 border border-white/10 rounded-xl p-1 shadow-inner">
            <span className="text-[10px] text-slate-400 font-mono uppercase pl-2 hidden md:inline">Base:</span>
            <select
              value={selectedStation}
              onChange={(e) => onSelectStation(e.target.value)}
              className="bg-transparent text-cyan-300 font-semibold text-xs sm:text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 cursor-pointer"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id} className="bg-slate-950 text-slate-100">
                  {st.name} ({st.id === 'ST-HIMADRI' ? 'Arctic' : 'Antarctic'})
                </option>
              ))}
            </select>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mr-1.5 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
        </div>

        {/* Right: Weather Widget, Offline Toggle, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Search Button (Mobile only) */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-white/5 text-slate-400 hover:text-cyan-300"
            title="Open Command Palette"
          >
          
          </button>

          {/* Interactive Weather Status Pill */}
          <div className="relative">
            <button
              onClick={() => setWeatherPopoverOpen(!weatherPopoverOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isBlizzard
                  ? 'bg-red-500/10 border-red-500/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-slate-900/80 border-white/5 text-slate-300 hover:border-cyan-500/30 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-cyan-300 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                <span>{weather.temperature ?? -28}°C</span>
              </div>
              <div className="hidden lg:flex items-center gap-1 text-slate-400">
                <Wind className="w-3 h-3 text-sky-400" />
                <span>{weather.windSpeedKnots ?? 35}kt</span>
              </div>
              {isBlizzard ? (
                <span className="flex items-center gap-1 text-[10px] text-red-400 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Blizzard
                </span>
              ) : (
                <Radio className="w-3 h-3 text-emerald-400 hidden xl:block" />
              )}
            </button>

            {/* Weather Detail Popover */}
            {weatherPopoverOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-950/95 border border-cyan-500/30 rounded-2xl shadow-2xl p-3.5 z-50 backdrop-blur-2xl ring-1 ring-white/10"
                onMouseLeave={() => setWeatherPopoverOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{currentStationData.name} Met Feed</span>
                      {isBlizzard && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />}
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400">Source: {weather.dataSource || 'NCPOR AWS'}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono block">Windchill</span>
                    <span className="font-bold text-cyan-300 text-sm">{weather.feelsLike ?? -41}°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono block">Wind Velocity</span>
                    <span className="font-bold text-white text-sm">{weather.windSpeedKnots ?? 35} kts</span>
                    <span className="text-[9px] text-slate-500 block">Dir: {weather.windDirection ?? 'SSE'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono block">Visibility</span>
                    <span className="font-bold text-white text-sm">{weather.visibilityKm ?? 2.5} km</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono block">Pressure</span>
                    <span className="font-bold text-white text-sm">{weather.pressureHpa ?? 978} hPa</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Condition:</span>
                  <span className="text-white font-medium">{weather.condition || 'Severe Cold / Low Drift'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Polar Field Offline / Iridium Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={toggleOfflineMode}
              title="Simulate complete connectivity loss (Antarctica Field Mode)"
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
                isOffline 
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                  : 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Iridium Online</span>
                </>
              )}
            </button>

            {offlineQueue.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold">
                {offlineQueue.length}
              </span>
            )}

            {!isOffline && offlineQueue.length > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Sync offline queue now"
                className="p-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {syncStatusMsg && (
              <span className="text-[10px] text-cyan-300 font-mono px-1">
                {syncStatusMsg}
              </span>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/90 border border-white/5 rounded-xl px-2 py-1.5 transition text-left shadow-sm hover:border-cyan-500/30"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/20">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="hidden xl:block leading-tight pr-1">
                <div className="text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-cyan-300 font-mono truncate max-w-[120px]">
                  {currentUser?.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 backdrop-blur-xl ring-1 ring-white/10"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-2.5 py-2 border-b border-slate-800 mb-2">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">
                    Operational Perspective
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Switch roles to test permission boundaries & workflows
                  </p>
                </div>

                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {availableRoles.map(r => (
                    <button
                      key={r.id || r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-xl text-xs transition ${
                        currentUser?.role === r.role 
                          ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/30' 
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-100">{r.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.role}</div>
                      </div>
                      {currentUser?.role === r.role && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-red-300 hover:bg-red-500/10 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out of polar station
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
