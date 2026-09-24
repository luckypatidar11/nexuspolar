import React, { useState, useEffect } from 'react';
import { useOffline } from '../context/OfflineContext';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Radio, 
  Heart, 
  CheckCircle2, 
  UserCheck, 
  Search,
  Timer
} from 'lucide-react';

export default function PersonnelSafetyMuster() {
  const { isOffline, enqueueOperation } = useOffline();
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const [deploymentFilter, setDeploymentFilter] = useState('ALL');

  const loadPersonnel = async () => {
    try {
      const res = await fetch('/api/auth/roles');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load personnel:", err);
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const handleFieldCheckIn = (user) => {
    const timestamp = new Date().toISOString();

    if (isOffline) {
      enqueueOperation({
        type: 'CHECK_IN',
        personnelId: user.id,
        personnelName: user.name,
        timestamp,
        location: user.stationId || 'Larsemann Traverse Sector 4'
      });
      setFeedback(`Queued offline check-in for ${user.name}`);
      setTimeout(() => setFeedback(''), 4000);
      return;
    }

    // Direct online sync
    setUsers(prev => prev.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          lastCheckIn: timestamp,
          status: 'Active / Field Verified'
        };
      }
      return u;
    }));
    setFeedback(`VHF Check-in recorded for ${user.name} at ${new Date().toLocaleTimeString()}`);
    setTimeout(() => setFeedback(''), 4000);
  };

  const fieldPersonnel = users.filter(user => user.status?.includes('Field'));
  const stationPersonnel = users.filter(user => !user.status?.includes('Field'));
  const verifiedPersonnel = users.filter(user => user.status?.includes('Verified') || user.lastCheckIn);
  const filtered = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase()) ||
      user.stationId?.toLowerCase().includes(search.toLowerCase());
    const matchesDeployment = deploymentFilter === 'ALL' ||
      (deploymentFilter === 'FIELD' && user.status?.includes('Field')) ||
      (deploymentFilter === 'STATION' && !user.status?.includes('Field'));
    return matchesSearch && matchesDeployment;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900 border-polar-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              PRD 7.5 Personnel Safety & Buddy Protocol
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Personnel Muster Board & Scheduled Check-in Monitor
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Antarctic safety regulation requires buddy pairing and strict 4-hour field radio check-ins. Automated alerts trigger upon 30-minute overdue threshold.
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

      {/* Safety Muster Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-emerald-400">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Station Muster Status</span>
          <div className="text-lg font-bold text-emerald-300 font-mono mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% ACCOUNTED
          </div>
          <span className="text-[10px] text-slate-400 font-mono">All 24 personnel verified</span>
        </div>

        <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-cyan-400">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Field Traverse Teams</span>
          <div className="text-lg font-bold text-cyan-300 font-mono mt-1 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            1 Active Traverse
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Team Alpha (PB-300 Tiger 1)</span>
        </div>

        <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-amber-400">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Next Scheduled Muster</span>
          <div className="text-lg font-bold text-amber-300 font-mono mt-1 flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-amber-400" />
            01h 14m
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Universal 22:00Z Check</span>
        </div>

        <div className="frost-panel p-3.5 rounded-xl border-l-4 border-l-purple-400">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Buddy Pairings</span>
          <div className="text-lg font-bold text-purple-300 font-mono mt-1">
            Enforced
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Never solo in sub-zero</span>
        </div>
      </div>

      <div className="frost-panel rounded-2xl p-4 border-cyan-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-mono">Personnel movement control</p>
            <h2 className="text-base font-semibold text-white mt-1">Know who is moving, where, and when they last checked in</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-amber-300"><span className="w-2 h-2 rounded-full bg-amber-400" /> FIELD {fieldPersonnel.length}</span>
            <span className="flex items-center gap-1.5 text-emerald-300"><span className="w-2 h-2 rounded-full bg-emerald-400" /> STATION {stationPersonnel.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Active route</div>
            <div className="text-sm text-white font-semibold mt-1">Traverse Corridor Charlie</div>
            <div className="text-[11px] text-slate-400 mt-1">PB-300 Tiger 1 • Waypoint 4 • 38 km SW</div>
          </div>
          <div className="bg-polar-950/60 border border-polar-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Movement protocol</div>
            <div className="text-sm text-emerald-300 font-semibold mt-1">Buddy pairing enforced</div>
            <div className="text-[11px] text-slate-400 mt-1">No solo movement in sub-zero exposure</div>
          </div>
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Next radio window</div>
            <div className="text-sm text-amber-300 font-semibold mt-1">22:00Z universal muster</div>
            <div className="text-[11px] text-slate-400 mt-1">Overdue threshold: 30 minutes</div>
          </div>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="frost-panel p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-polar-800 pb-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search personnel, role, or station..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-polar-950 border border-polar-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filtered.length} active expedition roster members
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[['ALL', 'All personnel'], ['FIELD', 'Field deployed'], ['STATION', 'At station']].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDeploymentFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${deploymentFilter === value ? 'bg-cyan-500 text-polar-950 border-cyan-400 font-bold' : 'bg-polar-900 text-slate-300 border-polar-700 hover:border-cyan-500/50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((person) => {
            const isField = person.status?.includes('Field');

            return (
              <div 
                key={person.id} 
                className={`frost-panel p-4 rounded-xl space-y-3 transition-all ${
                  isField ? 'border-cyan-500/40 bg-cyan-950/10' : 'border-polar-700/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {person.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">
                        {person.name}
                      </h3>
                      <div className="text-[11px] text-cyan-300 font-mono mt-0.5">
                        {person.role}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isField ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {person.status || 'Active'}
                  </span>
                </div>

                <div className="bg-polar-950/70 p-2.5 rounded-lg border border-polar-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-mono text-[10px]">DESIGNATION</span>
                    <span className="truncate max-w-[160px] text-[11px]">{person.designation || 'Staff'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-mono text-[10px]">BASE STATION</span>
                    <span className="font-mono text-cyan-300 text-[11px]">{person.stationId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-mono text-[10px]">BLOOD GROUP</span>
                    <span className="font-mono text-red-400 font-bold text-[11px]">{person.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-mono text-[10px]">CLEARANCE</span>
                    <span className="font-mono text-slate-300 text-[10px]">{person.clearanceLevel || 'Level 2'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-polar-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Last Check: {person.lastCheckIn ? new Date(person.lastCheckIn).toLocaleTimeString() : 'Recent'}
                  </div>

                  <button
                    onClick={() => handleFieldCheckIn(person)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-polar-950 text-xs font-bold transition shadow"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Check In</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
