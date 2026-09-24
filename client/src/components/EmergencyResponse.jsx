import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  CheckCircle2, 
  Plus, 
  Clock, 
  User, 
  ChevronRight, 
  Send,
  X
} from 'lucide-react';

export default function EmergencyResponse({ selectedStation = "ST-BHARATI" }) {
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Severe Weather / Blizzard Whiteout');
  const [newSeverity, setNewSeverity] = useState('High');
  const [newLocation, setNewLocation] = useState('Larsemann Hills Sector 4');
  const [timelineNote, setTimelineNote] = useState('');
  const [incidentFilter, setIncidentFilter] = useState('ACTIVE');

  const loadIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data);
      if (!activeIncident && data.length > 0) {
        setActiveIncident(data[0]);
      } else if (activeIncident) {
        const found = data.find(d => d.id === activeIncident.id);
        if (found) setActiveIncident(found);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const openIncidents = incidents.filter(incident => incident.status !== 'Closed');
  const highSeverityIncidents = openIncidents.filter(incident => incident.severity === 'High');
  const playbookSteps = activeIncident?.responseChecklist || [];
  const playbookProgress = playbookSteps.length
    ? Math.round((playbookSteps.filter(step => step.completed).length / playbookSteps.length) * 100)
    : 0;
  const visibleIncidents = incidents.filter(incident => {
    if (incidentFilter === 'ACTIVE') return incident.status !== 'Closed';
    if (incidentFilter === 'HIGH') return incident.severity === 'High';
    return true;
  });

  const handleToggleChecklist = async (stepId, currentState) => {
    if (!activeIncident) return;
    try {
      const res = await fetch(`/api/incidents/${activeIncident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistStepId: stepId,
          checklistCompleted: !currentState,
          actor: "Station Leader",
          note: `Completed protocol item: Step ${stepId}`
        })
      });
      if (res.ok) {
        loadIncidents();
      }
    } catch (err) {
      console.error("Failed to toggle checklist step:", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeIncident) return;
    try {
      const res = await fetch(`/api/incidents/${activeIncident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor: "Mission Commander",
          note: `Incident status transitioned to ${newStatus}`
        })
      });
      if (res.ok) {
        loadIncidents();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddTimelineNote = async (e) => {
    e.preventDefault();
    if (!timelineNote.trim() || !activeIncident) return;
    try {
      const res = await fetch(`/api/incidents/${activeIncident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: "Command Desk",
          note: timelineNote
        })
      });
      if (res.ok) {
        setTimelineNote('');
        loadIncidents();
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleDeclareIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle || 'Emergency Alert',
          type: newType,
          severity: newSeverity,
          stationId: selectedStation,
          location: newLocation,
          reportedBy: "Command Leader Radio Log"
        })
      });
      if (res.ok) {
        const declared = await res.json();
        setShowDeclareModal(false);
        setNewTitle('');
        loadIncidents();
        setActiveIncident(declared);
      }
    } catch (err) {
      console.error("Failed to declare incident:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-polar-900 to-polar-900 border-red-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider mb-1">
              <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
              PRD 7.11 Emergency Response Orchestrator
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Polar SOS & Critical Incident Management
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Deterministic incident response playbooks for whiteout blizzards, crevasse rescues, medical aeromedical evacuation, and power generator trip emergencies.
            </p>
          </div>

          <button
            onClick={() => setShowDeclareModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-red-950 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Broadcast Polar SOS / Declare Incident</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="frost-panel rounded-xl p-4 border-l-4 border-l-red-500">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Open incidents</div>
          <div className="text-2xl font-mono font-bold text-red-300 mt-1">{openIncidents.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Require command attention</div>
        </div>
        <div className="frost-panel rounded-xl p-4 border-l-4 border-l-amber-400">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">High severity</div>
          <div className="text-2xl font-mono font-bold text-amber-300 mt-1">{highSeverityIncidents.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate response priority</div>
        </div>
        <div className="frost-panel rounded-xl p-4 border-l-4 border-l-cyan-400">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Selected playbook</div>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">{playbookProgress}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Checklist completion</div>
        </div>
        <div className="frost-panel rounded-xl p-4 border-l-4 border-l-emerald-400">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Response posture</div>
          <div className="text-sm font-bold text-emerald-300 mt-2">{openIncidents.length ? 'COMMAND ACTIVE' : 'STANDBY'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Station emergency desk</div>
        </div>
      </div>

      {/* Main Grid: Incident List (1 Col) | Incident Workflow & Checklist (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Incidents List */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 px-1 flex justify-between">
            <span>ACTIVE EMERGENCY LOG</span>
            <span>{incidents.length} RECORDS</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[['ACTIVE', 'Open'], ['HIGH', 'High severity'], ['ALL', 'All records']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setIncidentFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${incidentFilter === value ? 'bg-red-500 text-polar-950 border-red-400 font-bold' : 'bg-polar-900 text-slate-300 border-polar-700 hover:border-red-500/50'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {visibleIncidents.map((inc) => {
            const isSelected = activeIncident?.id === inc.id;
            const isOpen = inc.status !== 'Closed';

            return (
              <div
                key={inc.id}
                onClick={() => setActiveIncident(inc)}
                className={`frost-panel p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-red-500 shadow-lg shadow-red-950/40 bg-polar-900' 
                    : 'hover:border-polar-600'
                } ${inc.severity === 'High' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-400'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300">
                    {inc.id} • {inc.stationId}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    inc.status === 'Open' ? 'bg-red-950 text-red-300 border border-red-500/40' :
                    inc.status === 'Response' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                    inc.status === 'Stabilized' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                  {inc.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{inc.type}</p>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-polar-800">
                  <span>📍 {inc.location}</span>
                  <span className="text-cyan-400">{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}

          {visibleIncidents.length === 0 && (
            <div className="frost-panel rounded-xl p-6 text-center text-sm text-slate-400">
              No incidents match this view.
            </div>
          )}
        </div>

        {/* Right 2 Columns: Active Incident Details, Checklist & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {activeIncident ? (
            <>
              {/* Incident Header & Lifecycle State Machine */}
              <div className="frost-panel p-5 rounded-2xl space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-polar-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40">
                        {activeIncident.severity} SEVERITY
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Declared: {new Date(activeIncident.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {activeIncident.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      📍 {activeIncident.location} • Reported by: {activeIncident.reportedBy}
                    </p>
                  </div>

                  {/* Status Transition State Machine Buttons */}
                  <div className="flex items-center gap-1.5 bg-polar-950 p-1 rounded-xl border border-polar-800">
                    {['Open', 'Response', 'Stabilized', 'Closed'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition ${
                          activeIncident.status === st
                            ? 'bg-red-500 text-polar-950 shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Structured Auto-Generated Response Checklist (PRD 7.11 Hero) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Structured Emergency Response Playbook
                    </h3>
                    <span className="text-xs font-mono text-cyan-300">
                      {activeIncident.responseChecklist?.filter(c => c.completed).length} / {activeIncident.responseChecklist?.length} Complete
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeIncident.responseChecklist?.map((step) => (
                      <label
                        key={step.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          step.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                            : 'bg-polar-950/70 border-polar-800 hover:border-polar-700 text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={step.completed}
                          onChange={() => handleToggleChecklist(step.id, step.completed)}
                          className="w-4 h-4 mt-0.5 accent-cyan-400 cursor-pointer"
                        />
                        <span className={`text-xs ${step.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                          {step.task}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Immutable Action Timeline Log */}
                <div className="pt-3 border-t border-polar-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Emergency Action Audit Trail
                  </h3>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {activeIncident.timeline?.map((log, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-polar-950 border border-polar-800 text-xs">
                        <div className="flex justify-between font-mono text-[10px] text-cyan-400">
                          <span className="font-bold">{log.actor}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-200 mt-1">{log.note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Log Note Form */}
                  <form onSubmit={handleAddTimelineNote} className="flex gap-2">
                    <input
                      type="text"
                      value={timelineNote}
                      onChange={(e) => setTimelineNote(e.target.value)}
                      placeholder="Transmit situation report / log action entry..."
                      className="flex-1 bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-polar-800 hover:bg-polar-700 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Log</span>
                    </button>
                  </form>
                </div>

              </div>
            </>
          ) : null}
        </div>

      </div>

      {/* Declare Incident Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDeclareIncident} className="frost-panel bg-polar-900 border border-red-500/50 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="border-b border-polar-800 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Declare Station Emergency / Polar SOS
              </h3>
              <button type="button" onClick={() => setShowDeclareModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Incident Headline</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Crevasse Fall on Traverse Route Charlie"
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Incident Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Severe Weather / Blizzard Whiteout">Severe Blizzard Whiteout</option>
                  <option value="Glacier Crevasse / Search & Rescue">Glacier Crevasse / SAR</option>
                  <option value="Medical Emergency / Hypothermia">Medical / Severe Hypothermia</option>
                  <option value="Station Primary Power Outage">Primary Power Outage</option>
                  <option value="Satellite VHF Communications Loss">Comms Loss / Lost Beacon</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="High">High (Immediate Threat)</option>
                  <option value="Medium">Medium (Precautionary)</option>
                  <option value="Low">Low (Advisory Watch)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Grid Coordinates / Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeclareModal(false)}
                className="px-3 py-1.5 bg-polar-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-950"
              >
                Broadcast & Activate Playbook
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
