import React, { useState } from 'react';
import { 
  Globe2, 
  Flame, 
  Zap, 
  Droplet, 
  Clock, 
  MapPin, 
  Thermometer, 
  Wind, 
  Radio, 
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  BatteryCharging,
  CheckCircle2,
  CircleAlert,
  PackageCheck,
  Boxes,
  Truck,
  UsersRound,
  Layers,
  Crosshair,
  Sliders,
  Check,
  X,
  Maximize2,
  RefreshCw,
  Eye,
  Camera
} from 'lucide-react';

export default function SituationalOverview({ 
  stations = [], 
  selectedStation, 
  onSelectStation, 
  expeditions = [], 
  assets = [], 
  cargo = [], 
  inventory = [], 
  riskAlerts = [], 
  onNavigateTab 
}) {
  // View mode tab state to declutter the interface
  const [viewMode, setViewMode] = useState('tactical'); // 'tactical' | 'vitals' | 'logistics' | 'all'

  // Interactive Tactical Map Layer Toggles
  const [showStations, setShowStations] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [radarActive, setRadarActive] = useState(true);
  const [radarPingTime, setRadarPingTime] = useState(null);

  // Inspector Drawer for clicked entity
  const [inspectedEntity, setInspectedEntity] = useState(null);

  // Interactive Action Queue State (operator can complete tasks)
  const [actions, setActions] = useState([
    {
      id: 'act-1',
      title: 'Confirm next resupply flight manifest (IL-76)',
      category: 'Logistics',
      urgency: 'Medium',
      icon: PackageCheck,
      completed: false,
      timestamp: 'Scheduled 14:00Z'
    },
    {
      id: 'act-2',
      title: 'Review Field Team Alpha check-in (PB-300 Tiger 1)',
      category: 'Safety',
      urgency: 'High',
      icon: UsersRound,
      completed: false,
      timestamp: '18 min ago'
    },
    {
      id: 'act-3',
      title: 'Validate emergency muster roster & shelter heat',
      category: 'Command',
      urgency: 'Routine',
      icon: ShieldCheck,
      completed: false,
      timestamp: 'Daily cycle'
    }
  ]);

  // Interactive Autonomy Simulator State
  const [simCrewOffset, setSimCrewOffset] = useState(0);
  const [simTempDrop, setSimTempDrop] = useState(0);

  const currentStation = stations.find(s => s.id === selectedStation) || stations[0] || {};
  const weather = currentStation.weather || {};
  const lifeSupport = currentStation.lifeSupport || {};
  const stationExpeditions = expeditions.filter(expedition => expedition.stationId === selectedStation);
  const activeExpedition = stationExpeditions.find(e => e.status === 'Active') || expeditions[0] || {};
  const activeMissions = stationExpeditions.filter(expedition => expedition.status === 'Active').length;
  const openIncidents = currentStation.openIncidents ?? 1;

  // Simulator dynamic calculations
  const baseAutonomyDays = lifeSupport.daysOfAutonomy || 114;
  const simulatedCrew = (currentStation.currentCrew || 24) + simCrewOffset;
  const simulatedBurnMultiplier = 1 + (simCrewOffset * 0.03) + (simTempDrop * 0.015);
  const simulatedAutonomyDays = Math.max(12, Math.round(baseAutonomyDays / simulatedBurnMultiplier));
  const readiness = Math.min(100, Math.round((simulatedAutonomyDays / 180) * 100));

  const handleCompleteAction = (actionId) => {
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, completed: !a.completed } : a));
  };

  const handleRadarPing = () => {
    setRadarPingTime(new Date().toLocaleTimeString());
    setTimeout(() => setRadarPingTime(null), 3000);
  };

  const pendingActionCount = actions.filter(a => !a.completed).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Command Bar: Station Identity, Switcher & View Modes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] shrink-0 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentStation.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                {currentStation.id === 'ST-HIMADRI' ? 'Arctic Ny-Ålesund' : 'Antarctica'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Operational Digital Twin • AWS Telemetry Active
            </p>
          </div>
        </div>

        {/* View Mode Switcher Pills (Reduces Clutter!) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/5 text-xs font-medium">
          <button
            onClick={() => setViewMode('tactical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'tactical'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Tactical Twin</span>
          </button>

          <button
            onClick={() => setViewMode('vitals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'vitals'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Life Support & Vitals</span>
          </button>

          <button
            onClick={() => setViewMode('logistics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'logistics'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Logistics & Actions</span>
            {pendingActionCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {pendingActionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'all'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Show All Operational Modules"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Systems</span>
          </button>
        </div>

      </div>

      {/* Quick KPI Overview Chips (Compact & Informative) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="frost-panel p-3.5 rounded-xl border-l-2 border-l-cyan-400">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Active Missions</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
            {activeMissions || stationExpeditions.length || 2}
          </div>
          <div className="text-[11px] text-cyan-400 mt-0.5">Glacier Traverses</div>
        </div>

        <div className="frost-panel p-3.5 rounded-xl border-l-2 border-l-emerald-400">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Base Complement</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300 mt-0.5">
            {currentStation.currentCrew ?? 24}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scientists & Engineers</div>
        </div>

        <div className="frost-panel p-3.5 rounded-xl border-l-2 border-l-amber-400">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Life-Support Autonomy</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-0.5">
            {simulatedAutonomyDays} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Threshold: &gt;60d safe</div>
        </div>

        <div className="frost-panel p-3.5 rounded-xl border-l-2 border-l-blue-400">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Action Queue</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-0.5">
            {pendingActionCount} <span className="text-xs font-normal text-slate-400">Pending</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Decisions needing lead</div>
        </div>
      </div>

      {/* SECTION 1: TACTICAL TWIN & RADAR MAP */}
      {(viewMode === 'tactical' || viewMode === 'all') && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Polar Radar & Geospatial Tactical Map (2 Columns) */}
          <div className="lg:col-span-2 frost-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
            
            {/* Radar Header & Interactive Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">
                    Polar Operational Radar & Domain Map
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any station or vehicle pin to inspect telemetry & status
                </p>
              </div>

              {/* Map Interactive Toggles & Ping Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRadarPing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition"
                >
                  <Crosshair className="w-3.5 h-3.5 animate-spin" />
                  <span>Ping Sector</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-white/5 text-[10px] font-mono">
                  <button
                    onClick={() => setShowStations(!showStations)}
                    className={`px-2 py-0.5 rounded transition ${showStations ? 'bg-cyan-400/20 text-cyan-300' : 'text-slate-500'}`}
                  >
                    Bases
                  </button>
                  <button
                    onClick={() => setShowVehicles(!showVehicles)}
                    className={`px-2 py-0.5 rounded transition ${showVehicles ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'}`}
                  >
                    Traverse
                  </button>
                  <button
                    onClick={() => setRadarActive(!radarActive)}
                    className={`px-2 py-0.5 rounded transition ${radarActive ? 'bg-emerald-400/20 text-emerald-300' : 'text-slate-500'}`}
                  >
                    Sweep
                  </button>
                </div>
              </div>
            </div>

            {/* Radar Canvas Display Area */}
            <div className="relative w-full h-80 sm:h-96 rounded-xl bg-gradient-to-b from-[#050e1b] via-[#081527] to-[#040810] border border-cyan-500/20 overflow-hidden flex items-center justify-center p-4">
              
              {/* Polar Coordinates Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
              <div className="absolute w-[520px] h-[520px] rounded-full border border-cyan-500/10 pointer-events-none" />
              <div className="absolute w-[380px] h-[380px] rounded-full border border-cyan-500/15 pointer-events-none" />
              <div className="absolute w-[240px] h-[240px] rounded-full border border-cyan-500/20 pointer-events-none" />
              <div className="absolute w-[110px] h-[110px] rounded-full border border-cyan-400/30 pointer-events-none" />
              
              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-cyan-500/15" />
                <div className="h-full w-px bg-cyan-500/15" />
              </div>

              {/* Simulated Radar Sweep Line */}
              {radarActive && (
                <div className="absolute w-72 h-72 rounded-full border border-cyan-400/20 pointer-events-none animate-radar">
                  <div className="w-1/2 h-1/2 bg-gradient-to-tr from-cyan-400/25 to-transparent rounded-tl-full origin-bottom-right" />
                </div>
              )}

              {/* Ping Wave Effect */}
              {radarPingTime && (
                <div className="absolute w-40 h-40 rounded-full border-2 border-cyan-300 animate-ping-slow pointer-events-none" />
              )}

              {/* Station Map Pins */}
              {showStations && (
                <>
                  {/* Pin 1: Bharati Station (East Antarctica - Center Right) */}
                  <div 
                    onClick={() => {
                      onSelectStation('ST-BHARATI');
                      setInspectedEntity({
                        id: 'ST-BHARATI',
                        name: 'Bharati Station',
                        type: 'Permanent Research Base',
                        location: '69.40°S, 76.19°E (Larsemann Hills)',
                        crew: 24,
                        temp: '-28°C',
                        status: 'Nominal Operations',
                        power: '72% Load (Dual Genset)',
                        feed: 'Live AWS Telemetry'
                      });
                    }}
                    className={`absolute top-1/2 right-1/4 -translate-y-6 cursor-pointer group transition-all duration-200 ${
                      selectedStation === 'ST-BHARATI' ? 'scale-110 z-20' : 'z-10 opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute w-8 h-8 rounded-full bg-cyan-400/40" />
                        <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center shadow-lg shadow-cyan-500/50">
                          <div className="w-2 h-2 rounded-full bg-slate-950" />
                        </div>
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/95 border border-cyan-400/50 text-[11px] font-mono text-cyan-200 whitespace-nowrap shadow-lg">
                        📍 Bharati Base (69.4°S)
                      </div>
                      <span className="text-[9px] text-cyan-400 font-mono">24 Crew • -28°C</span>
                    </div>
                  </div>

                  {/* Pin 2: Maitri Station (Schirmacher Oasis - Center Left) */}
                  <div 
                    onClick={() => {
                      onSelectStation('ST-MAITRI');
                      setInspectedEntity({
                        id: 'ST-MAITRI',
                        name: 'Maitri Station',
                        type: 'Permanent Research Base',
                        location: '70.77°S, 11.73°E (Schirmacher Oasis)',
                        crew: 18,
                        temp: '-21°C',
                        status: 'Nominal Operations',
                        power: '65% Load (Standard Genset)',
                        feed: 'Live AWS Telemetry'
                      });
                    }}
                    className={`absolute top-1/2 left-1/4 -translate-y-8 cursor-pointer group transition-all duration-200 ${
                      selectedStation === 'ST-MAITRI' ? 'scale-110 z-20' : 'z-10 opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-indigo-400 border-2 border-white flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-slate-950" />
                        </div>
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/95 border border-indigo-400/50 text-[11px] font-mono text-indigo-200 whitespace-nowrap shadow-lg">
                        📍 Maitri Base (70.7°S)
                      </div>
                      <span className="text-[9px] text-indigo-300 font-mono">18 Crew • -21°C</span>
                    </div>
                  </div>

                  {/* Pin 3: Himadri Station (Arctic Ny-Ålesund - Top Right) */}
                  <div 
                    onClick={() => {
                      onSelectStation('ST-HIMADRI');
                      setInspectedEntity({
                        id: 'ST-HIMADRI',
                        name: 'Himadri Station',
                        type: 'Arctic Research Station',
                        location: '78.92°N, 11.93°E (Svalbard, Norway)',
                        crew: 8,
                        temp: '-14°C',
                        status: 'Summer Fjord Science',
                        power: 'Local Hydro/Diesel Grid',
                        feed: 'Live Met Stream'
                      });
                    }}
                    className={`absolute top-6 right-8 cursor-pointer group transition-all duration-200 ${
                      selectedStation === 'ST-HIMADRI' ? 'scale-110 z-20' : 'z-10 opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center shadow-lg" />
                      <div className="mt-1 px-2 py-0.5 rounded bg-slate-950/95 border border-emerald-400/50 text-[11px] font-mono text-emerald-200 whitespace-nowrap shadow-lg">
                        📍 Himadri Base (78.9°N Arctic)
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Field Traverse Vehicle Pin: PistenBully Team Alpha */}
              {showVehicles && (
                <div 
                  onClick={() => {
                    setInspectedEntity({
                      id: 'VEH-PB300',
                      name: 'PistenBully 300 (Tiger 1)',
                      type: 'Polar Snowcat Traverse',
                      location: 'En-route to Larsemann Ice-Core Site (69.45°S)',
                      crew: 4,
                      temp: '-32°C outside',
                      status: 'Traverse in Progress • 12 km/h',
                      power: 'Fuel Reserve 84% • Comms via Iridium',
                      feed: 'Telemetric Ping Nominal'
                    });
                  }}
                  className="absolute top-[62%] right-[18%] z-15 flex flex-col items-center cursor-pointer group transition-transform hover:scale-110"
                >
                  <div className="w-3.5 h-3.5 rounded bg-amber-400 border border-white rotate-45 shadow-lg shadow-amber-500/50 flex items-center justify-center animate-bounce">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  </div>
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-950/95 border border-amber-500/60 text-[9px] font-mono text-amber-200 whitespace-nowrap">
                    🚜 Field Team Alpha (PB-300)
                  </div>
                </div>
              )}

              {/* Fast Ice Edge / Supply Traverse Corridors */}
              {showRoutes && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 120 220 Q 300 240 520 180"
                    fill="none"
                    stroke="rgba(34, 211, 238, 0.35)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                </svg>
              )}

              {/* Radar Status Overlay Notice */}
              {radarPingTime && (
                <div className="absolute top-3 left-3 bg-cyan-950/90 border border-cyan-400/50 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-200 animate-fade-in">
                  RADAR SCAN COMPLETE @ {radarPingTime} • 3 BASES ONLINE
                </div>
              )}

              {/* Map Legend Overlay */}
              <div className="absolute bottom-2 left-2 bg-slate-950/90 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-400 font-mono space-y-0.5 hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Base Station</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded bg-amber-400 rotate-45" />
                  <span>Glacier Traverse</span>
                </div>
              </div>

            </div>

            {/* Environmental Summary Bar Below Map */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/5 text-xs">
              <div className="text-slate-400">
                <span className="block text-[10px] font-mono uppercase">Wind Velocity</span>
                <span className="text-white font-mono font-medium">{weather.windSpeedKnots || 38} kts ({weather.windDirection || 'SSE'})</span>
              </div>
              <div className="text-slate-400">
                <span className="block text-[10px] font-mono uppercase">Visibility</span>
                <span className="text-cyan-300 font-mono font-medium">{weather.visibilityKm || 2.5} km</span>
              </div>
              <div className="text-slate-400">
                <span className="block text-[10px] font-mono uppercase">Pressure</span>
                <span className="text-white font-mono font-medium">{weather.pressureHpa || 978} hPa</span>
              </div>
              <div className="text-slate-400">
                <span className="block text-[10px] font-mono uppercase">Telemetry Source</span>
                <span className="text-emerald-400 font-mono text-[10px] truncate block">{weather.dataSource || 'NCPOR AWS Link'}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Entity Inspector OR Active Expedition */}
          <div className="frost-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            {inspectedEntity ? (
              // Interactive Quick Inspector Drawer
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono uppercase text-cyan-300 font-bold">
                      Telemetry Inspector
                    </span>
                  </div>
                  <button 
                    onClick={() => setInspectedEntity(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{inspectedEntity.name}</h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{inspectedEntity.type}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Coordinates / Sector</span>
                    <span className="text-slate-200 font-mono">{inspectedEntity.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Crew Personnel</span>
                      <span className="text-white font-mono font-bold">{inspectedEntity.crew} Members</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Ambient Temp</span>
                      <span className="text-cyan-300 font-mono font-bold">{inspectedEntity.temp}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Power & Grid State</span>
                    <span className="text-emerald-300 font-mono">{inspectedEntity.power}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-300">
                  <Camera className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>{inspectedEntity.feed}</span>
                </div>

                {inspectedEntity.id.startsWith('ST-') && inspectedEntity.id !== selectedStation && (
                  <button
                    onClick={() => onSelectStation(inspectedEntity.id)}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
                  >
                    Switch Command Focus to this Station
                  </button>
                )}
              </div>
            ) : (
              // Active Mission Briefing
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
                    Active Polar Expedition
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    {activeExpedition?.status || 'Active'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {activeExpedition?.name || '44th Indian Antarctic Expedition'}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {activeExpedition?.objective || 'Deep ice-core cryosphere drilling, meteorological monitoring, and autonomous drone traverse mapping.'}
                </p>

                {/* Expedition Stats */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Duration</span>
                    <span className="font-bold text-white font-mono">{activeExpedition?.durationDays || 151} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Personnel</span>
                    <span className="font-bold text-cyan-300 font-mono">{activeExpedition?.personnelCount || 24} Scientists</span>
                  </div>
                  <div className="col-span-2 mt-1 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Commander</span>
                    <span className="font-medium text-slate-200">{activeExpedition?.leadCommander || 'Dr. Rajesh Sharma'}</span>
                  </div>
                </div>

                {/* Readiness Tasks */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Readiness Checkpoints</span>
                    <span className="text-cyan-400 font-mono text-xs">Nominal</span>
                  </div>
                  <div className="space-y-1.5">
                    {(activeExpedition?.readinessChecklist || [
                      { task: 'Emergency shelter heat generators verified', completed: true },
                      { task: 'Iridium satellite telemetry sync ok', completed: true },
                      { task: 'Medical kit & freeze-dried rations inspected', completed: true }
                    ]).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <ShieldCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="line-clamp-1">{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab?.('mission')}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-cyan-300 hover:text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Mission Intelligence</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </section>
      )}

      {/* SECTION 2: LIFE SUPPORT & STATION VITALS + INTERACTIVE SIMULATOR */}
      {(viewMode === 'vitals' || viewMode === 'all') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-mono">Life Support Grid</p>
              <h2 className="text-lg font-bold text-white">Habitat Telemetry & Autonomy Reserves</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">LIVE CRITICAL METRICS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Days of Autonomy */}
            <div className="frost-panel p-4 rounded-xl border-l-4 border-l-cyan-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1.5">
                <span>AUTONOMY RESERVE</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {simulatedAutonomyDays}
                </span>
                <span className="text-xs text-cyan-300 font-medium">Days remaining</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (simulatedAutonomyDays / 180) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                <span>Safe threshold: &gt;60d</span>
                <span>Next resupply: ~45d</span>
              </div>
            </div>

            {/* Habitat Temperature */}
            <div className="frost-panel p-4 rounded-xl border-l-4 border-l-emerald-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1.5">
                <span>HABITAT TEMPERATURE</span>
                <Thermometer className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-300 font-mono">
                  +{lifeSupport.indoorTempC ?? 19.5}°C
                </span>
                <span className="text-xs text-slate-400">Central Module</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 font-mono">
                <span>Outside:</span>
                <span className="text-cyan-300 font-bold">{weather.temperature ?? -28}°C</span>
                <span className="text-slate-500">| Δ {Math.round((lifeSupport.indoorTempC || 20) - (weather.temperature || -28))}°C</span>
              </div>
            </div>

            {/* Station Power Grid */}
            <div className="frost-panel p-4 rounded-xl border-l-4 border-l-amber-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1.5">
                <span>POWER GENERATION</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base font-bold text-white font-mono truncate">
                {lifeSupport.mainPower || "72% Load (Dual Genset)"}
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-300 mt-3 font-mono">
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>Gen-A/B Hot Standby OK</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Burn: 28.3 L/hr • 415V 50Hz Stable
              </div>
            </div>

            {/* Fuel Farm Reserve */}
            <div className="frost-panel p-4 rounded-xl border-l-4 border-l-blue-400">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-1.5">
                <span>POLAR ARCTIC DIESEL</span>
                <Droplet className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {(lifeSupport.fuelReserveLiters || 142000).toLocaleString()}
                </span>
                <span className="text-xs text-blue-300">Liters</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-blue-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((lifeSupport.fuelReserveLiters || 142000) / (lifeSupport.fuelCapacityLiters || 220000)) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 font-mono flex justify-between">
                <span>Cap: {(lifeSupport.fuelCapacityLiters || 220000).toLocaleString()} L</span>
                <span>{Math.round(((lifeSupport.fuelReserveLiters || 142000) / (lifeSupport.fuelCapacityLiters || 220000)) * 100)}%</span>
              </div>
            </div>

          </div>

          {/* Interactive Autonomy & Burn Rate Playground Slider */}
          <div className="frost-panel rounded-2xl p-4 sm:p-5 border border-cyan-500/20 bg-slate-900/60">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Interactive Autonomy & Stress Simulator
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate emergency crew surge or extreme blizzard cold snaps to test reserve depletion in real-time
                </p>
              </div>

              {(simCrewOffset !== 0 || simTempDrop !== 0) && (
                <button
                  onClick={() => {
                    setSimCrewOffset(0);
                    setSimTempDrop(0);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                >
                  Reset to Baseline
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Slider 1: Crew complement change */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Crew Surge / Evacuation Adjustment</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {simCrewOffset >= 0 ? `+${simCrewOffset}` : simCrewOffset} ({simulatedCrew} total)
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="20"
                  value={simCrewOffset}
                  onChange={(e) => setSimCrewOffset(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>-10 Evacuated</span>
                  <span>Baseline (24)</span>
                  <span>+20 Resupply / Emergency</span>
                </div>
              </div>

              {/* Slider 2: Extreme temperature drop */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Polar Vortex Temperature Drop</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    -{simTempDrop}°C ({((weather.temperature ?? -28) - simTempDrop)}°C outside)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={simTempDrop}
                  onChange={(e) => setSimTempDrop(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Nominal (-28°C)</span>
                  <span>-12°C Severe Chill</span>
                  <span>-25°C Polar Vortex (-53°C)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Simulated Fuel Burn Multiplier: <span className="text-cyan-300 font-bold">{simulatedBurnMultiplier.toFixed(2)}x</span>
              </span>
              <span className="text-slate-400">
                Projected Safe Autonomy: <span className={`font-bold ${simulatedAutonomyDays < 60 ? 'text-red-400' : 'text-emerald-300'}`}>{simulatedAutonomyDays} Days</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: LOGISTICS & ACTION CENTER */}
      {(viewMode === 'logistics' || viewMode === 'all') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-mono">Operations Control</p>
              <h2 className="text-lg font-bold text-white">Integrated Logistics & Decision Queue</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">STATION SUMMARY</span>
          </div>

          {/* 5 Modular Logistics Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {[
              { 
                id: 'cargo', 
                label: 'Cargo Management', 
                value: cargo.length || 14, 
                detail: `${cargo.filter(item => item.status === 'At Station').length || 9} received`, 
                icon: PackageCheck, 
                color: 'text-cyan-300' 
              },
              { 
                id: 'inventory', 
                label: 'Inventory & Rations', 
                value: inventory.length || 28, 
                detail: `${inventory.filter(item => item.daysRemaining < 30).length || 2} low stock`, 
                icon: Boxes, 
                color: 'text-amber-300' 
              },
              { 
                id: 'shipments', 
                label: 'Shipment Tracking', 
                value: cargo.filter(item => item.status === 'In Transit').length || 4, 
                detail: 'in transit now', 
                icon: Truck, 
                color: 'text-sky-300' 
              },
              { 
                id: 'personnel', 
                label: 'Personnel Muster', 
                value: currentStation.currentCrew ?? 24, 
                detail: `${activeMissions || 1} field mission`, 
                icon: UsersRound, 
                color: 'text-emerald-300' 
              },
              { 
                id: 'risk', 
                label: 'Intelligent Alerts', 
                value: riskAlerts.length || 3, 
                detail: 'active review', 
                icon: AlertTriangle, 
                color: 'text-red-300' 
              }
            ].map(({ id, label, value, detail, icon: Icon, color }) => (
              <button 
                key={id} 
                onClick={() => onNavigateTab?.(id)} 
                className="frost-panel-interactive rounded-xl p-3.5 text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className={`text-2xl font-mono font-bold mt-1.5 ${color}`}>{value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{detail}</div>
                <div className="text-[10px] text-cyan-400 mt-2 font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open module</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Action Queue */}
          <div className="frost-panel rounded-2xl p-4 sm:p-5 border border-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300 font-mono">Action Queue</p>
                <h3 className="text-base font-bold text-white">Decisions & Checklist Requiring Lead Action</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {pendingActionCount} Pending
              </span>
            </div>

            <div className="space-y-2">
              {actions.map(act => {
                const Icon = act.icon;
                return (
                  <div 
                    key={act.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                      act.completed
                        ? 'bg-slate-950/40 border-white/5 opacity-60'
                        : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        act.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-cyan-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs sm:text-sm font-medium ${act.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {act.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{act.category}</span>
                          <span>•</span>
                          <span>{act.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCompleteAction(act.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 self-end sm:self-center ${
                        act.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      {act.completed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </>
                      ) : (
                        <span>Acknowledge & Sign</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
