import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Package, 
  QrCode, 
  Layers, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search,
  Boxes,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

export default function CargoSmartPacking() {
  const [cargoList, setCargoList] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeQrModal, setActiveQrModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCargo, setNewCargo] = useState({
    name: '',
    category: 'Rations / Provisions',
    weightKg: 1200,
    volumeM3: 4.5,
    priority: 'Critical',
    handling: 'Keep Dry / Freeze Stable',
    destination: 'Bharati Station - Main Bunker'
  });

  const loadCargo = async () => {
    try {
      const res = await fetch('/api/cargo');
      const data = await res.json();
      setCargoList(data);
    } catch (err) {
      console.error("Failed to load cargo:", err);
    }
  };

  const loadOptimization = async () => {
    try {
      const res = await fetch('/api/cargo/pack-optimize', { method: 'POST' });
      const data = await res.json();
      setOptimization(data);
    } catch (err) {
      console.error("Failed to pack optimize:", err);
    }
  };

  useEffect(() => {
    loadCargo();
    loadOptimization();
  }, []);

  const handleCreateCargo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cargo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCargo)
      });
      if (res.ok) {
        setShowAddModal(false);
        loadCargo();
        loadOptimization();
      }
    } catch (err) {
      console.error("Failed to create cargo:", err);
    }
  };

  const filteredCargo = cargoList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900 border-polar-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Package className="w-4 h-4 text-cyan-400" />
              PRD 7.3 Logistics & Smart Packing Engine
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cargo Logistics & Smart Container Packing
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Weight & volume constrained 3D packing heuristic, priority classification (Critical / Important / Normal), chain-of-custody verification, and QR identification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-polar-950 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Cargo Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smart Container Packing Visualization (Hero Section) */}
      {optimization && (
        <div className="frost-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                Smart 3D Container Load Optimization (ISO 20ft Polar Units)
              </h2>
              <p className="text-xs text-slate-400">
                Greedy bin packing distributing critical supplies and hazmat fuels within 22,000 kg and 33 m³ structural limits
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-300 bg-polar-950 px-3 py-1 rounded-lg border border-polar-800">
              {optimization.containersAllocated} Containers Allocated • {optimization.totalCargoItems} Items Packed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimization.containers?.map((cont, idx) => (
              <div key={idx} className="bg-polar-950/80 p-4 rounded-xl border border-polar-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-mono font-bold text-sm text-white">{cont.containerId}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    {cont.status}
                  </span>
                </div>

                {/* Weight Meter */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Weight Load:</span>
                    <span className="text-white font-bold">{cont.usedWeightKg.toLocaleString()} / {cont.capacityWeightKg.toLocaleString()} kg</span>
                    <span className="text-cyan-400">{cont.weightUtilizationPercent}%</span>
                  </div>
                  <div className="w-full bg-polar-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cont.weightUtilizationPercent > 90 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(100, cont.weightUtilizationPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Volume Meter */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Volume Load:</span>
                    <span className="text-white font-bold">{cont.usedVolumeM3.toFixed(1)} / {cont.capacityVolumeM3} m³</span>
                    <span className="text-indigo-400">{cont.volumeUtilizationPercent}%</span>
                  </div>
                  <div className="w-full bg-polar-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, cont.volumeUtilizationPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Packed Items Preview */}
                <div className="pt-2 border-t border-polar-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Manifest Items in Container:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cont.items?.map((it, i) => (
                      <span 
                        key={i} 
                        className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          it.priority === 'Critical' 
                            ? 'bg-red-950/70 text-red-300 border-red-500/40' 
                            : it.priority === 'Important'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                            : 'bg-polar-900 text-slate-300 border-polar-700'
                        }`}
                      >
                        {it.name} ({it.weightKg}kg)
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cargo Registry Table */}
      <div className="frost-panel p-5 rounded-2xl space-y-4">
        
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cargo name, ID, or QR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-polar-950 border border-polar-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'Rations', 'Fuel', 'Medical', 'Spare', 'Scientific'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-polar-950 font-bold'
                    : 'bg-polar-900 text-slate-300 hover:bg-polar-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cargo Items List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-polar-950 text-slate-400 font-mono uppercase text-[10px] border-b border-polar-800">
              <tr>
                <th className="p-3">Cargo ID & Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Weight / Volume</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">QR Identification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-800/80">
              {filteredCargo.map((item) => (
                <tr key={item.id} className="hover:bg-polar-900/50 transition">
                  <td className="p-3">
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] text-cyan-300 font-mono">{item.id} • {item.containerId}</div>
                  </td>
                  <td className="p-3 text-slate-300">{item.category}</td>
                  <td className="p-3 font-mono text-slate-200">
                    <div>{item.weightKg?.toLocaleString()} kg</div>
                    <div className="text-[10px] text-slate-400">{item.volumeM3} m³</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                      item.priority === 'Critical' 
                        ? 'bg-red-950 text-red-300 border border-red-500/40' 
                        : item.priority === 'Important'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                    }`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{item.destination}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-polar-800 text-slate-200 text-[10px] font-medium border border-polar-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setActiveQrModal(item)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-polar-900 hover:bg-polar-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Tag</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* QR Code Identification Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="frost-panel bg-polar-900 border border-cyan-500/40 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-polar-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm font-mono">Polar QR Logistics Tag</h3>
              </div>
              <button 
                onClick={() => setActiveQrModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-inner text-polar-950">
              <div className="bg-white p-2 border-4 border-polar-950 rounded-lg">
                <QRCodeCanvas
                  value={JSON.stringify({
                    id: activeQrModal.id,
                    qrCode: activeQrModal.qrCode,
                    item: activeQrModal.name,
                    container: activeQrModal.containerId,
                    destination: activeQrModal.destination,
                    status: activeQrModal.status
                  })}
                  size={176}
                  level="M"
                  includeMargin
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs font-mono font-bold">{activeQrModal.qrCode}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{activeQrModal.name}</div>
              </div>
            </div>

            {/* Chain of Custody History */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase text-slate-400">
                Verified Chain of Custody (Immutable Log):
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeQrModal.chainOfCustody?.map((log, i) => (
                  <div key={i} className="text-[11px] p-2 rounded bg-polar-950 border border-polar-800 text-slate-300">
                    <div className="flex justify-between font-mono text-[9px] text-cyan-400">
                      <span>{log.location}</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="font-medium text-white mt-0.5">{log.event}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Handler: {log.handler}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveQrModal(null)}
                className="bg-polar-800 hover:bg-polar-700 text-white text-xs px-4 py-2 rounded-lg font-medium"
              >
                Close Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Cargo Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCargo} className="frost-panel bg-polar-900 border border-polar-700 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-polar-800 pb-3">
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Register Cargo for Manifest
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Item Description</label>
              <input
                type="text"
                required
                value={newCargo.name}
                onChange={(e) => setNewCargo({ ...newCargo, name: e.target.value })}
                placeholder="e.g. Caterpillar Alternator Spare Assembly"
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Category</label>
                <select
                  value={newCargo.category}
                  onChange={(e) => setNewCargo({ ...newCargo, category: e.target.value })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Rations / Provisions">Rations / Provisions</option>
                  <option value="Fuel / POL">Fuel / POL (Arctic Kerosene)</option>
                  <option value="Medical / Life Support">Medical / Life Support</option>
                  <option value="Spare Parts / Engineering">Spare Parts / Engineering</option>
                  <option value="Scientific Equipment">Scientific Equipment</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Priority</label>
                <select
                  value={newCargo.priority}
                  onChange={(e) => setNewCargo({ ...newCargo, priority: e.target.value })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="Critical">Critical (Life Support/Fuel)</option>
                  <option value="Important">Important (Scientific/Spares)</option>
                  <option value="Normal">Normal (Routine Supplies)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  required
                  value={newCargo.weightKg}
                  onChange={(e) => setNewCargo({ ...newCargo, weightKg: Number(e.target.value) })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Volume (m³)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newCargo.volumeM3}
                  onChange={(e) => setNewCargo({ ...newCargo, volumeM3: Number(e.target.value) })}
                  className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Destination Base</label>
              <input
                type="text"
                value={newCargo.destination}
                onChange={(e) => setNewCargo({ ...newCargo, destination: e.target.value })}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-polar-800 text-slate-300 hover:text-white rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-polar-950 font-bold rounded-lg text-xs"
              >
                Register & Tag
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
