import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Boxes, 
  Truck, 
  AlertOctagon,
  Calendar
} from 'lucide-react';

export default function AutomatedReports() {
  const [reportType, setReportType] = useState('readiness');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reports/${type}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!reportData) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `NexusPole_${reportType}_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="frost-panel p-5 rounded-2xl bg-gradient-to-r from-polar-900 via-polar-850 to-polar-900 border-polar-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4 text-cyan-400" />
              PRD 7.15 Automated Mission Reports & Audits
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Polar Operational Reports & Compliance Logs
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Generate official MoES / NCPOR expedition compliance summaries, consumption ledgers, asset reliability reviews, and incident action post-mortems.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-polar-800 hover:bg-polar-700 text-white text-xs font-mono transition border border-polar-600"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-polar-950 text-xs font-bold font-mono transition"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'readiness', label: 'Mission Readiness Audit', icon: ShieldCheck },
          { id: 'inventory', label: 'Rations & Fuel Consumption', icon: Boxes },
          { id: 'assets', label: 'Equipment Health & Gensets', icon: Truck },
          { id: 'incidents', label: 'Emergency Incident Log', icon: AlertOctagon }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition shrink-0 ${
                reportType === tab.id
                  ? 'bg-cyan-500 text-polar-950 font-bold shadow-polar-glow'
                  : 'frost-panel text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Document Sheet */}
      <div className="frost-panel p-6 sm:p-8 rounded-2xl border border-polar-700/80 bg-polar-950/90 space-y-6 font-sans">
        
        {/* Document Header */}
        <div className="border-b-2 border-polar-700 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-polar-900 border border-polar-700 text-cyan-400 font-bold">
              {reportData?.classification || 'RESTRICTED - OFFICIAL RECORD'}
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              {reportData?.title || 'Expedition Report'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              National Centre for Polar and Ocean Research • Ministry of Earth Sciences
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Generated: {new Date(reportData?.generatedAt || Date.now()).toLocaleString()}</div>
            <div>Auth: NCPOR Security Token 26062-SEC</div>
          </div>
        </div>

        {/* Dynamic Report Content based on selected type */}
        {reportType === 'readiness' && reportData?.expeditions && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Active Expedition Roster & Checklist Status:
            </h3>
            <div className="space-y-3">
              {reportData.expeditions.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl bg-polar-900/60 border border-polar-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{exp.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Station: <span className="text-cyan-300 font-mono">{exp.station}</span> • Commander: {exp.leadCommander}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-polar-950 text-slate-200 border border-polar-700 text-[11px]">
                      {exp.checklistProgress}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {exp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'inventory' && reportData?.inventorySummary && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Station Consumables, Rations & Fuel Burn Ledger:
            </h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-polar-900 text-slate-400 font-mono uppercase text-[10px] border-b border-polar-800">
                <tr>
                  <th className="p-3">Consumable Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock on Hand</th>
                  <th className="p-3">Autonomy</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-polar-800">
                {reportData.inventorySummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-polar-900/40">
                    <td className="p-3 font-semibold text-white">{item.item}</td>
                    <td className="p-3 text-slate-400 font-mono">{item.category}</td>
                    <td className="p-3 font-mono text-cyan-300 font-bold">{item.stock}</td>
                    <td className="p-3 font-mono text-slate-200">{item.daysRemaining} Days</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-polar-900 border border-polar-700 text-slate-300">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'assets' && reportData?.assetHealth && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Power Generation & Glacier Fleet Reliability Audit:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportData.assetHealth.map((asset, i) => (
                <div key={i} className="p-4 rounded-xl bg-polar-900/60 border border-polar-800 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-sm">{asset.asset}</h4>
                    <span className="font-mono text-cyan-400 font-bold">{asset.healthScore}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Total Hours: {asset.operatingHours} hrs • {asset.maintenanceDue}
                  </div>
                  <div className="text-[11px] text-slate-300">Condition: {asset.condition}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'incidents' && reportData?.incidentLog && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Emergency Incident Log & Corrective Actions Audit:
            </h3>
            <div className="space-y-2">
              {reportData.incidentLog.map((inc, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-polar-900/60 border border-polar-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {inc.id} • {inc.type} • {inc.severity} Severity
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="px-2 py-0.5 rounded bg-polar-950 text-cyan-300 border border-polar-700 text-[10px]">
                      {inc.actionsTaken} Actions Completed
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{inc.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Sign-off Footer */}
        <div className="pt-6 border-t border-polar-800 flex flex-col sm:flex-row justify-between text-xs text-slate-400 font-mono gap-4">
          <div>
            Verified By: Dr. Rajesh Sharma (Mission Commander)<br />
            Sign: [ELECTRONIC AUDIT HASH: e4b29c9a87d1]
          </div>
          <div className="text-right">
            National Centre for Polar & Ocean Research (NCPOR)<br />
            Headquarters: Vasco da Gama, Goa, India
          </div>
        </div>

      </div>

    </div>
  );
}
