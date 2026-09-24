import {
  stations as initialStations,
  users as initialUsers,
  expeditions as initialExpeditions,
  cargoItems as initialCargo,
  inventory as initialInventory,
  assets as initialAssets,
  incidents as initialIncidents,
  riskAlerts as initialRiskAlerts
} from '../data/seedData.js';

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

class PolarDatabase {
  constructor() {
    this.stations = clone(initialStations);
    this.users = clone(initialUsers);
    this.expeditions = clone(initialExpeditions);
    this.cargo = clone(initialCargo);
    this.inventory = clone(initialInventory).map(item => ({
      ...item,
      inTransit: item.inTransit || 0,
      lastDispatch: item.lastDispatch || null
    }));
    this.assets = clone(initialAssets);
    this.incidents = clone(initialIncidents);
    this.riskAlerts = clone(initialRiskAlerts);
    this.syncEvents = [];
    this.fieldObservations = [];
  }

  // --- STATIONS ---
  getStations() {
    return this.stations;
  }
  getStationById(id) {
    return this.stations.find(s => s.id === id);
  }

  // --- USERS & AUTH ---
  getUsers() {
    return this.users.map(({ passwordHash, ...u }) => u);
  }
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserById(id) {
    const u = this.users.find(u => u.id === id);
    if (!u) return null;
    const { passwordHash, ...safe } = u;
    return safe;
  }

