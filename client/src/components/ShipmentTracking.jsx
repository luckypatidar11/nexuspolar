import React, { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Plane,
  Radio,
  Ship,
  Truck,
  AlertTriangle,
  ShieldCheck,
  UsersRound
} from 'lucide-react';

const statusStyles = {
  'At Station': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  'In Transit': 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
  'Staged': 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  Delayed: 'text-red-300 bg-red-500/10 border-red-500/30'
};

const statusOrder = ['Booked', 'In Transit', 'At Station'];

function getProgress(status) {
  const index = statusOrder.indexOf(status);
  return index < 0 ? 42 : ((index + 1) / statusOrder.length) * 100;
}

export default function ShipmentTracking() {
  const [cargo, setCargo] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const loadCargo = () => fetch('/api/cargo')
      .then(response => response.json())
      .then(data => {
        setCargo(Array.isArray(data) ? data : []);
        setSelectedId(currentId => currentId || data?.[0]?.id || null);
      })
      .catch(() => setCargo([]));
    loadCargo();
    const interval = setInterval(loadCargo, 20000);
    return () => clearInterval(interval);
  }, []);

  const selectedShipment = cargo.find(item => item.id === selectedId) || cargo[0];
  const summary = useMemo(() => ({
    total: cargo.length,
    inTransit: cargo.filter(item => item.status === 'In Transit').length,
    delivered: cargo.filter(item => item.status === 'At Station').length,
    critical: cargo.filter(item => item.priority === 'Critical' && item.status !== 'At Station').length,
    delayed: cargo.filter(item => item.status === 'Delayed' || Number(item.delayDays) > 0).length
  }), [cargo]);

  const duplicateKeys = useMemo(() => {
    const counts = cargo.reduce((result, item) => {
      const key = `${item.name?.toLowerCase()}|${item.destination?.toLowerCase()}`;
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
    return new Set(Object.keys(counts).filter(key => counts[key] > 1));
  }, [cargo]);

  const getTransportMode = item => {
    const text = `${item.name} ${item.category} ${item.chainOfCustody?.map(event => event.event).join(' ')}`.toLowerCase();
    if (text.includes('air') || text.includes('twin otter') || text.includes('helicopter')) return { label: 'Aircraft leg', Icon: Plane };
    if (text.includes('vessel') || text.includes('ship') || text.includes('ocean')) return { label: 'Vessel leg', Icon: Ship };
    return { label: 'Station / ground leg', Icon: Truck };
  };

  const latestCustodyEvent = selectedShipment?.chainOfCustody?.[selectedShipment.chainOfCustody.length - 1];
  const transportMode = selectedShipment ? getTransportMode(selectedShipment) : null;
  const TransportIcon = transportMode?.Icon;

  return (
    <div className="space-y-6">
      <div className="frost-panel rounded-2xl p-5 border-cyan-500/25 bg-gradient-to-r from-cyan-950/40 via-polar-900 to-polar-900">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4" /> End-to-end logistics visibility
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Shipment Tracking</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">Follow every container from consolidation to station receipt with custody events, ETA context and priority exceptions.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE CARGO FEED
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Total shipments', summary.total, PackageCheck, 'text-white'],
          ['In transit', summary.inTransit, Ship, 'text-cyan-300'],
          ['Received at station', summary.delivered, CheckCircle2, 'text-emerald-300'],
          ['Delayed legs', summary.delayed, Clock3, 'text-red-300']
        ].map(([label, value, Icon, color]) => (
          <div key={label} className="frost-panel rounded-xl p-4 border-polar-700/70">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              <span>{label}</span><Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-2xl font-mono font-bold mt-2 ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
        <section className="frost-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-mono">Manifest register</p>
              <h2 className="text-base font-semibold text-white mt-1">All tracked cargo</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">{cargo.length} records</span>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {cargo.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left rounded-xl border p-3 transition ${selectedShipment?.id === item.id ? 'border-cyan-500/60 bg-cyan-950/30' : 'border-polar-800 bg-polar-950/40 hover:border-polar-600'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-cyan-400">{item.id} • {item.containerId}</div>
                    <div className="text-sm font-semibold text-white truncate mt-1">{item.name}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded border shrink-0 ${statusStyles[item.status] || statusStyles.Staged}`}>{item.status}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3">
                  <span>{item.destination}</span>
                  <span className="text-slate-300">{item.weightKg?.toLocaleString()} kg</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>{getTransportMode(item).label}</span>
                  <span>{item.chainOfCustody?.length || 0} custody handoffs</span>
                </div>
                <div className="h-1.5 bg-polar-800 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${getProgress(item.status)}%` }} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="frost-panel rounded-2xl p-5">
          {selectedShipment ? (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-polar-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">Selected consignment</div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedShipment.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedShipment.id} • QR {selectedShipment.qrCode || 'Pending tag'}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex text-xs px-2 py-1 rounded border ${statusStyles[selectedShipment.status] || statusStyles.Staged}`}>{selectedShipment.status}</div>
                  <div className="text-[10px] text-slate-500 mt-2">Priority: <span className="text-amber-300">{selectedShipment.priority}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-b border-polar-800">
                <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-3">
                  <div className="text-[10px] uppercase text-slate-500 font-mono">Current leg</div>
                  <div className="text-sm text-cyan-300 font-semibold mt-1 flex items-center gap-1.5">{TransportIcon && <TransportIcon className="w-4 h-4" />} {transportMode?.label}</div>
                </div>
                <div className="rounded-xl bg-polar-950/60 border border-polar-800 p-3">
                  <div className="text-[10px] uppercase text-slate-500 font-mono">Latest handoff</div>
                  <div className="text-sm text-white font-semibold mt-1">{latestCustodyEvent?.handler || 'Manifest desk'}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{latestCustodyEvent?.location || 'Origin terminal'}</div>
                </div>
                <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/20 p-3">
                  <div className="text-[10px] uppercase text-slate-500 font-mono">Handoff network</div>
                  <div className="text-sm text-emerald-300 font-semibold mt-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Contractor + Navy/Coast Guard</div>
                  <div className="text-[11px] text-slate-400 mt-1">Custody receipt required at each leg</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-polar-800 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300"><UsersRound className="w-3.5 h-3.5 text-cyan-300" /> Procurement integrity</span>
                <span className={duplicateKeys.has(`${selectedShipment.name?.toLowerCase()}|${selectedShipment.destination?.toLowerCase()}`) ? 'text-red-300' : 'text-emerald-300'}>
                  {duplicateKeys.has(`${selectedShipment.name?.toLowerCase()}|${selectedShipment.destination?.toLowerCase()}`) ? 'Duplicate manifest flag' : 'No duplicate procurement flag'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-polar-800">
                <div><div className="metric-label">Origin</div><div className="metric-value"><Anchor className="w-3.5 h-3.5 text-cyan-300" /> {selectedShipment.origin || 'NCPOR Hub'}</div></div>
                <div><div className="metric-label">Destination</div><div className="metric-value"><MapPin className="w-3.5 h-3.5 text-emerald-300" /> {selectedShipment.destination}</div></div>
                <div><div className="metric-label">Weight</div><div className="metric-value">{selectedShipment.weightKg?.toLocaleString()} kg</div></div>
                <div><div className="metric-label">Handling</div><div className="metric-value"><Truck className="w-3.5 h-3.5 text-amber-300" /> {selectedShipment.handling}</div></div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-white">Chain of custody</h3><span className="text-xs text-slate-500">{selectedShipment.chainOfCustody?.length || 0} events</span></div>
                <div className="space-y-4">
                  {(selectedShipment.chainOfCustody || []).map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="flex gap-3">
                      <div className="flex flex-col items-center"><div className={`w-7 h-7 rounded-full flex items-center justify-center ${index === (selectedShipment.chainOfCustody.length - 1) ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'}`}><CheckCircle2 className="w-4 h-4" /></div>{index < selectedShipment.chainOfCustody.length - 1 && <div className="w-px flex-1 bg-polar-700 mt-1" />}</div>
                      <div className="pb-2"><div className="text-sm text-slate-200">{event.event}</div><div className="text-xs text-slate-400 mt-1">{event.location} • {event.handler}</div><div className="text-[10px] text-slate-500 font-mono mt-1"><Clock3 className="w-3 h-3 inline mr-1" />{new Date(event.timestamp).toLocaleString()}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : <div className="h-full min-h-64 flex items-center justify-center text-sm text-slate-500">No shipment records available.</div>}
        </section>
      </div>
    </div>
  );
}
