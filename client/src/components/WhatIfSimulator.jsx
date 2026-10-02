import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { 
  Sliders, 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  ShieldAlert, 
  RefreshCcw, 
  Flame, 
  Zap, 
  Users, 
  Ship, 
  Wind,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function WhatIfSimulator({ selectedStation = "ST-BHARATI", stations = [] }) {
  // Scenario Inputs
  const [cargoDelayDays, setCargoDelayDays] = useState(18); // Default demo disruption
  const [fuelLossPercent, setFuelLossPercent] = useState(0);
  const [extraPersonnel, setExtraPersonnel] = useState(4);
  const [generatorFailure, setGeneratorFailure] = useState(false);
  const [blizzardDurationDays, setBlizzardDurationDays] = useState(6);

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: selectedStation,
          cargoDelayDays,
          fuelLossPercent,
          extraPersonnel,
          generatorFailure,
          blizzardDurationDays
        })
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.error("Simulation run failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [selectedStation, cargoDelayDays, fuelLossPercent, extraPersonnel, generatorFailure, blizzardDurationDays]);

  const resetScenarios = () => {
    setCargoDelayDays(0);
    setFuelLossPercent(0);
    setExtraPersonnel(0);
    setGeneratorFailure(false);
    setBlizzardDurationDays(0);
  };

  const currentStation = stations.find(s => s.id === selectedStation) || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="frost-panel p-5 rounded-2xl border-indigo-500/30 bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Polar Digital Twin • Disruption What-If Simulation
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Mission Disruption & Resilience Simulator
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Stress-test station survival against severe polar anomalies: simulate icebreaker resupply delays, primary power generator blackouts, blizzard lockdowns, and unpredicted crew surges.
            </p>
          </div>

          <button
            onClick={resetScenarios}
            className="flex items-center gap-2 bg-polar-800 hover:bg-polar-700 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-mono transition border border-polar-600/60"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control Sliders (1 Col) | Real-time Projections & Impact (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Disruption Sliders */}
        <div className="frost-panel p-5 rounded-2xl space-y-5">
          <div className="border-b border-polar-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
              <Ship className="w-4 h-4 text-indigo-400" />
              Disruption Variables
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Testing station {currentStation.name || 'Bharati'}
            </p>
          </div>

          {/* Variable 1: Cargo Resupply Vessel Delay */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-cyan-400" />
                Supply Vessel Ice Delay
              </span>
              <span className={`font-mono font-bold ${cargoDelayDays > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                +{cargoDelayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="3"
              value={cargoDelayDays}
              onChange={(e) => setCargoDelayDays(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-polar-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>On Time (0d)</span>
              <span>+20d (Fast Ice Pack)</span>
              <span>+45d (Winter Lock)</span>
            </div>
          </div>

          {/* Variable 2: Continuous Blizzard Lockout */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-blue-400" />
                Cat-3 Blizzard Duration
              </span>
              <span className={`font-mono font-bold ${blizzardDurationDays > 0 ? 'text-blue-300' : 'text-slate-400'}`}>
                {blizzardDurationDays} Days Lockout
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={blizzardDurationDays}
              onChange={(e) => setBlizzardDurationDays(Number(e.target.value))}
              className="w-full accent-blue-400 bg-polar-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Increases station heating fuel burn by +25% during active storm.
            </p>
          </div>

          {/* Variable 3: Unplanned Additional Crew */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Additional Personnel (Evacuees)
              </span>
              <span className={`font-mono font-bold ${extraPersonnel > 0 ? 'text-indigo-300' : 'text-slate-400'}`}>
                +{extraPersonnel} Crew
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={extraPersonnel}
              onChange={(e) => setExtraPersonnel(Number(e.target.value))}
              className="w-full accent-indigo-400 bg-polar-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Increases ration & potable water melt consumption.
            </p>
          </div>

          {/* Variable 4: Fuel Reserve Contamination / Loss */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Fuel Contamination / Tank Loss
              </span>
              <span className={`font-mono font-bold ${fuelLossPercent > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                -{fuelLossPercent}% Volume
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={fuelLossPercent}
              onChange={(e) => setFuelLossPercent(Number(e.target.value))}
              className="w-full accent-red-400 bg-polar-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Variable 5: Primary Generator Catastrophic Breakdown */}
          <div className="pt-3 border-t border-polar-800">
            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-polar-950/70 border border-polar-800 hover:border-polar-700 transition">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${generatorFailure ? 'bg-red-500/20 text-red-400' : 'bg-polar-800 text-slate-400'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Gen-A 250kVA Trip Failure</div>
                  <div className="text-[10px] text-slate-400">Forces station to Cold Standby Gen-B</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={generatorFailure}
                onChange={(e) => setGeneratorFailure(e.target.checked)}
                className="w-4 h-4 accent-red-500 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Right 2 Columns: Impact Assessment & Projections */}
        <div className="lg:col-span-2 space-y-4">
          
          {simulationResult && (
            <>
              {/* Top Autonomy Impact Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Baseline vs Simulated Days of Autonomy */}
                <div className="frost-panel p-4 rounded-xl border-l-4 border-l-indigo-400">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Simulated Autonomy (DoA)</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {simulationResult.metrics?.simulatedDoA}
                    </span>
                    <span className="text-xs text-indigo-300">Days</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                    <span>Baseline: {simulationResult.metrics?.baselineDoA}d</span>
                    <span className="text-red-400 font-bold">
                      ({simulationResult.metrics?.deltaDays}d)
                    </span>
                  </div>
                </div>

                {/* Resupply Date Breach Check */}
                <div className={`frost-panel p-4 rounded-xl border-l-4 ${
                  simulationResult.metrics?.simulatedDoA < simulationResult.metrics?.resupplyArrivalDay
                    ? 'border-l-red-500 bg-red-950/20'
                    : 'border-l-emerald-400'
                }`}>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Resupply Window Safety</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    {simulationResult.metrics?.simulatedDoA < simulationResult.metrics?.resupplyArrivalDay ? (
                      <span className="text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        CRITICAL BREACH
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        SAFE BUFFER
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Vessel Arrival: Day {simulationResult.metrics?.resupplyArrivalDay}
                  </div>
                </div>

                {/* Burn Rate Under Stress */}
                <div className="frost-panel p-4 rounded-xl border-l-4 border-l-amber-400">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Daily Fuel Burn Rate</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-amber-300 font-mono">
                      {simulationResult.metrics?.projectedDailyFuelBurn}
                    </span>
                    <span className="text-xs text-slate-400">Liters/day</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Effective Station Crew: {simulationResult.metrics?.effectiveCrew} Pax
                  </div>
                </div>

              </div>

              {/* 60-Day Trajectory Depletion Timeline (PRD Visualizer) */}
              <div className="frost-panel p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-cyan-400" />
                    60-Day Projected Depletion Trajectory
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    5-Day Discrete Evaluation Steps
                  </span>
                </div>

                {/* Visual Bar Graph */}
                <div className="space-y-2 mt-2">
                  {simulationResult.projectionTimeline?.slice(0, 8).map((point, idx) => {
                    const maxFuel = 142000;
                    const pct = Math.max(0, Math.min(100, (point.fuelRemaining / maxFuel) * 100));
                    const isBreach = point.fuelRemaining <= point.fuelThreshold;

                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                        <div className="w-14 text-slate-400 text-[11px] shrink-0">{point.day}</div>
                        
                        <div className="flex-1 bg-polar-950 h-5 rounded overflow-hidden relative border border-polar-800">
                          <div
                            className={`h-full transition-all rounded ${
                              isBreach ? 'bg-gradient-to-r from-red-600 to-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                          {/* Emergency reserve marker line at ~22% */}
                          <div className="absolute top-0 bottom-0 left-[22%] w-px bg-red-400/70 border-r border-dotted border-red-300" title="Emergency Reserve Line" />
                          <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-white drop-shadow">
                            {point.fuelRemaining.toLocaleString()} L
                          </span>
                        </div>

                        <div className="w-24 text-right text-[11px] shrink-0">
                          {point.isResupplyDay ? (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[10px]">
                              🚢 Resupply
                            </span>
                          ) : isBreach ? (
                            <span className="text-red-400 font-bold text-[10px]">⚠️ Below Reserve</span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Nominal</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Constraint Violations (PRD Section 7.9) */}
              <div className="frost-panel p-4 rounded-xl border border-red-500/20 bg-red-950/10">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Identified Constraint Violations ({simulationResult.violations?.length || 0})
                </h3>
                {simulationResult.violations?.length === 0 ? (
                  <p className="text-xs text-emerald-300">
                    No constraint violations detected under current operational parameters.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {simulationResult.violations?.map((v, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2 rounded bg-polar-950/70 border border-red-500/30 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-red-900/80 text-red-200 font-mono text-[9px] font-bold uppercase shrink-0 mt-0.5">
                          {v.severity}
                        </span>
                        <span className="text-slate-200">{v.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI-Recommended Alternative Planning Options */}
              {simulationResult.alternativeOptions?.length > 0 && (
                <div className="frost-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/10">
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                    AI Recommended Corrective Mitigations (Advisory)
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {simulationResult.alternativeOptions?.map((opt, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold font-mono">↳</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}
