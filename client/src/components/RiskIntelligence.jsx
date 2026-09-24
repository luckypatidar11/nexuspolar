import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  HelpCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Package,
  Wrench
} from 'lucide-react';

export default function RiskIntelligence() {
  const [alerts, setAlerts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [cargo, setCargo] = useState([]);
  const [assets, setAssets] = useState([]);

  const loadAlerts = async () => {
    try {
      const [riskRes, inventoryRes, cargoRes, assetsRes] = await Promise.all([
        fetch('/api/risk-alerts'),
        fetch('/api/inventory'),
        fetch('/api/cargo'),
        fetch('/api/assets')
      ]);
      const [riskData, inventoryData, cargoData, assetsData] = await Promise.all([
        riskRes.json(), inventoryRes.json(), cargoRes.json(), assetsRes.json()
      ]);
      setAlerts(Array.isArray(riskData) ? riskData : []);
      setInventory(Array.isArray(inventoryData) ? inventoryData : []);
      setCargo(Array.isArray(cargoData) ? cargoData : []);
      setAssets(Array.isArray(assetsData) ? assetsData : []);
    } catch (err) {
      console.error("Failed to load risk alerts:", err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const smartAlerts = [
    ...inventory.filter(item => item.quantity <= item.emergencyReserve).map(item => ({
      id: `AUTO-STOCK-${item.id}`,
      title: `${item.item} below emergency reserve`,
      category: 'Inventory Threshold',
      severity: 'High',
      recipientTeam: 'Logistics & Medical',
      threshold: `Emergency reserve: ${item.emergencyReserve} ${item.unit}`,
      reasons: [
        `Current stock is ${item.quantity.toLocaleString()} ${item.unit}.`,
        `Emergency floor breached by ${Math.max(0, item.emergencyReserve - item.quantity).toLocaleString()} ${item.unit}.`
      ],
      mitigation: `Create replenishment dispatch for ${item.location} and protect remaining reserve stock.`,
      sourceTimestamp: new Date().toISOString(),
      icon: Package
    })),
    ...inventory.filter(item => item.quantity > item.emergencyReserve && item.quantity <= item.minThreshold).map(item => ({
      id: `AUTO-LOW-${item.id}`,
      title: `${item.item} approaching minimum stock`,
      category: 'Inventory Threshold',
      severity: 'Medium',
      recipientTeam: 'Logistics',
      threshold: `Minimum threshold: ${item.minThreshold} ${item.unit}`,
      reasons: [
        `Current stock is ${item.quantity.toLocaleString()} ${item.unit}.`,
        `Projected autonomy is ${item.daysRemaining || 'unknown'} days at the current burn rate.`
      ],
      mitigation: `Schedule replenishment before the next resupply window and review daily consumption.`,
      sourceTimestamp: new Date().toISOString(),
      icon: Package
    })),
    ...cargo.filter(item => item.status === 'Delayed' || Number(item.delayDays) > 0).map(item => ({
      id: `AUTO-SHIP-${item.id}`,
      title: `${item.name} shipment delayed`,
      category: 'Shipment Threshold',
      severity: item.priority === 'Critical' ? 'High' : 'Medium',
      recipientTeam: 'Logistics Control',
      threshold: `Delay threshold exceeded: ${item.delayDays || 'reported'} days`,
      reasons: [
        `Consignment status is ${item.status}.`,
        `Destination: ${item.destination || 'station receiving dock'}.`
      ],
      mitigation: 'Recalculate station autonomy, notify receiving station, and activate alternate routing if required.',
      sourceTimestamp: new Date().toISOString(),
      icon: Package
    })),
    ...assets.filter(asset => asset.healthScore < 80 || asset.telemetry?.vibrationLevelG > 0.5 || asset.maintenanceDue?.includes('Urgent')).map(asset => ({
      id: `AUTO-ASSET-${asset.id}`,
      title: `${asset.name} requires maintenance attention`,
      category: 'Equipment Fault',
      severity: asset.healthScore < 75 || asset.telemetry?.vibrationLevelG > 0.6 ? 'High' : 'Medium',
      recipientTeam: 'Asset Maintenance',
      threshold: `Health ${asset.healthScore}% • vibration ${asset.telemetry?.vibrationLevelG || 'n/a'}G`,
      reasons: [
        `Predictive health score is ${asset.healthScore}%.`,
        asset.maintenanceDue ? `Service status: ${asset.maintenanceDue}.` : `Vibration threshold requires inspection.`
      ],
      mitigation: `Move ${asset.name} to controlled load and open a preventive maintenance work order.`,
      sourceTimestamp: new Date().toISOString(),
      icon: Wrench
    }))
  ];
  const allAlerts = [...smartAlerts, ...alerts];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-polar-900 to-polar-900 border-orange-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              PRD 7.10 Risk Intelligence Engine
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Explainable Risk & Operational Decision Support
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Unlike opaque automated black-boxes, NexusPole provides explainable risk signals where every alert discloses multiple underlying sensor telemetry checkpoints, historical benchmarks, and concrete mitigation steps.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-orange-950 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold">
            {allAlerts.length} Active System Risks Monitored
          </div>
        </div>
      </div>

      {/* Risk Alert Cards */}
      <div className="space-y-4">
        {allAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`frost-panel p-5 rounded-2xl space-y-4 border-l-4 ${
              alert.severity === 'High' ? 'border-l-red-500' : 'border-l-amber-400'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-polar-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-polar-950 text-cyan-400 border border-polar-700">
                    {alert.id} • {alert.category}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    alert.severity === 'High' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    {alert.severity} Severity
                  </span>
                  {alert.recipientTeam && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      ROUTE: {alert.recipientTeam}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5">
                  {alert.title}
                </h3>
              </div>

              <div className="text-right text-xs font-mono text-slate-400">
                <span className="block text-[10px] uppercase text-slate-500">Source Timestamp</span>
                <span>{new Date(alert.sourceTimestamp).toLocaleString()}</span>
              </div>
            </div>

            {alert.threshold && (
              <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-950/20 border border-amber-500/20 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span><strong className="font-mono uppercase text-[10px] text-amber-300">Triggered threshold:</strong> {alert.threshold}</span>
              </div>
            )}

            {/* Explainable Reasoning (PRD Requirement: At least 2 supporting reasons) */}
            <div className="bg-polar-950/70 p-3.5 rounded-xl border border-polar-800 space-y-2">
              <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deterministic Supporting Reasons ({alert.reasons?.length || 0} Data Points):</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {alert.reasons?.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono font-bold mt-0.5">[{idx + 1}]</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Action / Mitigation */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300 uppercase font-mono block">Recommended Commander Mitigation:</span>
                <span className="text-slate-200 mt-0.5 block">{alert.mitigation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
