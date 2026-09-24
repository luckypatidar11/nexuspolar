// Polar Digital Twin & What-If Disruption Simulation Service
// Evaluates station resilience, Days of Autonomy (DoA), and constraint violations

import { db } from './inMemoryDb.js';

export function runWhatIfSimulation(scenario) {
  const {
    stationId = "ST-BHARATI",
    cargoDelayDays = 0,
    fuelLossPercent = 0,
    extraPersonnel = 0,
    generatorFailure = false,
    blizzardDurationDays = 0,
    waterSystemDegraded = false
  } = scenario;

  const station = db.getStationById(stationId) || db.getStations()[0];
  const stationInventory = db.getInventory();
  
  // Baseline parameters
  const currentCrew = station.currentCrew + extraPersonnel;
  const fuelItem = stationInventory.find(i => i.category === "Fuel") || { quantity: 142000, dailyBurnRate: 680 };
  const rationItem = stationInventory.find(i => i.category === "Food/Rations") || { quantity: 5800, dailyBurnRate: 36 };

  // Adjust baseline fuel based on loss percentage
  const effectiveFuel = Math.round(fuelItem.quantity * (1 - (fuelLossPercent / 100)));
  
  // Daily fuel consumption adjustments
  // In a blizzard, heating load spikes +25%
  // If primary generator fails, auxiliary standby might be less efficient (+15% fuel burn)
  let dailyFuelBurn = fuelItem.dailyBurnRate;
  if (blizzardDurationDays > 0) dailyFuelBurn *= 1.25;
  if (generatorFailure) dailyFuelBurn *= 1.15;
  // Crew scaling
  dailyFuelBurn *= (currentCrew / (station.currentCrew || 24));

  // Daily ration burn adjustments
  const dailyRationBurn = (rationItem.dailyBurnRate / (station.currentCrew || 24)) * currentCrew;

  // Calculate new Days of Autonomy (DoA)
  const fuelDoA = Math.floor(effectiveFuel / dailyFuelBurn);
  const rationDoA = Math.floor(rationItem.quantity / dailyRationBurn);
  const overallDoA = Math.min(fuelDoA, rationDoA);

  // Constraint Violations & Critical Risks
  const violations = [];
  const alternativeOptions = [];

  // Check resupply threshold vs cargo delay
  const baselineResupplyDays = 45;
  const effectiveResupplyDays = baselineResupplyDays + cargoDelayDays;

  if (overallDoA < effectiveResupplyDays) {
    violations.push({
      severity: "CRITICAL",
      type: "DEPLETION_BEFORE_RESUPPLY",
      message: `Projected Days of Autonomy (${overallDoA} days) is less than the delayed resupply window (${effectiveResupplyDays} days)! Deficit of ${effectiveResupplyDays - overallDoA} days.`
    });
  }

  if (effectiveFuel <= (fuelItem.emergencyReserve || 30000)) {
    violations.push({
      severity: "CRITICAL",
      type: "FUEL_RESERVE_BREACH",
      message: `Fuel levels drop below mandatory NCPOR station emergency reserve (${fuelItem.emergencyReserve.toLocaleString()} L). Risk of habitat freeze.`
    });
  }

  if (generatorFailure) {
    violations.push({
      severity: "HIGH",
      type: "REDUNDANCY_LOSS",
      message: "Station running on single backup generator (Gen-B). No secondary redundancy remains during sub-zero operational window."
    });
    alternativeOptions.push("Initiate Emergency Load Shedding: Cut power to outdoor seismic drills and sample freezers.");
    alternativeOptions.push("Schedule immediate swap with spare caterpillar alternator from Bay 3.");
  }

  if (cargoDelayDays > 14) {
    violations.push({
      severity: "MEDIUM",
      type: "SUPPLY_CHAIN_SLIPPAGE",
      message: `Cargo vessel delayed by ${cargoDelayDays} days due to sea ice pack. Critical spares and fresh consumables postponed.`
    });
    alternativeOptions.push("Ration specialized consumables to 70% standard issue.");
    alternativeOptions.push("Request emergency aerial paradrop from Cape Town via ski-equipped transport.");
  }

  if (blizzardDurationDays >= 5) {
    violations.push({
      severity: "HIGH",
      type: "FIELD_EXTRICATON_IMPOSSIBLE",
      message: `Blizzard lasting ${blizzardDurationDays} days grounds all air support and locks traverse teams in shelter.`
    });
    alternativeOptions.push("Enforce strict indoor stay-in-place protocol; maintain radio muster every 2 hours.");
  }

  if (extraPersonnel > 5) {
    violations.push({
      severity: "MEDIUM",
      type: "LIFE_SUPPORT_CAPACITY_STRESS",
      message: `Station crew increased by +${extraPersonnel} (Total: ${currentCrew} / Max Capacity: ${station.capacity}). Water melt requirements increase significantly.`
    });
    alternativeOptions.push("Commission auxiliary snowmelter and ration water usage to 50L/person/day.");
  }

  // Generate 60-day projection trajectory for charts
  const projectionTimeline = [];
  let simulatedFuel = effectiveFuel;
  let simulatedRations = rationItem.quantity;
  
  for (let day = 0; day <= 60; day += 5) {
    projectionTimeline.push({
      day: `Day ${day}`,
      fuelRemaining: Math.max(0, Math.round(simulatedFuel)),
      rationsRemaining: Math.max(0, Math.round(simulatedRations)),
      fuelThreshold: fuelItem.emergencyReserve || 30000,
      rationsThreshold: rationItem.emergencyReserve || 1000,
      isResupplyDay: day === effectiveResupplyDays
    });
    simulatedFuel -= (dailyFuelBurn * 5);
    simulatedRations -= (dailyRationBurn * 5);
  }

  const baselineDoA = station.lifeSupport?.daysOfAutonomy || 114;
  const deltaDays = overallDoA - baselineDoA;

  return {
    simulatedAt: new Date().toISOString(),
    stationName: station.name,
    scenarioInputs: {
      cargoDelayDays,
      fuelLossPercent,
      extraPersonnel,
      generatorFailure,
      blizzardDurationDays,
      waterSystemDegraded
    },
    metrics: {
      baselineDoA,
      simulatedDoA: overallDoA,
      deltaDays,
      effectiveCrew: currentCrew,
      projectedDailyFuelBurn: Math.round(dailyFuelBurn),
      projectedDailyRationBurn: Math.round(dailyRationBurn),
      resupplyArrivalDay: effectiveResupplyDays,
      status: violations.some(v => v.severity === "CRITICAL") ? "CRITICAL_DEFICIT" : violations.length > 0 ? "ELEVATED_RISK" : "NOMINAL"
    },
    violations,
    alternativeOptions,
    projectionTimeline
  };
}
