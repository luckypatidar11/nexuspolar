import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Crosshair, MapPin, Navigation, Radar, ShieldAlert, Users, Wind } from 'lucide-react';

const zoneDefinitions = [
  { id: 'base', label: 'Station safety perimeter', type: 'SAFE', radius: 2, description: 'All-clear operating area around the station core.', tone: 'cyan' },
  { id: 'controlled', label: 'Controlled traverse corridor', type: 'CONTROLLED', radius: 18, description: 'Field movement allowed only with buddy checks and live comms.', tone: 'amber' },
  { id: 'restricted', label: 'Crevasse / whiteout exclusion zone', type: 'NO-GO', radius: 35, description: 'Entry blocked while severe weather and ice instability are active.', tone: 'red' }
];

const fieldTeams = [
  { id: 'alpha', name: 'Traverse Team Alpha', distance: 12.4, direction: 'SE', status: 'CONTROLLED', contact: 'Iridium + VHF linked' },
  { id: 'bravo', name: 'Survey Team Bravo', distance: 28.7, direction: 'E', status: 'CONTROLLED', contact: 'VHF check-in due in 18m' },
  { id: 'cargo', name: 'Cargo Sledge Charlie', distance: 39.2, direction: 'SW', status: 'NO-GO', contact: 'Route crossing blocked' }
];

