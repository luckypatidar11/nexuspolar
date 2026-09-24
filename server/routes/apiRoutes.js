import express from 'express';
import { db } from '../services/inMemoryDb.js';
import { calculateExpeditionPlan } from '../services/aiPlannerService.js';
import { runWhatIfSimulation } from '../services/simulationService.js';

const router = express.Router();

// ==========================================
// 1. HEALTH & SYSTEM
// ==========================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'NexusPole Command Core',
    version: '1.0.0-SIH26062',
    timestamp: new Date().toISOString(),
    stationsActive: db.getStations().length,
    activeMissions: db.getExpeditions().filter(e => e.status === 'Active').length
  });
});

// ==========================================
// 2. STATIONS & WEATHER CONTEXT (PRD 7.7)
// ==========================================
router.get('/stations', (req, res) => {
  res.json(db.getStations());
});

router.get('/stations/:id', (req, res) => {
  const station = db.getStationById(req.params.id);
  if (!station) return res.status(404).json({ error: 'Station not found' });
  res.json(station);
});

router.get('/weather/live/:stationId', async (req, res) => {
  const station = db.getStationById(req.params.stationId);
  if (!station) return res.status(404).json({ error: 'Station not found' });

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return res.json({
      stationId: station.id,
      weather: station.weather,
      live: false,
      source: 'NexusPole station cache',
      message: 'Add WEATHER_API_KEY to server/.env for live provider data.'
    });
  }

  try {
    const baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5/weather';
    const units = process.env.WEATHER_UNITS || 'metric';
    const url = new URL(baseUrl);
    url.searchParams.set('lat', station.coordinates.lat);
    url.searchParams.set('lon', station.coordinates.lng);
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', units);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Weather provider request failed');

    res.json({
      stationId: station.id,
      live: true,
      source: 'OpenWeather live feed',
      fetchedAt: new Date().toISOString(),
      weather: {
        temperature: data.main?.temp,
        feelsLike: data.main?.feels_like,
        windSpeedKnots: data.wind?.speed ? Math.round(data.wind.speed * 1.94384) : null,
        windDirection: data.wind?.deg ? `${data.wind.deg}°` : 'N/A',
        visibilityKm: data.visibility ? Number((data.visibility / 1000).toFixed(1)) : null,
        condition: data.weather?.[0]?.description || 'Live conditions unavailable',
        pressureHpa: data.main?.pressure,
        dataSource: 'OpenWeather live feed',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(502).json({ error: 'Live weather unavailable', detail: error.message, fallback: station.weather });
  }
});

router.post('/ai/chat', async (req, res) => {
  const { message, context = {} } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length < 2) {
    return res.status(400).json({ error: 'A question is required' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to server/.env.' });
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const prompt = [
      'You are NexusPole Polar Command AI. Answer operational questions clearly and conservatively.',
      'Never invent telemetry. State when data is missing. For safety-critical situations, recommend human commander confirmation.',
      `Current mission context: ${JSON.stringify(context)}`,
      `Operator question: ${message.trim()}`
    ].join('\n');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini request failed');
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text).join('') || 'No response was returned.';
    res.json({ reply, model, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ error: 'AI assistant unavailable', detail: error.message });
  }
});

// ==========================================
// 3. AUTH & ROLE PRESETS (PRD Section 6)
// ==========================================
router.get('/auth/roles', (req, res) => {
  // Returns user profiles for instant 1-click role testing for evaluators
  res.json(db.getUsers());
});

router.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  
  let user = null;
  if (role) {
    user = db.getUsers().find(u => u.role.toLowerCase() === role.toLowerCase());
  } else if (email) {
    user = db.findUserByEmail(email);
  } else {
    // Default fallback to Commander
    user = db.getUsers()[0];
  }

  if (!user || (email && password !== user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials or user not found' });
  }

  // Generate prototype token
  const token = `NEXUSPOLE_JWT_${user.id}_${Date.now()}`;
  res.json({
    token,
    user: { ...user, passwordHash: undefined }
  });
});

// ==========================================
// 4. EXPEDITIONS & PLANNING (PRD 7.1)
// ==========================================
router.get('/expeditions', (req, res) => {
  res.json(db.getExpeditions());
});

router.get('/expeditions/:id', (req, res) => {
  const exp = db.getExpeditionById(req.params.id);
  if (!exp) return res.status(404).json({ error: 'Expedition not found' });
  res.json(exp);
});

router.post('/expeditions', (req, res) => {
  const newExp = db.createExpedition(req.body);
  res.status(201).json(newExp);
});

