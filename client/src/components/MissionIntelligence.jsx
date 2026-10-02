import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  History,
  Lightbulb,
  Network,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  XCircle
} from 'lucide-react';

const tabs = [
  { id: 'readiness', label: 'Readiness Score', icon: ShieldCheck },
  { id: 'replan', label: 'Adaptive Replanning', icon: RefreshCw },
  { id: 'replay', label: 'Timeline Replay', icon: History },
  { id: 'dependencies', label: 'Dependency Graph', icon: Network },
  { id: 'decisions', label: 'Decision Log', icon: Lightbulb }
];

export default function MissionIntelligence({ expeditions, assets, incidents }) {
  const [activeTool, setActiveTool] = useState('readiness');
  const [selectedId, setSelectedId] = useState(expeditions[0]?.id || '');
  const [inventory, setInventory] = useState([]);
  const [replanLoading, setReplanLoading] = useState(false);
  const [replanResult, setReplanResult] = useState(null);

  const selectedMission = expeditions.find(expedition => expedition.id === selectedId) || expeditions[0] || {};

  useEffect(() => {
    apiFetch('/api/inventory').then(response => response.json()).then(data => setInventory(Array.isArray(data) ? data : [])).catch(() => setInventory([]));
  }, []);

  const readiness = useMemo(() => calculateReadiness(selectedMission, inventory, assets, incidents), [selectedMission, inventory, assets, incidents]);
  const timeline = useMemo(() => buildTimeline(selectedMission, incidents), [selectedMission, incidents]);
  const dependencies = useMemo(() => buildDependencies(selectedMission, inventory, assets), [selectedMission, inventory, assets]);
  const decisions = useMemo(() => buildDecisionLog(selectedMission, readiness, inventory, incidents), [selectedMission, readiness, inventory, incidents]);

  const handleReplan = async () => {
    setReplanLoading(true);
    setReplanResult(null);
    try {
      const allocation = selectedMission.resourceAllocation || {};
      const response = await apiFetch('/api/planner/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays: selectedMission.durationDays || 45,
          personnelCount: selectedMission.personnelCount || 12,
          destinationStation: stationName(selectedMission.stationId),
          missionType: selectedMission.objective || 'Polar field expedition',
          transportMode: selectedMission.transportModes?.[0] || 'PistenBully 300 Polar Snowcat',
          contingencyBufferPercent: Math.max(30, allocation.contingencyBufferPercent || 30)
        })
      });
      const data = await response.json();
      setReplanResult(data);
    } catch {
      setReplanResult({ error: 'Planner service is unavailable. Keep the current plan and retry when the link is restored.' });
    } finally {
      setReplanLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="frost-panel p-5 rounded-2xl border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-polar-900 to-polar-900">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs uppercase tracking-wider mb-2"><Network className="w-4 h-4" /> Mission intelligence / explainable operations</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Can we start the mission?</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">One operational picture for readiness, change response, mission history, dependencies, and accountable decisions.</p>
          </div>
          <select value={selectedId} onChange={event => setSelectedId(event.target.value)} className="bg-polar-950 border border-polar-700 rounded-lg px-3 py-2 text-xs text-cyan-300 min-w-[260px]">
            {expeditions.map(expedition => <option key={expedition.id} value={expedition.id}>{expedition.name}</option>)}
          </select>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return <button key={tab.id} onClick={() => setActiveTool(tab.id)} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${activeTool === tab.id ? 'bg-emerald-400 text-polar-950 font-bold' : 'frost-panel text-slate-300 hover:text-white'}`}><Icon className="w-4 h-4" />{tab.label}</button>;
        })}
      </nav>

      {activeTool === 'readiness' && <ReadinessView readiness={readiness} mission={selectedMission} />}
      {activeTool === 'replan' && <ReplanView mission={selectedMission} loading={replanLoading} result={replanResult} onReplan={handleReplan} />}
      {activeTool === 'replay' && <ReplayView timeline={timeline} />}
      {activeTool === 'dependencies' && <DependencyView dependencies={dependencies} />}
      {activeTool === 'decisions' && <DecisionView decisions={decisions} />}
    </div>
  );
}

function ReadinessView({ readiness, mission }) {
  return <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
    <div className="frost-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center">
      <div className={`w-44 h-44 rounded-full border-[14px] ${readiness.score >= 80 ? 'border-emerald-400' : readiness.score >= 60 ? 'border-amber-400' : 'border-red-500'} flex flex-col items-center justify-center`}>
        <span className="text-5xl font-extrabold text-white font-mono">{readiness.score}</span><span className="text-xs text-slate-400 font-mono">/ 100</span>
      </div>
      <div className={`mt-5 text-lg font-bold ${readiness.ready ? 'text-emerald-300' : 'text-amber-300'}`}>{readiness.ready ? 'MISSION GO' : 'HOLD FOR CORRECTION'}</div>
      <p className="text-xs text-slate-400 mt-2 max-w-xs">{readiness.ready ? 'Critical launch gates are satisfied.' : 'One or more launch gates need commander attention.'}</p>
    </div>
    <div className="frost-panel rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-white uppercase font-mono">Launch gates</h2><p className="text-xs text-slate-400 mt-1">{mission.name}</p></div><span className="text-xs text-cyan-300 font-mono">{readiness.passed} / {readiness.total} passed</span></div>
      {readiness.gates.map(gate => <div key={gate.label} className="flex items-start gap-3 p-3 rounded-xl bg-polar-950/60 border border-polar-800"><div className={`mt-0.5 ${gate.pass ? 'text-emerald-400' : 'text-amber-400'}`}>{gate.pass ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}</div><div className="flex-1"><div className="text-xs font-semibold text-white">{gate.label}</div><div className="text-[11px] text-slate-400 mt-0.5">{gate.detail}</div></div><span className={`text-[10px] font-mono ${gate.pass ? 'text-emerald-300' : 'text-amber-300'}`}>{gate.pass ? 'PASS' : 'REVIEW'}</span></div>)}
    </div>
  </div>;
}

function ReplanView({ mission, loading, result, onReplan }) {
  return <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6"><div className="frost-panel rounded-2xl p-5 space-y-4"><div className="flex items-center gap-2 text-cyan-300"><Sparkles className="w-5 h-5" /><h2 className="text-sm font-bold">Adaptive change response</h2></div><p className="text-xs text-slate-400 leading-relaxed">Recalculate fuel, rations, water, medical reserves, and cargo after mission conditions change. The current approved mission remains untouched until a commander reviews the result.</p><div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">Trigger: weather, crew, route, duration, or transport assumptions changed.</div><button onClick={onReplan} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-polar-950 font-bold rounded-lg py-2.5 text-xs">{loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}{loading ? 'Generating revised plan...' : 'Generate revised plan'}</button></div><div className="frost-panel rounded-2xl p-5">{!result ? <EmptyState icon={Workflow} text="No revised plan generated yet." /> : result.error ? <div className="text-sm text-red-300">{result.error}</div> : <div className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Revised resource envelope</h2><span className="text-xl font-bold text-cyan-300 font-mono">{result.confidenceScore}% confidence</span></div><div className="grid grid-cols-2 gap-3"><Summary label="Rations" value={`${result.nutritional?.totalRationsKg?.toLocaleString()} kg`} /><Summary label="Fuel" value={`${result.fuel?.totalFuelLiters?.toLocaleString()} L`} /><Summary label="Water" value={`${result.nutritional?.totalWaterLiters?.toLocaleString()} L`} /><Summary label="Cargo" value={`${result.cargoSummary?.totalWeightKg?.toLocaleString()} kg`} /></div><div className="space-y-2">{result.assumptions?.map(assumption => <div key={assumption} className="flex gap-2 text-xs text-slate-300"><ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />{assumption}</div>)}</div></div>}</div></div>;
}

function ReplayView({ timeline }) { return <div className="frost-panel rounded-2xl p-5"><div className="flex items-center gap-2 mb-5"><History className="w-5 h-5 text-indigo-300" /><div><h2 className="text-sm font-bold text-white">Mission timeline replay</h2><p className="text-xs text-slate-400">Reconstructed from mission gates and incident records</p></div></div><div className="relative ml-2 border-l border-indigo-500/30 space-y-4">{timeline.map(event => <div key={event.id} className="relative pl-6"><span className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-polar-950 ${event.tone === 'alert' ? 'bg-red-400' : event.tone === 'complete' ? 'bg-emerald-400' : 'bg-indigo-400'}`} /><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3 rounded-xl bg-polar-950/60 border border-polar-800"><div><div className="text-xs font-semibold text-white">{event.title}</div><div className="text-[11px] text-slate-400 mt-1">{event.detail}</div></div><span className="text-[10px] text-indigo-300 font-mono whitespace-nowrap">{event.time}</span></div></div>)}</div></div>; }