export default function GeofencedSafetyZones({ stations, selectedStation, onSelectStation }) {
  const [selectedZone, setSelectedZone] = useState('restricted');
  const [recallIssued, setRecallIssued] = useState(false);
  const station = stations.find(item => item.id === selectedStation) || stations[0] || {};
  const activeZone = zoneDefinitions.find(zone => zone.id === selectedZone) || zoneDefinitions[0];
  const alerts = useMemo(() => fieldTeams.filter(team => team.status === 'NO-GO'), []);

  return (
    <div className="space-y-6">
      <section className="frost-panel p-5 rounded-2xl border-red-500/30 bg-gradient-to-r from-red-950/35 via-polar-900 to-polar-900">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-300 font-mono text-xs uppercase tracking-wider mb-2"><Radar className="w-4 h-4" /> Polar safety perimeter / geofence monitor</div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Geofenced Safety Zones</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">Keep people, vehicles, and cargo inside approved movement corridors as weather and terrain risk changes.</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto bg-polar-950/70 p-1.5 rounded-xl border border-polar-800">
            {stations.map(item => <button key={item.id} onClick={() => onSelectStation(item.id)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${item.id === station.id ? 'bg-red-400 text-polar-950 font-bold' : 'text-slate-400 hover:text-white'}`}>{item.name.replace(' Station', '')}</button>)}
          </div>
        </div>
      </section>

      {alerts.length > 0 && <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/50 border border-red-500/50"><AlertTriangle className="w-5 h-5 text-red-400 shrink-0" /><div><div className="text-sm font-bold text-red-200">{alerts.length} geofence violation requires response</div><div className="text-xs text-red-300/80 mt-1">Hold movement and establish contact before authorizing route continuation.</div></div></div>}

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="frost-panel rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4"><div><h2 className="text-sm font-bold text-white uppercase font-mono">Live geofence map</h2><p className="text-xs text-slate-400 mt-1">{station.name} • {station.coordinates?.lat?.toFixed(2)}°, {station.coordinates?.lng?.toFixed(2)}°</p></div><span className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-mono"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> GPS LINKED</span></div>
          <div className="relative min-h-[390px] rounded-xl overflow-hidden border border-polar-700 bg-[#081523] bg-[radial-gradient(#234263_1px,transparent_1px)] [background-size:22px_22px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-red-950/30" />
            <div className="absolute w-[330px] h-[330px] rounded-full border border-red-500/25 bg-red-500/5" />
            <div className="absolute w-[220px] h-[220px] rounded-full border border-amber-400/35 bg-amber-400/5" />
            <div className="absolute w-[105px] h-[105px] rounded-full border border-cyan-400/45 bg-cyan-400/10" />
            <div className="absolute w-6 h-6 rounded-full bg-cyan-400 border-4 border-white shadow-polar-glow flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-polar-950" /></div>
            <div className="absolute top-5 left-5 text-[10px] font-mono text-slate-500">N {station.coordinates?.lat?.toFixed(3) || '--'}</div>
            <div className="absolute bottom-5 right-5 text-[10px] font-mono text-slate-500">E {station.coordinates?.lng?.toFixed(3) || '--'}</div>
            {fieldTeams.map((team, index) => <button key={team.id} onClick={() => setSelectedZone(team.status === 'NO-GO' ? 'restricted' : 'controlled')} className={`absolute flex flex-col items-center ${index === 0 ? 'right-[26%] top-[33%]' : index === 1 ? 'right-[12%] bottom-[27%]' : 'left-[18%] bottom-[18%]'}`}><span className={`w-4 h-4 rotate-45 border-2 border-white ${team.status === 'NO-GO' ? 'bg-red-500' : 'bg-amber-400'}`} /><span className="mt-2 px-1.5 py-0.5 rounded bg-polar-950/90 text-[9px] font-mono text-slate-200 whitespace-nowrap border border-polar-700">{team.name.replace('Traverse Team ', 'Team ')}</span></button>)}
            <div className="absolute left-3 bottom-3 space-y-1 text-[10px] font-mono"><Legend color="bg-cyan-400" label="Safe perimeter" /><Legend color="bg-amber-400" label="Controlled corridor" /><Legend color="bg-red-500" label="No-go zone" /></div>
          </div>
        </div>

        <div className="space-y-3">
          {zoneDefinitions.map(zone => <button key={zone.id} onClick={() => setSelectedZone(zone.id)} className={`w-full text-left frost-panel p-4 rounded-xl border transition ${selectedZone === zone.id ? selectedZoneClasses(zone.tone) : 'border-polar-700/60 hover:border-polar-500'}`}><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${zone.tone === 'cyan' ? 'bg-cyan-400' : zone.tone === 'amber' ? 'bg-amber-400' : 'bg-red-500'}`} /><span className="text-sm font-bold text-white">{zone.label}</span></div><span className="text-[10px] font-mono text-slate-400">0-{zone.radius} km</span></div><p className="text-xs text-slate-400 mt-2 leading-relaxed">{zone.description}</p></button>)}
          <div className="frost-panel p-4 rounded-xl border border-polar-700/60"><div className="text-[10px] text-slate-500 uppercase font-mono">Selected control</div><div className="text-sm text-white font-semibold mt-1">{activeZone.label}</div><div className="grid grid-cols-2 gap-2 mt-3"><div className="bg-polar-950/70 p-2 rounded-lg"><div className="text-[9px] text-slate-500 uppercase">Rule</div><div className="text-xs text-cyan-300 mt-1">{activeZone.type === 'NO-GO' ? 'Entry blocked' : activeZone.type === 'CONTROLLED' ? 'Buddy + comms' : 'Normal ops'}</div></div><div className="bg-polar-950/70 p-2 rounded-lg"><div className="text-[9px] text-slate-500 uppercase">Action</div><div className="text-xs text-amber-300 mt-1">{activeZone.type === 'NO-GO' ? 'Recall team' : 'Monitor'}</div></div></div></div>
        </div>
      </section>

      <section className="frost-panel rounded-2xl p-5"><div className="flex items-center justify-between mb-4"><div><h2 className="text-sm font-bold text-white uppercase font-mono">Tracked field units</h2><p className="text-xs text-slate-400 mt-1">Last known GPS positions and movement authorization</p></div><span className="text-xs text-cyan-300 font-mono">{fieldTeams.length} units</span></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{fieldTeams.map(team => <div key={team.id} className={`p-4 rounded-xl border ${team.status === 'NO-GO' ? 'bg-red-950/20 border-red-500/50' : 'bg-polar-950/60 border-polar-800'}`}><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400" /><span className="text-xs font-semibold text-white">{team.name}</span></div>{team.status === 'NO-GO' ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}</div><div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono"><div><div className="text-[9px] text-slate-500 uppercase">Distance</div><div className="text-white">{team.distance} km</div></div><div><div className="text-[9px] text-slate-500 uppercase">Bearing</div><div className="text-cyan-300">{team.direction}</div></div></div><div className={`text-[10px] font-mono mt-3 ${team.status === 'NO-GO' ? 'text-red-300' : 'text-slate-400'}`}>{team.contact}</div>{team.status === 'NO-GO' && (recallIssued ? <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-2"><CheckCircle2 className="w-3.5 h-3.5" /> Recall transmitted</div> : <button onClick={() => setRecallIssued(true)} className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2"><Navigation className="w-3.5 h-3.5" /> Issue recall order</button>)}</div>)}</div></section>
    </div>
  );
}

function Legend({ color, label }) { return <div className="flex items-center gap-2 text-slate-400"><span className={`w-2 h-2 rounded-full ${color}`} />{label}</div>; }
function selectedZoneClasses(tone) { return tone === 'cyan' ? 'border-cyan-400/70 shadow-polar-glow' : tone === 'amber' ? 'border-amber-400/70 shadow-polar-glow' : 'border-red-400/70 shadow-polar-glow'; }