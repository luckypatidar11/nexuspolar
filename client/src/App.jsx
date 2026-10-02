import React, { useState, useEffect } from 'react';
import { apiFetch } from './api';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SituationalOverview from './components/SituationalOverview';
import AIExpeditionPlanner from './components/AIExpeditionPlanner';
import WhatIfSimulator from './components/WhatIfSimulator';
import CargoSmartPacking from './components/CargoSmartPacking';
import InventoryManager from './components/InventoryManager';
import ShipmentTracking from './components/ShipmentTracking';
import AssetPredictiveManager from './components/AssetPredictiveManager';
import PersonnelSafetyMuster from './components/PersonnelSafetyMuster';
import EmergencyResponse from './components/EmergencyResponse';
import RiskIntelligence from './components/RiskIntelligence';
import VoiceAssistant from './components/VoiceAssistant';
import AutomatedReports from './components/AutomatedReports';
import OfflineSyncCenter from './components/OfflineSyncCenter';
import WeatherIntelligence from './components/WeatherIntelligence';
import MissionIntelligence from './components/MissionIntelligence';
import GeofencedSafetyZones from './components/GeofencedSafetyZones';
import AIPolarChat from './components/AIPolarChat';
import FloatingAIChat from './components/FloatingAIChat';
import CommandPalette from './components/CommandPalette';
import { WifiOff } from 'lucide-react';

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStation, setSelectedStation] = useState('ST-BHARATI');
  const [stations, setStations] = useState([]);
  const [expeditions, setExpeditions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [cargo, setCargo] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isOffline, offlineQueue, toggleOfflineMode } = useOffline();
  const { currentUser, canAccess } = useAuth();

  const loadData = async () => {
    try {
      const [stRes, expRes, astRes, incRes, rskRes, cargoRes, invRes] = await Promise.all([
        apiFetch('/api/stations').then(r => r.json()).catch(() => []),
        apiFetch('/api/expeditions').then(r => r.json()).catch(() => []),
        apiFetch('/api/assets').then(r => r.json()).catch(() => []),
        apiFetch('/api/incidents').then(r => r.json()).catch(() => []),
        apiFetch('/api/risk-alerts').then(r => r.json()).catch(() => []),
        apiFetch('/api/cargo').then(r => r.json()).catch(() => []),
        apiFetch('/api/inventory').then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(stRes) && stRes.length > 0) setStations(stRes);
      if (Array.isArray(expRes)) setExpeditions(expRes);
      if (Array.isArray(astRes)) setAssets(astRes);
      if (Array.isArray(incRes)) setIncidents(incRes);
      if (Array.isArray(rskRes)) setRiskAlerts(rskRes);
      if (Array.isArray(cargoRes)) setCargo(cargoRes);
      if (Array.isArray(invRes)) setInventory(invRes);
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  useEffect(() => {
    if (!canAccess(activeTab)) {
      setActiveTab('overview');
    }
  }, [activeTab, canAccess]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // Polling telemetry
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen app-shell flex flex-col text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Top Offline Mode Notice Banner (Visible when simulating Antarctica Field Disconnection) */}
      {isOffline && (
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-bold px-4 py-2 text-[11px] tracking-wide shadow-[0_10px_30px_rgba(251,191,36,0.25)] z-50">
          <div className="flex items-center gap-2 max-w-[1920px] mx-auto w-full">
            <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
            <span>
              POLAR FIELD MODE ACTIVE: Iridium connection suspended. All check-ins, inventory transactions, and logs are caching locally ({offlineQueue.length} operations queued).
            </span>
          </div>
        </div>
      )}

      {/* Main Command Navbar */}
      <Navbar
        selectedStation={selectedStation}
        onSelectStation={setSelectedStation}
        stations={stations}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Workspace with Sidebar & Dynamic Viewport */}
      <div className="flex-1 flex overflow-hidden gap-3 p-2 sm:p-3 lg:p-4">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          canAccess={canAccess}
          alertCount={riskAlerts.length}
          incidentCount={incidents.filter(i => i.status !== 'Closed').length}
          pendingSyncCount={offlineQueue.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 max-w-[1800px] mx-auto w-full workspace-viewport workspace-compact rounded-2xl border border-white/5 backdrop-blur-md">
          {activeTab === 'overview' && (
            <SituationalOverview
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              expeditions={expeditions}
              assets={assets}
              cargo={cargo}
              inventory={inventory}
              riskAlerts={riskAlerts}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherIntelligence
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          )}

          {activeTab === 'mission' && (
            <MissionIntelligence
              expeditions={expeditions}
              assets={assets}
              incidents={incidents}
            />
          )}

          {activeTab === 'geofence' && (
            <GeofencedSafetyZones
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          )}

          {activeTab === 'ai-chat' && (
            <AIPolarChat stations={stations} selectedStation={selectedStation} />
          )}

          {activeTab === 'planner' && (
            <AIExpeditionPlanner onExpeditionCreated={loadData} />
          )}

          {activeTab === 'whatif' && (
            <WhatIfSimulator
              selectedStation={selectedStation}
              stations={stations}
            />
          )}

          {activeTab === 'cargo' && (
            <CargoSmartPacking />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager />
          )}

          {activeTab === 'shipments' && (
            <ShipmentTracking />
          )}

          {activeTab === 'assets' && (
            <AssetPredictiveManager />
          )}

          {activeTab === 'personnel' && (
            <PersonnelSafetyMuster />
          )}

          {activeTab === 'emergency' && (
            <EmergencyResponse selectedStation={selectedStation} />
          )}

          {activeTab === 'risk' && (
            <RiskIntelligence />
          )}

          {activeTab === 'voice' && (
            <VoiceAssistant onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'reports' && (
            <AutomatedReports />
          )}

          {activeTab === 'sync' && (
            <OfflineSyncCenter />
          )}
        </main>

      </div>

      {/* Floating AI Polar Assistant */}
      <FloatingAIChat station={stations.find(station => station.id === selectedStation) || stations[0]} />

      {/* Global Quick Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        onSelectStation={setSelectedStation}
        stations={stations}
        toggleOfflineMode={toggleOfflineMode}
        isOffline={isOffline}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { currentUser } = useAuth();

  if (!currentUser) return <Login />;

  return (
    <OfflineProvider>
      <DashboardLayout />
    </OfflineProvider>
  );
}