  // --- EXPEDITIONS ---
  getExpeditions() {
    return this.expeditions;
  }
  getExpeditionById(id) {
    return this.expeditions.find(e => e.id === id);
  }
  createExpedition(data) {
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}-${data.stationId ? data.stationId.replace('ST-', '') : 'POLAR'}`,
      startDate: new Date().toISOString().split('T')[0],
      status: "Planning",
      missionPhase: "Phase 1: Mission Staging & Resource Allocation",
      readinessChecklist: [
        { id: `rc-${Date.now()}-1`, task: "Pre-departure medical screening", completed: true, verifiedBy: "CMO" },
        { id: `rc-${Date.now()}-2`, task: "VHF and Iridium Satellite beacon test", completed: false, verifiedBy: "Communications Officer" },
        { id: `rc-${Date.now()}-3`, task: "Emergency reserve rations sealed", completed: false, verifiedBy: "Logistics Lead" }
      ],
      ...data
    };
    this.expeditions.unshift(newExp);
    return newExp;
  }
  updateExpedition(id, updateData) {
    const idx = this.expeditions.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.expeditions[idx] = { ...this.expeditions[idx], ...updateData };
    return this.expeditions[idx];
  }

  // --- CARGO ---
  getCargo() {
    return this.cargo;
  }
  getCargoById(id) {
    return this.cargo.find(c => c.id === id || c.qrCode === id);
  }
  createCargo(data) {
    const id = `CRG-${new Date().getFullYear()}-${String(this.cargo.length + 1).padStart(3, '0')}`;
    const newCargo = {
      id,
      qrCode: `NP-${id}-${(data.name || 'CARGO').toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 15)}`,
      status: "Staged for Manifest",
      chainOfCustody: [
        {
          timestamp: new Date().toISOString(),
          location: data.origin || "NCPOR Goa",
          handler: data.createdBy || "Logistics Desk",
          event: "Registered in NexusPole Manifest"
        }
      ],
      ...data
    };
    this.cargo.unshift(newCargo);
    return newCargo;
  }
  updateCargoStatus(id, { status, location, handler, eventNote }) {
    const item = this.cargo.find(c => c.id === id || c.qrCode === id);
    if (!item) return null;
    if (status) item.status = status;
    item.chainOfCustody.push({
      timestamp: new Date().toISOString(),
      location: location || item.destination,
      handler: handler || "Logistics Officer",
      event: eventNote || `Status updated to ${status}`
    });
    return item;
  }

  // --- INVENTORY ---
  getInventory() {
    return this.inventory;
  }
  getInventoryById(id) {
    return this.inventory.find(i => i.id === id);
  }
  updateInventoryStock(id, { quantityChange, actionType, actor, reason }) {
    const item = this.inventory.find(i => i.id === id);
    if (!item) return null;
    const prevQty = item.quantity;
    item.quantity = Math.max(0, item.quantity + quantityChange);
    item.daysRemaining = item.dailyBurnRate > 0 ? Math.round(item.quantity / item.dailyBurnRate) : 999;
    
    // Check threshold alerts
    if (item.quantity <= item.emergencyReserve) {
      item.status = "Critical Emergency Reserve Breach";
    } else if (item.quantity <= item.minThreshold) {
      item.status = "Low Stock Alert";
    } else {
      item.status = "Optimal";
    }

    this.syncEvents.push({
      id: `SYNC-${Date.now()}`,
      type: "INVENTORY_TRANSACTION",
      itemId: id,
      item: item.item,
      change: quantityChange,
      prevQuantity: prevQty,
      newQuantity: item.quantity,
      actor: actor || "Field Logistics",
      reason: reason || actionType || "Standard Consumption",
      timestamp: new Date().toISOString()
    });

    return item;
  }

  dispatchInventory(id, { quantity, actor, actorRole, destination, eta }) {
    const item = this.inventory.find(i => i.id === id);
    const allowedRoles = ['Logistics Officer', 'Mission Commander', 'System Administrator'];
    if (!item || !allowedRoles.includes(actorRole) || !Number.isFinite(quantity) || quantity <= 0) return null;

    item.inTransit = (item.inTransit || 0) + quantity;
    item.lastDispatch = {
      quantity,
      destination: destination || 'Bharati Station - Main Bunker',
      eta: eta || 'Pending manifest confirmation',
      actor: actor || 'Logistics Desk',
      timestamp: new Date().toISOString()
    };
    this.syncEvents.unshift({
      id: `SYNC-${Date.now()}`,
      type: 'INVENTORY_DISPATCH',
      itemId: id,
      item: item.item,
      change: quantity,
      newInTransit: item.inTransit,
      actor: actor || 'Logistics Desk',
      destination: item.lastDispatch.destination,
      eta: item.lastDispatch.eta,
      timestamp: item.lastDispatch.timestamp
    });
    return item;
  }

  // --- ASSETS ---
  getAssets() {
    return this.assets;
  }
  getAssetById(id) {
    return this.assets.find(a => a.id === id || a.qrCode === id);
  }
  updateAssetTelemetry(id, telemetryUpdate) {
    const asset = this.assets.find(a => a.id === id || a.qrCode === id);
    if (!asset) return null;
    asset.telemetry = { ...asset.telemetry, ...telemetryUpdate };
    
    // Automatic anomaly check
    if (asset.telemetry.vibrationLevelG > 0.6 || asset.telemetry.engineTempC > 95) {
      asset.condition = "Critical Anomaly Detected";
      asset.healthScore = Math.max(40, asset.healthScore - 15);
    }
    return asset;
  }
  logMaintenance(id, { task, technician, notes }) {
    const asset = this.assets.find(a => a.id === id || a.qrCode === id);
    if (!asset) return null;
    asset.recentMaintenance.unshift({
      date: new Date().toISOString().split('T')[0],
      task,
      technician: technician || "Asset Engineer",
      notes: notes || "Routine polar inspection"
    });
    asset.hoursSinceLastService = 0;
    asset.healthScore = Math.min(100, asset.healthScore + 20);
    asset.condition = "Good";
    delete asset.predictiveAlert;
    return asset;
  }

  // --- INCIDENTS & EMERGENCIES ---
  getIncidents() {
    return this.incidents;
  }
  getIncidentById(id) {
    return this.incidents.find(inc => inc.id === id);
  }
  createIncident(data) {
    const id = `INC-${new Date().getFullYear()}-${String(this.incidents.length + 1).padStart(3, '0')}`;
    
    // Generate specialized structured checklist based on incident type
    let autoChecklist = [
      { id: "st-1", task: "Sound Station General Alarm & Muster all base personnel", completed: true },
      { id: "st-2", task: "Designate Emergency Response Leader and establish comms log", completed: true },
      { id: "st-3", task: "Log weather conditions and barometric wind vector", completed: false }
    ];

    if (data.type?.toLowerCase().includes("blizzard") || data.type?.toLowerCase().includes("weather")) {
      autoChecklist.push(
        { id: "st-4", task: "Seal all exterior airlock doors and deploy safety guide-ropes", completed: false },
        { id: "st-5", task: "Verify standby generator Gen-B pre-heat cycle", completed: false },
        { id: "st-6", task: "Check status of all field traverse teams outside 1km perimeter", completed: false }
      );
    } else if (data.type?.toLowerCase().includes("medical") || data.type?.toLowerCase().includes("hypothermia")) {
      autoChecklist.push(
        { id: "st-4", task: "Warm medical resuscitation suite & prep warm IV saline", completed: false },
        { id: "st-5", task: "Notify NCPOR CMO in Goa for satellite telemedicine triage", completed: false },
        { id: "st-6", task: "Stand by Twin Otter / Helicopter for emergency aeromedical evacuation", completed: false }
      );
    } else if (data.type?.toLowerCase().includes("power") || data.type?.toLowerCase().includes("generator")) {
      autoChecklist.push(
        { id: "st-4", task: "Shed non-essential laboratory heating loads", completed: false },
        { id: "st-5", task: "Auto-synchronize backup Genset Gen-B onto 415V busbar", completed: false },
        { id: "st-6", task: "Inspect fuel supply lines for paraffin crystallization", completed: false }
      );
    }

    const newInc = {
      id,
      status: "Open",
      createdAt: new Date().toISOString(),
      responseChecklist: autoChecklist,
      timeline: [
        {
          timestamp: new Date().toISOString(),
          actor: data.reportedBy || "System Alert",
          note: `Incident declared: ${data.title}`
        }
      ],
      ...data
    };
    this.incidents.unshift(newInc);
    return newInc;
  }
  updateIncidentStatus(id, { status, checklistStepId, checklistCompleted, actor, note }) {
    const inc = this.incidents.find(i => i.id === id);
    if (!inc) return null;

    if (status) inc.status = status;
    if (checklistStepId !== undefined) {
      const step = inc.responseChecklist.find(s => s.id === checklistStepId);
      if (step) step.completed = checklistCompleted;
    }
    if (note) {
      inc.timeline.unshift({
        timestamp: new Date().toISOString(),
        actor: actor || "Command Desk",
        note
      });
    }
    return inc;
  }

  // --- RISK ALERTS ---
  getRiskAlerts() {
    return this.riskAlerts;
  }

  // --- OFFLINE FIELD SYNC & OBSERVATIONS ---
  syncOfflineBatch({ clientDeviceId, timestamp, operations }) {
    const applied = [];
    const conflicts = [];

    for (const op of (operations || [])) {
      try {
        if (op.type === "CHECK_IN") {
          // Personnel check-in
          const user = this.users.find(u => u.name === op.personnelName || u.id === op.personnelId);
          if (user) {
            user.lastCheckIn = op.timestamp || new Date().toISOString();
            user.status = "Active / Field Verified";
            applied.push({ opId: op.id, status: "SUCCESS", detail: `Check-in recorded for ${user.name}` });
          } else {
            applied.push({ opId: op.id, status: "SUCCESS", detail: `Field check-in logged for ${op.personnelName}` });
          }
        } else if (op.type === "INVENTORY_CONSUMPTION") {
          const item = this.inventory.find(i => i.id === op.itemId);
          if (item) {
            this.updateInventoryStock(item.id, {
              quantityChange: -Math.abs(op.quantity),
              actor: op.actor || "Offline Field User",
              reason: op.reason || "Offline field transaction"
            });
            applied.push({ opId: op.id, status: "SUCCESS", detail: `Consumed ${op.quantity} of ${item.item}` });
          } else {
            conflicts.push({ opId: op.id, reason: `Item ID ${op.itemId} not found on server` });
          }
        } else if (op.type === "FIELD_OBSERVATION") {
          this.fieldObservations.unshift({
            id: `OBS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ...op,
            receivedAt: new Date().toISOString()
          });
          applied.push({ opId: op.id, status: "SUCCESS", detail: `Field observation saved: ${op.observationType || 'General'}` });
        } else if (op.type === "ASSET_TELEMETRY") {
          const asset = this.getAssetById(op.assetId);
          if (asset) {
            this.updateAssetTelemetry(op.assetId, op.telemetry);
            applied.push({ opId: op.id, status: "SUCCESS", detail: `Telemetry updated for ${asset.name}` });
          }
        }
      } catch (err) {
        conflicts.push({ opId: op.id, error: err.message });
      }
    }

    const syncReceipt = {
      syncId: `SYNC-BATCH-${Date.now()}`,
      clientDeviceId,
      serverTime: new Date().toISOString(),
      appliedCount: applied.length,
      conflictsCount: conflicts.length,
      applied,
      conflicts
    };

    this.syncEvents.unshift(syncReceipt);
    return syncReceipt;
  }
}

export const db = new PolarDatabase();