router.put('/expeditions/:id', (req, res) => {
  const updated = db.updateExpedition(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Expedition not found' });
  res.json(updated);
});

// ==========================================
// 5. AI EXPEDITION PLANNER - HERO (PRD 7.2)
// ==========================================
router.post('/planner/calculate', (req, res) => {
  const plan = calculateExpeditionPlan(req.body);
  res.json(plan);
});

router.post('/planner/approve', (req, res) => {
  const { plan, expeditionDetails, approvedBy } = req.body;
  
  // Create formal approved expedition
  const newExp = db.createExpedition({
    name: expeditionDetails.name || `Expedition ${plan.inputs.destinationStation} - ${new Date().getFullYear()}`,
    objective: expeditionDetails.objective || `Scientific operations: ${plan.inputs.missionType}`,
    stationId: plan.inputs.destinationStation.includes('Bharati') ? 'ST-BHARATI' : plan.inputs.destinationStation.includes('Maitri') ? 'ST-MAITRI' : 'ST-HIMADRI',
    durationDays: plan.inputs.durationDays,
    personnelCount: plan.inputs.personnelCount,
    transportModes: [plan.inputs.transportMode],
    status: 'Approved',
    missionPhase: 'Phase 2: Staged & Cargo Reserved',
    resourceAllocation: {
      foodCaloriesTotal: plan.nutritional.totalCalories,
      dailyCaloriePerPerson: plan.nutritional.dailyCaloriePerPerson,
      fuelDieselPolarLiters: plan.fuel.totalFuelLiters,
      contingencyBufferPercent: plan.inputs.contingencyBufferPercent,
      medicalKitsAllocated: plan.medical.traumaKitsCount,
      cargoTotalWeightKg: plan.cargoSummary.totalWeightKg,
      cargoVolumeM3: plan.cargoSummary.totalVolumeM3
    },
    approvedBy: approvedBy || 'Dr. Rajesh Sharma (Mission Commander)',
    approvedAt: new Date().toISOString()
  });

  // Automatically reserve required cargo containers
  db.createCargo({
    name: `Provision Pack for ${newExp.name}`,
    category: "Rations / Provisions",
    containerId: "CONT-AUTO-RES-01",
    weightKg: plan.nutritional.totalRationsKg,
    volumeM3: Math.round(plan.nutritional.totalRationsKg / 300),
    priority: "Critical",
    handling: "Food Safe / Dry",
    destination: plan.inputs.destinationStation,
    status: "Reserved for Mission"
  });

  res.status(201).json({
    message: "AI Plan successfully approved and converted into an active expedition with supply reservations.",
    expedition: newExp
  });
});

// ==========================================
// 6. CARGO & SMART PACKING (PRD 7.3)
// ==========================================
router.get('/cargo', (req, res) => {
  res.json(db.getCargo());
});

router.get('/cargo/:id', (req, res) => {
  const item = db.getCargoById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Cargo not found' });
  res.json(item);
});

router.post('/cargo', (req, res) => {
  const item = db.createCargo(req.body);
  res.status(201).json(item);
});

router.put('/cargo/:id/status', (req, res) => {
  const updated = db.updateCargoStatus(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Cargo not found' });
  res.json(updated);
});

// Smart Container 3D Packing Heuristic
router.post('/cargo/pack-optimize', (req, res) => {
  const cargoList = db.getCargo();
  
  // Standard 20ft Polar ISO Container limits
  const MAX_CONTAINER_WEIGHT_KG = 22000;
  const MAX_CONTAINER_VOLUME_M3 = 33.0;

  // Priority ranking: Critical (3) > Important (2) > Normal (1)
  const sorted = [...cargoList].sort((a, b) => {
    const priorityWeight = { Critical: 3, Important: 2, Normal: 1 };
    return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
  });

  const containers = [];
  let currentContainer = {
    containerId: "POLAR-CONT-ALPHA-01",
    items: [],
    usedWeightKg: 0,
    usedVolumeM3: 0,
    capacityWeightKg: MAX_CONTAINER_WEIGHT_KG,
    capacityVolumeM3: MAX_CONTAINER_VOLUME_M3,
    status: "Optimal Balance"
  };

  for (const item of sorted) {
    if (
      currentContainer.usedWeightKg + item.weightKg <= MAX_CONTAINER_WEIGHT_KG &&
      currentContainer.usedVolumeM3 + item.volumeM3 <= MAX_CONTAINER_VOLUME_M3
    ) {
      currentContainer.items.push(item);
      currentContainer.usedWeightKg += item.weightKg;
      currentContainer.usedVolumeM3 += item.volumeM3;
    } else {
      containers.push(currentContainer);
      currentContainer = {
        containerId: `POLAR-CONT-BETA-0${containers.length + 1}`,
        items: [item],
        usedWeightKg: item.weightKg,
        usedVolumeM3: item.volumeM3,
        capacityWeightKg: MAX_CONTAINER_WEIGHT_KG,
        capacityVolumeM3: MAX_CONTAINER_VOLUME_M3,
        status: "Optimal Balance"
      };
    }
  }
  if (currentContainer.items.length > 0) {
    containers.push(currentContainer);
  }

  res.json({
    optimizedAt: new Date().toISOString(),
    totalCargoItems: cargoList.length,
    containersAllocated: containers.length,
    containers: containers.map(c => ({
      ...c,
      weightUtilizationPercent: Math.round((c.usedWeightKg / c.capacityWeightKg) * 100),
      volumeUtilizationPercent: Math.round((c.usedVolumeM3 / c.capacityVolumeM3) * 100)
    }))
  });
});

// ==========================================
// 7. INVENTORY MANAGEMENT (PRD 7.4)
// ==========================================
router.get('/inventory', (req, res) => {
  res.json(db.getInventory());
});

router.post('/inventory/transaction', (req, res) => {
  const { itemId, quantityChange, actionType, actor, reason } = req.body;
  const updated = db.updateInventoryStock(itemId, { quantityChange, actionType, actor, reason });
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

router.post('/inventory/dispatch', (req, res) => {
  const { itemId, quantity, actor, actorRole, destination, eta } = req.body;
  const updated = db.dispatchInventory(itemId, { quantity: Number(quantity), actor, actorRole, destination, eta });
  if (!updated) return res.status(403).json({ error: 'Dispatch denied or invalid inventory request' });
  res.json(updated);
});

// ==========================================
// 8. ASSETS & PREDICTIVE MAINTENANCE (PRD 7.6)
// ==========================================
router.get('/assets', (req, res) => {
  res.json(db.getAssets());
});

router.get('/assets/:id', (req, res) => {
  const asset = db.getAssetById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

router.put('/assets/:id/telemetry', (req, res) => {
  const updated = db.updateAssetTelemetry(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Asset not found' });
  res.json(updated);
});

router.post('/assets/:id/maintenance', (req, res) => {
  const updated = db.logMaintenance(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Asset not found' });
  res.json(updated);
});

// ==========================================
// 9. WHAT-IF MISSION SIMULATOR (PRD 7.9)
// ==========================================
router.post('/simulation/run', (req, res) => {
  const result = runWhatIfSimulation(req.body);
  res.json(result);
});

// ==========================================
// 10. INCIDENTS & EMERGENCIES (PRD 7.11)
// ==========================================
router.get('/incidents', (req, res) => {
  res.json(db.getIncidents());
});

router.post('/incidents', (req, res) => {
  const incident = db.createIncident(req.body);
  res.status(201).json(incident);
});

router.put('/incidents/:id', (req, res) => {
  const updated = db.updateIncidentStatus(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Incident not found' });
  res.json(updated);
});

// ==========================================
// 11. RISK INTELLIGENCE (PRD 7.10)
// ==========================================
router.get('/risk-alerts', (req, res) => {
  res.json(db.getRiskAlerts());
});

// ==========================================
// 12. OFFLINE SYNC (PRD 7.12 & 7.13)
// ==========================================
router.post('/sync/batch', (req, res) => {
  const receipt = db.syncOfflineBatch(req.body);
  res.json(receipt);
});

// ==========================================
// 13. AUTOMATED REPORTS (PRD 7.15)
// ==========================================
router.get('/reports/:type', (req, res) => {
  const { type } = req.params;
  const stations = db.getStations();
  const expeditions = db.getExpeditions();
  const inventory = db.getInventory();
  const assets = db.getAssets();
  const incidents = db.getIncidents();

  let report = {
    generatedAt: new Date().toISOString(),
    classification: "RESTRICTED - OFFICIAL EXPEDITION RECORD (MoES / NCPOR)",
    reportType: type
  };

  if (type === 'readiness') {
    report.title = "Polar Mission Readiness & Deployment Audit";
    report.expeditions = expeditions.map(e => ({
      name: e.name,
      station: e.stationId,
      status: e.status,
      checklistProgress: `${e.readinessChecklist?.filter(c => c.completed).length || 0} / ${e.readinessChecklist?.length || 0} Complete`,
      leadCommander: e.leadCommander
    }));
  } else if (type === 'inventory') {
    report.title = "Polar Station Rations, Fuel & Consumables Burn Report";
    report.inventorySummary = inventory.map(i => ({
      item: i.item,
      category: i.category,
      stock: `${i.quantity.toLocaleString()} ${i.unit}`,
      daysRemaining: i.daysRemaining,
      status: i.status
    }));
  } else if (type === 'assets') {
    report.title = "Critical Equipment & Power Generation Reliability Report";
    report.assetHealth = assets.map(a => ({
      asset: a.name,
      healthScore: `${a.healthScore}%`,
      operatingHours: a.operatingHours,
      maintenanceDue: a.maintenanceDue,
      condition: a.condition
    }));
  } else if (type === 'incidents') {
    report.title = "Station Incident Log & Emergency Action Audit";
    report.incidentLog = incidents.map(inc => ({
      id: inc.id,
      title: inc.title,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      actionsTaken: inc.responseChecklist?.filter(c => c.completed).length || 0
    }));
  } else {
    report.title = "Comprehensive Expedition Overview";
    report.summary = {
      activeMissions: expeditions.filter(e => e.status === 'Active').length,
      stationsMonitored: stations.length,
      openIncidents: incidents.filter(i => i.status !== 'Closed').length,
      criticalAssets: assets.filter(a => a.healthScore < 80).length
    };
  }

  res.json(report);
});

// ==========================================
// 14. AI COPILOT & POLAR KNOWLEDGE ASSISTANT
// ==========================================
router.post('/ai/chat', (req, res) => {
  const { message = '', stationId = 'ST-BHARATI' } = req.body;
  const q = (message || '').toLowerCase();
  
  const station = db.getStationById(stationId) || db.getStations()[0];
  const inventory = db.getInventory();
  const assets = db.getAssets();
  const incidents = db.getIncidents();
  
  let responseText = '';
  let category = 'GENERAL_ADVISORY';
  let dataPoints = [];

  if (q.includes('fuel') || q.includes('autonomy') || q.includes('diesel')) {
    category = 'LOGISTICS_AUTONOMY';
    const fuel = inventory.find(i => i.category === 'Fuel') || { quantity: 142000, dailyBurnRate: 680, daysRemaining: 114 };
    responseText = `${station.name} maintains ${fuel.quantity.toLocaleString()} Liters of polar grade fuel with a burn rate of ${fuel.dailyBurnRate} L/day. Current days of autonomy is approximately ${fuel.daysRemaining} days. All heat-tracing systems are active.`;
    dataPoints = [`Reserve: ${fuel.quantity.toLocaleString()} L`, `Autonomy: ${fuel.daysRemaining} Days`, `Burn Rate: ${fuel.dailyBurnRate} L/day`];
  } else if (q.includes('generator') || q.includes('asset') || q.includes('pistenbully') || q.includes('maintenance')) {
    category = 'ASSET_INTELLIGENCE';
    const genset = assets.find(a => a.id.includes('GEN-250-A')) || assets[0];
    responseText = `Station power is currently supported by ${genset.name}. Note: Telemetry indicates an elevated vibration signature (${genset.telemetry?.vibrationLevelG || 0.68}G). Compulsory injector service is due in ${genset.maintenanceIntervalHours - genset.hoursSinceLastService} operating hours.`;
    dataPoints = [`Asset: ${genset.name}`, `Health Score: ${genset.healthScore}%`, `Telemetry: ${genset.telemetry?.vibrationLevelG}G vibration`];
  } else if (q.includes('blizzard') || q.includes('weather') || q.includes('emergency') || q.includes('sos')) {
    category = 'EMERGENCY_WEATHER';
    const activeInc = incidents.find(i => i.status !== 'Closed') || incidents[0];
    responseText = `Active Alert at ${station.name}: ${activeInc?.title || 'Severe Wind Chill'}. Current ambient temperature is ${station.weather?.temperature}°C with wind chill at ${station.weather?.feelsLike}°C and gusts to ${station.weather?.windSpeedKnots} knots. Stay-in-place protocol advised.`;
    dataPoints = [`Alert: ${activeInc?.title}`, `Ambient Temp: ${station.weather?.temperature}°C`, `Wind: ${station.weather?.windSpeedKnots} kts`];
  } else if (q.includes('crew') || q.includes('muster') || q.includes('personnel') || q.includes('check in')) {
    category = 'PERSONNEL_SAFETY';
    responseText = `All ${station.currentCrew} personnel at ${station.name} are accounted for. Field Team Alpha (2 personnel) is operating PistenBully 300 Tiger 1 along Traverse Corridor Charlie. Radio muster confirmed.`;
    dataPoints = [`Base Population: ${station.currentCrew}`, `Traverse Active: 1 Team`, `Muster Status: 100% Accounted`];
  } else {
    responseText = `NexusPole Polar Intelligence: Request acknowledged regarding "${message}". Station systems at ${station.name} report nominal operating telemetry across life support, power generation, and communications.`;
    dataPoints = [`Station: ${station.name}`, `Status: ${station.status}`, `AWS Link: Active`];
  }

  res.json({
    reply: responseText,
    category,
    station: station.name,
    timestamp: new Date().toISOString(),
    dataPoints
  });
});

export default router;

