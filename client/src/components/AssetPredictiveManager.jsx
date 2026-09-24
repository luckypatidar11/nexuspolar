import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Wrench, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  Zap, 
  Thermometer, 
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function AssetPredictiveManager() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [serviceModal, setServiceModal] = useState(null);
  const [serviceNotes, setServiceNotes] = useState('');
  const [serviceTechnician, setServiceTechnician] = useState('Priya Sen');
  const [feedback, setFeedback] = useState('');

  const loadAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data);
      if (!selectedAsset && data.length > 0) {
        setSelectedAsset(data[1]); // Default to Genset with predictive alert
      }
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleLogMaintenance = async (e) => {
    e.preventDefault();
    if (!serviceModal) return;

    try {
      const res = await fetch(`/api/assets/${serviceModal.id}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: `Major overhaul & preventive sensor service (${serviceModal.name})`,
          technician: serviceTechnician,
          notes: serviceNotes || 'Routine 500hr polar inspection, oil flushed, vibration damper replaced.'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setServiceModal(null);
        setServiceNotes('');
        setFeedback(`Maintenance logged successfully for ${updated.name}!`);
        setTimeout(() => setFeedback(''), 4000);
        loadAssets();
        setSelectedAsset(updated);
      }
    } catch (err) {
      console.error("Failed to log maintenance:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900 border-polar-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4 text-cyan-400" />
              PRD 7.6 Polar Fleet Intelligence & Asset Lifecycle
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Asset Health & Predictive Maintenance Engine
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Real-time vibration and thermal telemetry for station generators, PistenBully glacier snowcats, and deep-core drills with ML-based predictive failure anomaly alerts.
            </p>
          </div>

          {feedback && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-mono animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Asset List (1 Col) | Telemetry & Deep Predictive View (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Asset Cards List */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 px-1 flex justify-between">
            <span>REGISTERED POLAR ASSETS</span>
            <span>{assets.length} UNITS</span>
          </div>

          {assets.map((asset) => {
            const isSelected = selectedAsset?.id === asset.id;
            const hasAlert = !!asset.predictiveAlert || asset.healthScore < 75;

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`frost-panel p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-cyan-400 shadow-polar-glow bg-polar-900' 
                    : 'hover:border-polar-600/80'
                } ${hasAlert ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300">
                    {asset.id}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    asset.healthScore > 85 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                    asset.healthScore > 70 ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                    'bg-red-950 text-red-300 border border-red-500/40'
                  }`}>
                    {asset.healthScore}% HEALTH
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                  {asset.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{asset.type}</p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-polar-800 text-[11px] font-mono">
                  <div className="text-slate-400">
                    Hours: <span className="text-white font-bold">{asset.operatingHours} hrs</span>
                  </div>
                  <div className="text-slate-400 text-right">
                    Due: <span className="text-amber-300 font-bold">{asset.hoursSinceLastService}h / {asset.maintenanceIntervalHours}h</span>
                  </div>
                </div>

                {asset.predictiveAlert && (
                  <div className="mt-2 text-[10px] p-1.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="truncate">Impending Bearing Wear Anomaly</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Selected Asset Telemetry & Diagnostics */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAsset ? (
            <>
              {/* Asset Header Detail */}
              <div className="frost-panel p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-polar-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-polar-950 text-cyan-400 border border-polar-700">
                        {selectedAsset.serialNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Custodian: {selectedAsset.custodian}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {selectedAsset.name}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      📍 Location: {selectedAsset.location} • Status: {selectedAsset.operationalStatus}
                    </p>
                  </div>

                  <button
                    onClick={() => setServiceModal(selectedAsset)}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-bold px-4 py-2 rounded-xl text-xs shadow transition shrink-0"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Log Service / Overhaul</span>
                  </button>
                </div>

                {/* Live Telemetry Sensor Grid */}
                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Real-Time Sensor Telemetry Feed</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    {/* Vibration */}
                    <div className="bg-polar-950/80 p-3 rounded-xl border border-polar-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Vibration Sensor</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-xl font-extrabold font-mono ${
                          (selectedAsset.telemetry?.vibrationLevelG || 0) > 0.5 ? 'text-amber-400 animate-pulse' : 'text-white'
                        }`}>
                          {selectedAsset.telemetry?.vibrationLevelG}
                        </span>
                        <span className="text-[10px] text-slate-400">G-force</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1">Nominal &lt; 0.40G</span>
                    </div>

                    {/* Engine Temp */}
                    <div className="bg-polar-950/80 p-3 rounded-xl border border-polar-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Coolant Temp</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-extrabold font-mono text-emerald-300">
                          {selectedAsset.telemetry?.engineTempC}°C
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1">Pre-heat: Active</span>
                    </div>

                    {/* Oil Pressure */}
                    <div className="bg-polar-950/80 p-3 rounded-xl border border-polar-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Lube Pressure</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-extrabold font-mono text-white">
                          {selectedAsset.telemetry?.oilPressurePsi}
                        </span>
                        <span className="text-[10px] text-slate-400">psi</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1">Range: 45-65 psi</span>
                    </div>

                    {/* Fuel / Battery */}
                    <div className="bg-polar-950/80 p-3 rounded-xl border border-polar-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Battery Bus</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-extrabold font-mono text-cyan-300">
                          {selectedAsset.telemetry?.batteryVoltage}V
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1">24V System Stable</span>
                    </div>

                  </div>
                </div>

                {/* Predictive Maintenance Anomaly Banner (PRD Feature) */}
                {selectedAsset.predictiveAlert ? (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono uppercase">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Predictive Maintenance Intelligence (ML Anomaly)
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {selectedAsset.predictiveAlert}
                    </p>
                    <div className="text-[11px] text-amber-400/90 font-mono">
                      Target Action: Swap alternator coupling prior to Antarctic Winter cycle.
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Predictive telemetry indicators within nominal operating envelope.</span>
                  </div>
                )}

                {/* Maintenance History Log */}
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400">
                    Recorded Service & Overhaul History:
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedAsset.recentMaintenance?.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-polar-950 border border-polar-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{m.task}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            By {m.technician} {m.notes ? `• ${m.notes}` : ''}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 shrink-0">
                          {m.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          ) : null}
        </div>

      </div>

      {/* Service Modal */}
      {serviceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogMaintenance} className="frost-panel bg-polar-900 border border-polar-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="border-b border-polar-800 pb-2">
              <h3 className="font-bold text-white text-sm">
                Log Asset Maintenance & Reset Counter
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{serviceModal.name}</p>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Technician / Engineer</label>
              <input
                type="text"
                required
                value={serviceTechnician}
                onChange={(e) => setServiceTechnician(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Service Actions & Parts Replaced</label>
              <textarea
                rows="3"
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                placeholder="e.g. Replaced vibration coupling dampers, calibrated fuel injector pressure to 210 bar..."
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setServiceModal(null)}
                className="px-3 py-1.5 bg-polar-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-polar-950 font-bold rounded-lg text-xs"
              >
                Complete Service
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
