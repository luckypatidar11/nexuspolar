import React, { useState, useEffect } from 'react';
import { useOffline } from '../context/OfflineContext';
import { 
  Boxes, 
  Flame, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Minus, 
  Calendar, 
  MapPin, 
  Search,
  CheckCircle2,
  TrendingDown,
  Droplet,
  Truck,
  Send,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InventoryManager() {
  const { isOffline, enqueueOperation } = useOffline();
  const { currentUser } = useAuth();
  const [inventoryList, setInventoryList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [stockView, setStockView] = useState('ALL');
  const [sortBy, setSortBy] = useState('urgency');
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [consumeModal, setConsumeModal] = useState(null);
  const [consumeQty, setConsumeQty] = useState(10);
  const [consumeReason, setConsumeReason] = useState('Daily Habitat Consumption');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [dispatchModal, setDispatchModal] = useState(null);
  const [dispatchQty, setDispatchQty] = useState(0);
  const [dispatchDestination, setDispatchDestination] = useState('Maitri Station Resupply Dock');
  const [dispatchEta, setDispatchEta] = useState('48 hours');

  const canDispatch = ['Logistics Officer', 'Mission Commander', 'System Administrator'].includes(currentUser?.role);

  const loadInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setInventoryList(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!consumeModal) return;

    if (isOffline) {
      // Offline mode: queue operation locally
      enqueueOperation({
        type: 'INVENTORY_CONSUMPTION',
        itemId: consumeModal.id,
        item: consumeModal.item,
        quantity: consumeQty,
        actor: 'Tarun Rawat (Field)',
        reason: consumeReason
      });

      // Optimistically update local view
      setInventoryList(prev => prev.map(item => {
        if (item.id === consumeModal.id) {
          const newQty = Math.max(0, item.quantity - consumeQty);
          return {
            ...item,
            quantity: newQty,
            daysRemaining: item.dailyBurnRate > 0 ? Math.round(newQty / item.dailyBurnRate) : 999
          };
        }
        return item;
      }));

      setFeedbackMsg(`Queued offline: -${consumeQty} ${consumeModal.unit}`);
      setConsumeModal(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
      return;
    }

    try {
      const res = await fetch('/api/inventory/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: consumeModal.id,
          quantityChange: -Math.abs(consumeQty),
          actionType: 'CONSUMPTION',
          actor: 'Station Logistics',
          reason: consumeReason
        })
      });
      if (res.ok) {
        setConsumeModal(null);
        loadInventory();
        setFeedbackMsg(`Logged transaction: -${consumeQty} ${consumeModal.unit}`);
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      console.error("Failed to update inventory:", err);
    }
  };

  const filteredItems = inventoryList.filter(item => {
    const itemStation = item.stationId || (item.location?.includes('Maitri') ? 'ST-MAITRI' : item.location?.includes('Himadri') ? 'ST-HIMADRI' : 'ST-BHARATI');
    const matchesSearch = item.item.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || item.category.toLowerCase().includes(selectedCat.toLowerCase());
    const isCritical = item.quantity <= item.emergencyReserve;
    const isWarning = item.quantity <= item.minThreshold;
    const matchesView = stockView === 'ALL' || (stockView === 'CRITICAL' && isCritical) || (stockView === 'LOW' && isWarning) || (stockView === 'INBOUND' && (item.inTransit || 0) > 0);
    return matchesSearch && matchesCat && matchesView && (selectedStation === 'ALL' || itemStation === selectedStation);
  }).sort((a, b) => {
    if (sortBy === 'quantity') return a.quantity - b.quantity;
    if (sortBy === 'name') return a.item.localeCompare(b.item);
    return (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity);
  });

  const stationItems = station => inventoryList.filter(item => {
    const itemStation = item.stationId || (item.location?.includes('Maitri') ? 'ST-MAITRI' : item.location?.includes('Himadri') ? 'ST-HIMADRI' : 'ST-BHARATI');
    return station === 'ALL' || itemStation === station;
  });
  const resupplyGaps = inventoryList.filter(item => (item.resupplyGapDays || 0) >= (item.daysRemaining || Infinity));

  const handleDispatch = async (event) => {
    event.preventDefault();
    if (!dispatchModal || !canDispatch || isOffline) return;
    try {
      const response = await fetch('/api/inventory/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: dispatchModal.id,
          quantity: dispatchQty,
          destination: dispatchDestination,
          eta: dispatchEta,
          actor: currentUser.name,
          actorRole: currentUser.role
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Dispatch failed');
      setDispatchModal(null);
      await loadInventory();
      setFeedbackMsg(`Dispatch manifest created: ${dispatchQty.toLocaleString()} ${dispatchModal.unit}`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackMsg(err.message);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900 border-polar-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Boxes className="w-4 h-4 text-cyan-400" />
              PRD 7.4 Polar Consumables & Autonomy
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Station Inventory & Predictive Stock Depletion
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Track emergency reserves, daily burn rates, batch expiration dates, and queue offline bunker stock movements.
            </p>
          </div>

          {feedbackMsg && (
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-mono animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="frost-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search items, bunker locations, batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-polar-950 border border-polar-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'Fuel', 'Food', 'Medical', 'Life Support', 'Maintenance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                selectedCat === cat
                  ? 'bg-cyan-500 text-polar-950 font-bold'
                  : 'bg-polar-900 text-slate-300 hover:bg-polar-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[['ALL', 'All stations'], ['ST-BHARATI', 'Bharati'], ['ST-MAITRI', 'Maitri'], ['ST-HIMADRI', 'Himadri']].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSelectedStation(value)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${selectedStation === value ? 'bg-cyan-500 text-polar-950 border-cyan-400 font-bold' : 'bg-polar-900 text-slate-300 border-polar-700 hover:border-cyan-500/50'}`}
            >
              {label} <span className="font-mono opacity-70">{stationItems(value).length}</span>
            </button>
          ))}
        </div>
        <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ${resupplyGaps.length ? 'text-amber-300 bg-amber-950/30 border-amber-500/30' : 'text-emerald-300 bg-emerald-950/30 border-emerald-500/30'}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          {resupplyGaps.length ? `${resupplyGaps.length} resupply gap${resupplyGaps.length === 1 ? '' : 's'} detected` : 'No resupply gaps detected'}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[['ALL', 'All stock'], ['LOW', 'Low stock'], ['CRITICAL', 'Reserve breach'], ['INBOUND', 'Inbound']].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStockView(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${stockView === value ? 'bg-cyan-500 text-polar-950 border-cyan-400 font-bold' : 'bg-polar-900 text-slate-300 border-polar-700 hover:border-cyan-500/50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono uppercase text-[10px]">Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="bg-polar-900 border border-polar-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400">
            <option value="urgency">Soonest depletion</option>
            <option value="quantity">Lowest quantity</option>
            <option value="name">Item name</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="frost-panel p-3 rounded-xl border-l-4 border-l-cyan-400">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Tracked Items</div>
          <div className="text-xl font-bold text-white font-mono mt-1">{inventoryList.length}</div>
          <div className="text-[10px] text-slate-500">Live station stock lines</div>
        </div>
        <div className="frost-panel p-3 rounded-xl border-l-4 border-l-amber-400">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Low Stock Lines</div>
          <div className="text-xl font-bold text-amber-300 font-mono mt-1">{inventoryList.filter(item => item.quantity <= item.minThreshold).length}</div>
          <div className="text-[10px] text-slate-500">Needs replenishment</div>
        </div>
        <div className="frost-panel p-3 rounded-xl border-l-4 border-l-blue-400">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Incoming Dispatch</div>
          <div className="text-xl font-bold text-blue-300 font-mono mt-1">{inventoryList.reduce((total, item) => total + (item.inTransit || 0), 0).toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Units across manifests</div>
        </div>
        <div className="frost-panel p-3 rounded-xl border-l-4 border-l-emerald-400">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Role Action</div>
          <div className="text-sm font-bold text-emerald-300 mt-2">{canDispatch ? 'Dispatch enabled' : 'Read-only stock view'}</div>
          <div className="text-[10px] text-slate-500">{currentUser?.role}</div>
        </div>
      </div>

      {/* Inventory Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isCritical = item.quantity <= item.emergencyReserve;
          const isWarning = item.quantity <= item.minThreshold && !isCritical;
          const pct = Math.min(100, Math.round((item.quantity / (item.minThreshold * 2.5)) * 100));

          return (
            <div 
              key={item.id} 
              className={`frost-panel p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all ${
                isCritical 
                  ? 'border-red-500/60 shadow-lg shadow-red-950/20' 
                  : isWarning 
                  ? 'border-amber-500/50' 
                  : 'border-polar-700/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-polar-950 text-cyan-400 border border-polar-800">
                    {item.category}
                  </span>
                  {isCritical ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950 border border-red-500/40">
                      <AlertTriangle className="w-3 h-3" /> Critical Reserve Breach
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">
                      Optimal
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                  {item.item}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Quantity Gauge */}
              <div className="space-y-1 bg-polar-950/70 p-3 rounded-lg border border-polar-800">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-2xl font-extrabold text-white">
                    {item.quantity.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">{item.unit}</span>
                </div>

                <div className="w-full bg-polar-800 h-2 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Reserve: {item.emergencyReserve.toLocaleString()}</span>
                  <span>Min: {item.minThreshold.toLocaleString()}</span>
                </div>
                {(item.inTransit || 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-300 font-mono pt-1">
                    <Truck className="w-3 h-3" /> {item.inTransit.toLocaleString()} {item.unit} inbound
                  </div>
                )}
              </div>

              {/* Autonomy & Burn Rate Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="bg-polar-950/40 p-2 rounded border border-polar-800">
                  <div className="text-[9px] text-slate-500 uppercase">Burn Rate</div>
                  <div className="font-bold text-cyan-300">{item.dailyBurnRate} {item.unit}/day</div>
                </div>
                <div className="bg-polar-950/40 p-2 rounded border border-polar-800">
                  <div className="text-[9px] text-slate-500 uppercase">Autonomy</div>
                  <div className="font-bold text-white">{item.daysRemaining} Days</div>
                </div>
              </div>

              {/* Batch Expiry & Action Bar */}
              <div className="pt-2 border-t border-polar-800 flex items-center justify-between gap-2 text-xs">
                <div className="text-[10px] text-slate-400 font-mono">
                  <div>Exp: {item.expiryDate || 'N/A'}</div>
                  {item.lastDispatch && <div className="text-blue-300 mt-0.5">ETA: {item.lastDispatch.eta}</div>}
                </div>

                <div className="flex gap-1.5">
                  <button onClick={() => { setConsumeModal(item); setConsumeQty(item.dailyBurnRate ? Math.max(1, Math.round(item.dailyBurnRate * 2)) : 5); }} className="px-2.5 py-1 rounded bg-polar-800 hover:bg-polar-700 text-cyan-300 hover:text-white border border-polar-600 text-xs font-medium transition">Consume</button>
                  {canDispatch && <button onClick={() => { setDispatchModal(item); setDispatchQty(item.dailyBurnRate ? Math.max(1, Math.round(item.dailyBurnRate * 14)) : 5); }} className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-500 text-white border border-blue-400/40 text-xs font-medium transition"><Send className="w-3 h-3" /> Dispatch</button>}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="frost-panel rounded-xl p-8 text-center text-sm text-slate-400">
          No inventory lines match the current filters.
        </div>
      )}

      {/* Consumption Modal */}
      {consumeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleStockUpdate} className="frost-panel bg-polar-900 border border-polar-700 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="border-b border-polar-800 pb-2">
              <h3 className="font-bold text-white text-sm">
                Record Stock Consumption
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{consumeModal.item}</p>
            </div>

            {isOffline && (
              <div className="p-2 rounded bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300 font-mono">
                ⚠️ Field Offline Mode: Transaction will be queued locally and synced upon link reconnect.
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Quantity Consumed ({consumeModal.unit})
              </label>
              <input
                type="number"
                min="1"
                max={consumeModal.quantity}
                required
                value={consumeQty}
                onChange={(e) => setConsumeQty(Number(e.target.value))}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Purpose / Reason</label>
              <select
                value={consumeReason}
                onChange={(e) => setConsumeReason(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Daily Habitat Consumption">Daily Habitat Consumption</option>
                <option value="Traverse Sledge Stocking">Traverse Sledge Stocking</option>
                <option value="Emergency Weather Protocol">Emergency Weather Protocol</option>
                <option value="Scientific Experiment Use">Scientific Experiment Use</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConsumeModal(null)}
                className="px-3 py-1.5 bg-polar-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-polar-950 font-bold rounded-lg text-xs"
              >
                Confirm Deduction
              </button>
            </div>
          </form>
        </div>
      )}

      {dispatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDispatch} className="frost-panel bg-polar-900 border border-blue-500/40 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="border-b border-polar-800 pb-3">
              <div className="flex items-center gap-2 text-blue-300"><PackageCheck className="w-4 h-4" /><h3 className="font-bold text-white text-sm">Create Resupply Dispatch</h3></div>
              <p className="text-xs text-slate-400 mt-1">{dispatchModal.item} • on hand: {dispatchModal.quantity.toLocaleString()} {dispatchModal.unit}</p>
            </div>
            {isOffline && <div className="p-2 rounded bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300">Reconnect to create a dispatch manifest.</div>}
            <label className="block text-xs text-slate-300">Dispatch quantity ({dispatchModal.unit})<input type="number" min="1" required value={dispatchQty} onChange={event => setDispatchQty(Number(event.target.value))} className="mt-1 w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono" /></label>
            <label className="block text-xs text-slate-300">Destination<input required value={dispatchDestination} onChange={event => setDispatchDestination(event.target.value)} className="mt-1 w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white" /></label>
            <label className="block text-xs text-slate-300">Estimated arrival<select value={dispatchEta} onChange={event => setDispatchEta(event.target.value)} className="mt-1 w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white"><option>24 hours</option><option>48 hours</option><option>72 hours</option><option>Next resupply window</option></select></label>
            <div className="pt-2 flex justify-end gap-2"><button type="button" onClick={() => setDispatchModal(null)} className="px-3 py-1.5 bg-polar-800 text-slate-300 rounded-lg text-xs">Cancel</button><button type="submit" disabled={isOffline} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs"><Send className="w-3 h-3" />Create Manifest</button></div>
          </form>
        </div>
      )}

    </div>
  );
}
