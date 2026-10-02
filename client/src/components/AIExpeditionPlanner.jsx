import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Users, 
  MapPin, 
  Truck, 
  ShieldAlert, 
  Flame, 
  Droplet, 
  HeartPulse, 
  Package, 
  HelpCircle,
  ArrowRight,
  Save,
  Check
} from 'lucide-react';

export default function AIExpeditionPlanner({ onExpeditionCreated }) {
  // Input parameters
  const [durationDays, setDurationDays] = useState(45);
  const [personnelCount, setPersonnelCount] = useState(14);
  const [destinationStation, setDestinationStation] = useState("Bharati Station");
  const [missionType, setMissionType] = useState("Deep Ice-Core Drilling & Glaciology");
  const [transportMode, setTransportMode] = useState("PistenBully 300 Polar Snowcat");
  const [contingencyBufferPercent, setContingencyBufferPercent] = useState(30);
  const [missionName, setMissionName] = useState("Larsemann Glacier Cryosphere Traverse");

  // Output calculation state
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);

  // Trigger calculation on input change or mount
  const handleCalculate = async () => {
    setLoading(true);
    setApprovalStatus(null);
    try {
      const res = await apiFetch('/api/planner/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays,
          personnelCount,
          destinationStation,
          missionType,
          transportMode,
          contingencyBufferPercent
        })
      });
      const data = await res.json();
      setPlanResult(data);
    } catch (err) {
      console.error("AI Planner calculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [durationDays, personnelCount, destinationStation, missionType, transportMode, contingencyBufferPercent]);

  // Commander Approval Workflow
  const handleApprovePlan = async () => {
    if (!planResult) return;
    setLoading(true);
    try {
      const res = await apiFetch('/api/planner/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planResult,
          expeditionDetails: {
            name: missionName,
            objective: `Field deployment for ${missionType} operating out of ${destinationStation} for ${durationDays} days.`
          },
          approvedBy: "Dr. Rajesh Sharma (Mission Commander)"
        })
      });
      const data = await res.json();
      setApprovalStatus(data);
      if (onExpeditionCreated) onExpeditionCreated();
    } catch (err) {
      console.error("Failed to approve plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="frost-panel p-5 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              SIH Hero Feature • Decision Support Engine
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI-Assisted Polar Expedition Resource Planner
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Generates deterministic physiological caloric estimates, thermal heating fuel reserves, life-support requirements, and contingency buffers with complete human-in-the-loop commander sign-off.
            </p>
          </div>

          {planResult && (
            <div className="flex items-center gap-3 bg-polar-950/80 px-4 py-2 rounded-xl border border-polar-700/80">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-mono uppercase">AI Confidence Score</div>
                <div className="text-xl font-extrabold text-cyan-300 font-mono">
                  {planResult.confidenceScore}%
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Check className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Inputs on Left (1 col) | Generated Plan on Right (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Mission Configuration Parameters */}
        <div className="frost-panel p-5 rounded-2xl space-y-4">
          <div className="border-b border-polar-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide font-mono">
              <SlidersIcon className="w-4 h-4 text-cyan-400" />
              Expedition Parameters
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Specify polar operational constraints
            </p>
          </div>

          {/* Mission Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Mission Name / Code</label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Mission Duration</span>
              <span className="text-cyan-300 font-mono font-bold">{durationDays} Days</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-polar-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>10d (Sortie)</span>
              <span>90d (Season)</span>
              <span>180d (Winter)</span>
            </div>
          </div>

          {/* Personnel Count Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Station Crew / Traverse Team</span>
              <span className="text-cyan-300 font-mono font-bold">{personnelCount} Personnel</span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              step="1"
              value={personnelCount}
              onChange={(e) => setPersonnelCount(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-polar-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>2 (Buddy minimum)</span>
              <span>35 (Base max)</span>
            </div>
          </div>

          {/* Destination Base */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Station Base / Destination</label>
            <select
              value={destinationStation}
              onChange={(e) => setDestinationStation(e.target.value)}
              className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="Bharati Station">Bharati Station (Larsemann Hills)</option>
              <option value="Maitri Station">Maitri Station (Schirmacher Oasis)</option>
              <option value="Himadri Station">Himadri Station (Arctic Svalbard)</option>
            </select>
          </div>

          {/* Mission Type */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Mission Operational Category</label>
            <select
              value={missionType}
              onChange={(e) => setMissionType(e.target.value)}
              className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Deep Ice-Core Drilling & Glaciology">Deep Ice-Core Drilling & Glaciology</option>
              <option value="Station Winter Overwintering">Station Winter Overwintering</option>
              <option value="Seismic & Atmospheric Array Survey">Seismic & Atmospheric Array Survey</option>
              <option value="Coastal Shelf Bathymetry & Marine Biology">Coastal Shelf Bathymetry & Marine Biology</option>
            </select>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Primary Transport Logistics</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="PistenBully 300 Polar Snowcat">PistenBully 300 Polar Snowcats (Heavy Track)</option>
              <option value="Lynx 69 Ranger Snowmobile">Lynx 69 Ranger Snowmobiles (Light/Fast)</option>
              <option value="Twin Otter Ski-Plane Sortie">Twin Otter Ski-Plane Sortie (Air Support)</option>
            </select>
          </div>

          {/* Polar Contingency Buffer Slider */}
          <div className="pt-2 border-t border-polar-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-300 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Polar Contingency Buffer
              </span>
              <span className="text-amber-400 font-mono font-bold">+{contingencyBufferPercent}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              step="5"
              value={contingencyBufferPercent}
              onChange={(e) => setContingencyBufferPercent(Number(e.target.value))}
              className="w-full accent-amber-400 bg-polar-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              SCAR standard recommends &ge;30% safety reserve against 15-day polar blizzard whiteouts.
            </p>
          </div>

        </div>

        {/* Right 2 Columns: AI Calculated Plan Outputs */}
        <div className="lg:col-span-2 space-y-4">
          
          {loading && !planResult ? (
            <div className="frost-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-sm font-medium text-white">Running Polar Physiological & Thermal Engine...</p>
              <p className="text-xs text-slate-400 mt-1">Calculating heating degree days, snowmelt diesel burn, and caloric requirements</p>
            </div>
          ) : planResult ? (
            <>
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Rations Total */}
                <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-amber-400">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Total Provisions</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {(planResult.nutritional?.totalRationsKg || 0).toLocaleString()} <span className="text-xs text-amber-300">kg</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {planResult.nutritional?.dailyCaloriePerPerson} kcal/day/crew
                  </div>
                </div>

                {/* Fuel Total */}
                <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-cyan-400">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Arctic Fuel Required</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {(planResult.fuel?.totalFuelLiters || 0).toLocaleString()} <span className="text-xs text-cyan-300">L</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Inc. +{planResult.inputs?.contingencyBufferPercent}% Polar Buffer
                  </div>
                </div>

                {/* Water Melt */}
                <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-blue-400">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Potable Water Melt</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {(planResult.nutritional?.totalWaterLiters || 0).toLocaleString()} <span className="text-xs text-blue-300">L</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    3.5 L/day per person
                  </div>
                </div>

                {/* Cargo Staging */}
                <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-purple-400">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Total Cargo Mass</div>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    {((planResult.cargoSummary?.totalWeightKg || 0) / 1000).toFixed(1)} <span className="text-xs text-purple-300">Tonnes</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {planResult.cargoSummary?.totalVolumeM3} m³ required
                  </div>
                </div>

              </div>

              {/* Medical & Life Support Reserves */}
              <div className="frost-panel p-4 rounded-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
                  <HeartPulse className="w-4 h-4 text-red-400" />
                  Medical & Hypothermia Emergency Allocation
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-polar-950/70 p-2.5 rounded-lg border border-polar-800">
                    <span className="text-slate-400 block text-[10px]">Trauma Triage Kits</span>
                    <span className="font-bold text-white text-sm font-mono">{planResult.medical?.traumaKitsCount} Units</span>
                  </div>
                  <div className="bg-polar-950/70 p-2.5 rounded-lg border border-polar-800">
                    <span className="text-slate-400 block text-[10px]">Hypothermia Warming Beds</span>
                    <span className="font-bold text-white text-sm font-mono">{planResult.medical?.hypothermiaBedsCount} Beds</span>
                  </div>
                  <div className="bg-polar-950/70 p-2.5 rounded-lg border border-polar-800">
                    <span className="text-slate-400 block text-[10px]">Lightweight O2 Cylinders</span>
                    <span className="font-bold text-white text-sm font-mono">{planResult.medical?.oxygenCylindersCount} Cylinders</span>
                  </div>
                  <div className="bg-polar-950/70 p-2.5 rounded-lg border border-polar-800">
                    <span className="text-slate-400 block text-[10px]">Plasma & Saline Packs</span>
                    <span className="font-bold text-white text-sm font-mono">{planResult.medical?.plasmaIVUnits} Units</span>
                  </div>
                </div>
              </div>

              {/* Equipment Checklist */}
              <div className="frost-panel p-4 rounded-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-cyan-400" />
                  Mission Essential Equipment Checklist
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {planResult.equipmentChecklist?.map((eq, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-polar-950/60 border border-polar-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-polar-900 text-cyan-400 border border-polar-700">
                          {eq.category}
                        </span>
                        <span className="text-slate-200 font-medium">{eq.item}</span>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-400">
                        Qty: <span className="text-white font-bold">{eq.qty}</span> • {eq.weightKg} kg
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable AI: Planning Assumptions & Uncertainty Transparency (PRD Section 13) */}
              <div className="frost-panel p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  Explainable AI Assumptions & Governance Notes
                </h3>
                <ul className="space-y-1 text-xs text-slate-300">
                  {planResult.assumptions?.map((asmp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono mt-0.5">▪</span>
                      <span>{asmp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Human Approval Bar */}
              <div className="frost-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-t-cyan-500">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Human-in-the-Loop Governance:</span>
                    <span className="text-cyan-400">Advisory Plan Review</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    As Expedition Commander, approving this plan commits resource reservations to station bunkers.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {approvalStatus ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/50">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{approvalStatus.message}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleApprovePlan}
                      disabled={loading}
                      className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-polar-950 font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Approve & Reserve Supplies</span>
                    </button>
                  )}
                </div>
              </div>

            </>
          ) : null}

        </div>

      </div>

    </div>
  );
}

function SlidersIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="4" y1="21" y2="14"/>
      <line x1="4" x2="4" y1="10" y2="3"/>
      <line x1="12" x2="12" y1="21" y2="12"/>
      <line x1="12" x2="12" y1="8" y2="3"/>
      <line x1="20" x2="20" y1="21" y2="16"/>
      <line x1="20" x2="20" y1="12" y2="3"/>
      <line x1="2" x2="6" y1="14" y2="14"/>
      <line x1="10" x2="14" y1="8" y2="8"/>
      <line x1="18" x2="22" y1="16" y2="16"/>
    </svg>
  );
}