function DependencyView({ dependencies }) { return <div className="frost-panel rounded-2xl p-5"><div className="flex items-center gap-2 mb-5"><GitBranch className="w-5 h-5 text-amber-300" /><div><h2 className="text-sm font-bold text-white">Resource dependency graph</h2><p className="text-xs text-slate-400">Failure propagation across mission-critical resources</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{dependencies.map(node => <div key={node.name} className="p-4 rounded-xl bg-polar-950/70 border border-polar-800"><div className="flex items-center justify-between"><span className="text-sm font-bold text-white">{node.name}</span><span className={`text-[10px] font-mono ${node.status === 'stable' ? 'text-emerald-300' : 'text-amber-300'}`}>{node.status.toUpperCase()}</span></div><div className="text-xs text-slate-400 mt-2">If this fails:</div><div className="flex flex-wrap gap-1.5 mt-2">{node.impact.map(item => <span key={item} className="text-[10px] px-2 py-1 rounded bg-amber-950/50 border border-amber-500/30 text-amber-200">{item}</span>)}</div><div className="flex items-center gap-2 mt-3 text-[11px] text-slate-300"><ArrowRight className="w-3.5 h-3.5 text-amber-400" />Mitigation: {node.mitigation}</div></div>)}</div></div>; }

function DecisionView({ decisions }) { return <div className="frost-panel rounded-2xl p-5"><div className="flex items-center gap-2 mb-5"><Lightbulb className="w-5 h-5 text-cyan-300" /><div><h2 className="text-sm font-bold text-white">Explainable decision log</h2><p className="text-xs text-slate-400">Every recommendation has a visible signal, rule, and next action</p></div></div><div className="space-y-3">{decisions.map(decision => <div key={decision.id} className="p-4 rounded-xl bg-polar-950/70 border border-polar-800"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /><span className="text-sm font-semibold text-white">{decision.title}</span></div><span className="text-[10px] font-mono text-slate-500">{decision.time}</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs"><div><div className="text-[10px] uppercase text-slate-500 font-mono">Signal</div><div className="text-slate-300 mt-1">{decision.signal}</div></div><div><div className="text-[10px] uppercase text-slate-500 font-mono">Rule</div><div className="text-slate-300 mt-1">{decision.rule}</div></div><div><div className="text-[10px] uppercase text-slate-500 font-mono">Action</div><div className="text-cyan-300 mt-1">{decision.action}</div></div></div></div>)}</div></div>; }

function Summary({ label, value }) { return <div className="p-3 rounded-xl bg-polar-950/70 border border-polar-800"><div className="text-[10px] text-slate-500 uppercase font-mono">{label}</div><div className="text-lg font-bold text-white font-mono mt-1">{value || '--'}</div></div>; }
function EmptyState({ icon: Icon, text }) { return <div className="min-h-48 flex flex-col items-center justify-center text-center text-slate-400"><Icon className="w-8 h-8 text-slate-600 mb-3" /><span className="text-sm">{text}</span></div>; }
function stationName(stationId) { return stationId === 'ST-MAITRI' ? 'Maitri Station' : stationId === 'ST-HIMADRI' ? 'Himadri Station' : 'Bharati Station'; }

function calculateReadiness(mission, inventory, assets, incidents) {
  const checklist = mission.readinessChecklist || [];
  const completed = checklist.filter(item => item.completed).length;
  const checklistScore = checklist.length ? Math.round((completed / checklist.length) * 40) : 0;
  const resources = mission.resourceAllocation || {};
  const fuel = inventory.find(item => item.category === 'Fuel');
  const rations = inventory.find(item => item.category === 'Food/Rations');
  const resourceScore = fuel && rations ? 30 : 15;
  const assetScore = assets.some(asset => asset.healthScore < 70) ? 5 : 15;
  const incidentScore = incidents.filter(incident => incident.status !== 'Closed').length ? 5 : 15;
  const gates = [
    { label: 'Mission checklist', pass: completed === checklist.length && checklist.length > 0, detail: `${completed} of ${checklist.length} operational checks complete` },
    { label: 'Fuel and ration reserve', pass: Boolean(fuel && rations && fuel.quantity > fuel.emergencyReserve && rations.quantity > rations.emergencyReserve), detail: fuel && rations ? `${fuel.daysRemaining} fuel days / ${rations.daysRemaining} ration days remaining` : 'Inventory telemetry unavailable' },
    { label: 'Fleet health', pass: !assets.some(asset => asset.healthScore < 70), detail: `${assets.filter(asset => asset.healthScore >= 70).length} of ${assets.length} assets above minimum health` },
    { label: 'Incident posture', pass: incidents.filter(incident => incident.status !== 'Closed').length === 0, detail: `${incidents.filter(incident => incident.status !== 'Closed').length} open incidents require review` },
    { label: 'Contingency allocation', pass: (resources.contingencyBufferPercent || 0) >= 25, detail: `${resources.contingencyBufferPercent || 0}% contingency buffer allocated` }
  ];
  const score = Math.min(100, checklistScore + resourceScore + assetScore + incidentScore + (gates[4].pass ? 10 : 0));
  return { score, ready: score >= 80 && gates.filter(gate => !gate.pass).length === 0, passed: gates.filter(gate => gate.pass).length, total: gates.length, gates };
}

function buildTimeline(mission, incidents) {
  const events = (mission.readinessChecklist || []).map((item, index) => ({ id: item.id, title: item.completed ? 'Readiness gate completed' : 'Readiness gate pending', detail: `${item.task}${item.verifiedBy ? ` • ${item.verifiedBy}` : ''}`, time: `Gate ${String(index + 1).padStart(2, '0')}`, tone: item.completed ? 'complete' : 'pending' }));
  incidents.filter(incident => incident.stationId === mission.stationId).slice(0, 4).forEach(incident => events.push({ id: incident.id, title: `Incident: ${incident.title}`, detail: `${incident.severity} severity • ${incident.status}`, time: new Date(incident.createdAt).toLocaleDateString(), tone: 'alert' }));
  return events.length ? events : [{ id: 'empty', title: 'No replay events recorded', detail: 'Mission event history will appear as operational actions are logged.', time: 'Awaiting data', tone: 'pending' }];
}

function buildDependencies(mission, inventory, assets) {
  const fuel = inventory.find(item => item.category === 'Fuel');
  const rations = inventory.find(item => item.category === 'Food/Rations');
  const vehicle = assets.find(asset => asset.type?.toLowerCase().includes('vehicle')) || assets[0];
  return [
    { name: 'Polar fuel reserve', status: fuel?.quantity > fuel?.emergencyReserve ? 'stable' : 'watch', impact: ['Heating autonomy', 'Vehicle range', 'Snowmelt water'], mitigation: 'Protect reserve and trigger logistics dispatch' },
    { name: 'Expedition rations', status: rations?.quantity > rations?.emergencyReserve ? 'stable' : 'watch', impact: ['Crew endurance', 'Mission duration', 'Medical risk'], mitigation: 'Rebalance cargo and reduce traverse days' },
    { name: vehicle?.name || 'Primary traverse asset', status: vehicle?.healthScore >= 70 ? 'stable' : 'watch', impact: ['Route access', 'Cargo movement', 'Field safety'], mitigation: 'Deploy backup vehicle and schedule service' },
    { name: 'Satellite communications', status: 'stable', impact: ['Muster checks', 'Emergency response', 'Weather updates'], mitigation: 'Test Iridium and VHF redundancy before departure' }
  ];
}

function buildDecisionLog(mission, readiness, inventory, incidents) {
  const fuel = inventory.find(item => item.category === 'Fuel');
  return [
    { id: 'decision-readiness', title: readiness.ready ? 'Mission marked GO' : 'Mission held for review', signal: `${readiness.score}/100 readiness score`, rule: readiness.ready ? 'All launch gates pass' : 'Any critical launch gate is unresolved', action: readiness.ready ? 'Proceed to commander sign-off' : 'Resolve highlighted gates', time: 'Current state' },
    { id: 'decision-fuel', title: 'Fuel reserve monitored', signal: fuel ? `${fuel.daysRemaining} autonomy days` : 'No fuel telemetry', rule: 'Protect fuel above emergency reserve', action: fuel?.quantity <= fuel?.minThreshold ? 'Dispatch replenishment' : 'Continue scheduled burn', time: 'Inventory state' },
    { id: 'decision-incident', title: 'Operational risk posture evaluated', signal: `${incidents.filter(incident => incident.status !== 'Closed').length} open incidents`, rule: 'Open incidents block an unconditional launch', action: 'Review emergency and risk modules', time: 'Incident state' },
    { id: 'decision-buffer', title: 'Contingency buffer checked', signal: `${mission.resourceAllocation?.contingencyBufferPercent || 0}% allocated`, rule: 'Polar deployment target is at least 25%', action: 'Increase reserve before approval if below target', time: 'Plan state' }
  ];
}