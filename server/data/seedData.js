// Seed Data for NexusPole (SIH 26062 / MoES / NCPOR)
// Covers Bharati (Antarctica), Maitri (Antarctica), and Himadri (Arctic)

export const stations = [
  {
    id: "ST-BHARATI",
    name: "Bharati Station",
    location: "Larsemann Hills, East Antarctica",
    coordinates: { lat: -69.4072, lng: 76.1958 },
    type: "Permanent Antarctic Research Base",
    commissioned: 2012,
    capacity: 47,
    currentCrew: 24,
    status: "Operational",
    weather: {
      temperature: -28.4,
      feelsLike: -41.2,
      windSpeedKnots: 38,
      windDirection: "SSE",
      visibilityKm: 2.5,
      condition: "Severe Wind Chill / Blizzard Watch",
      pressureHpa: 978,
      dataSource: "IMD / NCPOR Polar Automated Weather Station (AWS)",
      lastUpdated: new Date().toISOString()
    },
    lifeSupport: {
      mainPower: "Operating (Gen-A @ 72% load)",
      indoorTempC: 19.5,
      fuelReserveLiters: 142000,
      fuelCapacityLiters: 220000,
      waterReserveLiters: 18500,
      daysOfAutonomy: 114
    }
  },
  {
    id: "ST-MAITRI",
    name: "Maitri Station",
    location: "Schirmacher Oasis, Queen Maud Land, Antarctica",
    coordinates: { lat: -70.7667, lng: 11.7333 },
    type: "Permanent Antarctic Research Base",
    commissioned: 1989,
    capacity: 25,
    currentCrew: 18,
    status: "Operational",
    weather: {
      temperature: -21.8,
      feelsLike: -30.5,
      windSpeedKnots: 22,
      windDirection: "ESE",
      visibilityKm: 12.0,
      condition: "Clear Cold / High Albedo",
      pressureHpa: 984,
      dataSource: "Maitri Met Lab / NCPOR Satellite Feed",
      lastUpdated: new Date().toISOString()
    },
    lifeSupport: {
      mainPower: "Operating (Gen-B @ 64% load)",
      indoorTempC: 21.0,
      fuelReserveLiters: 88000,
      fuelCapacityLiters: 160000,
      waterReserveLiters: 12000,
      daysOfAutonomy: 78
    }
  },
  {
    id: "ST-HIMADRI",
    name: "Himadri Station",
    location: "Ny-Ålesund, Svalbard, Arctic",
    coordinates: { lat: 78.9236, lng: 11.9286 },
    type: "Arctic Research Station",
    commissioned: 2008,
    capacity: 12,
    currentCrew: 8,
    status: "Operational",
    weather: {
      temperature: -11.2,
      feelsLike: -17.6,
      windSpeedKnots: 14,
      windDirection: "NE",
      visibilityKm: 18.0,
      condition: "Intermittent Snow Flurries",
      pressureHpa: 1006,
      dataSource: "Kings Bay Marine Lab / NCPOR",
      lastUpdated: new Date().toISOString()
    },
    lifeSupport: {
      mainPower: "Grid Connected + Emergency UPS",
      indoorTempC: 20.2,
      fuelReserveLiters: 35000,
      fuelCapacityLiters: 50000,
      waterReserveLiters: 8000,
      daysOfAutonomy: 95
    }
  }
];

export const users = [
  {
    id: "usr-01",
    email: "commander@nexuspole.gov.in",
    passwordHash: "demo123", // For prototype testing
    name: "Dr. Rajesh Sharma",
    role: "Mission Commander",
    designation: "Station Leader & Expedition Director",
    stationId: "ST-BHARATI",
    status: "Active / On-Station",
    bloodGroup: "O+",
    clearanceLevel: "Level 4 (Full Mission Control)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-02",
    email: "logistics@nexuspole.gov.in",
    passwordHash: "demo123",
    name: "Lt. Col. Vikrant Nair",
    role: "Logistics Officer",
    designation: "Chief of Supply Chain & Cargo Movements",
    stationId: "ST-BHARATI",
    status: "Active / Port Resupply Desk",
    bloodGroup: "A+",
    clearanceLevel: "Level 3 (Logistics & Inventory)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-03",
    email: "asset@nexuspole.gov.in",
    passwordHash: "demo123",
    name: "Priya Sen",
    role: "Asset Manager",
    designation: "Lead Mechanical & Fleet Maintenance Engineer",
    stationId: "ST-BHARATI",
    status: "Active / Vehicle Hangar",
    bloodGroup: "B+",
    clearanceLevel: "Level 3 (Asset Lifecycle)",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-04",
    email: "medical@nexuspole.gov.in",
    passwordHash: "demo123",
    name: "Dr. Ananya Mukherjee",
    role: "Medical/Safety Officer",
    designation: "Chief Medical Officer & Polar Triage Lead",
    stationId: "ST-MAITRI",
    status: "Active / Medical Bay",
    bloodGroup: "AB+",
    clearanceLevel: "Level 3 (Medical & Triage)",
    avatar: "https://images.unsplash.com/photo-1594824813589-299f2a713840?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-05",
    email: "researcher@nexuspole.gov.in",
    passwordHash: "demo123",
    name: "Dr. Kabir Das",
    role: "Scientist/Researcher",
    designation: "Senior Glaciologist & Paleoclimate Lead",
    stationId: "ST-BHARATI",
    status: "Field Traverse Team Alpha",
    bloodGroup: "O-",
    clearanceLevel: "Level 2 (Scientific Telemetry)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-06",
    email: "field@nexuspole.gov.in",
    passwordHash: "demo123",
    name: "Tarun Rawat",
    role: "Field Personnel",
    designation: "Polar Traverse Specialist & Heavy Equipment Operator",
    stationId: "ST-BHARATI",
    status: "Field Traverse Team Alpha",
    bloodGroup: "B-",
    clearanceLevel: "Level 1 (Field Ops & Offline App)",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "usr-07",
    email: "admin@nexuspole.gov.in",
    passwordHash: "demo123",
    name: "System Administrator",
    role: "System Administrator",
    designation: "NCPOR HQ IT Systems & Security",
    stationId: "HQ-GOA",
    status: "Active / HQ Network",
    bloodGroup: "O+",
    clearanceLevel: "Level 5 (Super Admin)",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  }
];

export const expeditions = [
  {
    id: "EXP-44-IAE",
    name: "44th Indian Antarctic Expedition (Summer-Winter Overwintering)",
    objective: "Deep ice-core paleoclimate drilling at Larsemann Hills, continental shelf bathymetry, and maintenance of atmospheric radar systems.",
    stationId: "ST-BHARATI",
    startDate: "2026-11-01",
    endDate: "2027-03-31",
    durationDays: 151,
    status: "Active",
    missionPhase: "Phase 2: Scientific Drilling & Surface Traverse",
    personnelCount: 24,
    leadCommander: "Dr. Rajesh Sharma",
    transportModes: ["PistenBully 300 Polar Snowcats", "Twin Otter Ski-Plane", "Polar Resupply Vessel Vasily Golovnin"],
    operationalConstraints: "Mid-winter sun blackout (May-July); absolute whiteout risk; maximum traverse distance 120km from base.",
    resourceAllocation: {
      foodCaloriesTotal: 14500000,
      dailyCaloriePerPerson: 4000,
      fuelAviationLiters: 45000,
      fuelDieselPolarLiters: 115000,
      contingencyBufferPercent: 30,
      medicalKitsAllocated: 16,
      cargoTotalWeightKg: 84000,
      cargoVolumeM3: 310
    },
    readinessChecklist: [
      { id: "rc-1", task: "Pre-departure medical & high-altitude hypothermia clearance", completed: true, verifiedBy: "Dr. Ananya Mukherjee" },
      { id: "rc-2", task: "Polar survival & crevasse rescue drill completion", completed: true, verifiedBy: "Lt. Col. Vikrant Nair" },
      { id: "rc-3", task: "Arctic fuel batch lab certification (Kero-50 low pour point)", completed: true, verifiedBy: "Priya Sen" },
      { id: "rc-4", task: "Satellite VHF/Iridium emergency beacon frequency test", completed: true, verifiedBy: "Tarun Rawat" },
      { id: "rc-5", task: "Smart container hazardous chemical segregation sign-off", completed: true, verifiedBy: "Lt. Col. Vikrant Nair" },
      { id: "rc-6", task: "Emergency reserve rations sealed in Depot-3 bunker", completed: false, verifiedBy: "Pending final audit" }
    ]
  },
  {
    id: "EXP-45-MAITRI",
    name: "Maitri Lake Priyadarshini Limnological Study",
    objective: "Biochemical sampling of sub-ice water columns in Schirmacher Oasis and seismic array servicing.",
    stationId: "ST-MAITRI",
    startDate: "2026-12-15",
    endDate: "2027-02-28",
    durationDays: 75,
    status: "Planning",
    missionPhase: "Phase 1: Pre-Deployment Staging & Cargo Packing",
    personnelCount: 14,
    leadCommander: "Dr. Ananya Mukherjee",
    transportModes: ["Lynx Snowmobiles", "Helicopter Kamov-32"],
    operationalConstraints: "Permafrost melting risks in December; limited helicopter landing windows.",
    resourceAllocation: {
      foodCaloriesTotal: 4200000,
      dailyCaloriePerPerson: 3800,
      fuelAviationLiters: 15000,
      fuelDieselPolarLiters: 38000,
      contingencyBufferPercent: 25,
      medicalKitsAllocated: 8,
      cargoTotalWeightKg: 29000,
      cargoVolumeM3: 110
    },
    readinessChecklist: [
      { id: "rc-7", task: "Sterile sampling container decontamination", completed: true, verifiedBy: "Dr. Kabir Das" },
      { id: "rc-8", task: "Snowmobile engine carb heaters installed", completed: false, verifiedBy: "Priya Sen" }
    ]
  }
];

export const cargoItems = [
  {
    id: "CRG-2026-001",
    name: "Freeze-Dried High-Calorie Rations (Type Alpha-Polar)",
    category: "Rations / Provisions",
    containerId: "CONT-REEFER-01",
    weightKg: 4200,
    volumeM3: 14.5,
    priority: "Critical",
    handling: "Keep Dry / Freeze Stable (-20°C to -40°C)",
    origin: "NCPOR Logistics Hub, Goa / Cape Town Berth",
    destination: "Bharati Station - Main Bunker",
    status: "At Station",
    qrCode: "NP-CRG-2026-001-ALPHA-RATIONS",
    chainOfCustody: [
      { timestamp: "2026-10-02T10:00:00Z", location: "NCPOR Vasco Da Gama, Goa", handler: "Lt. Col. Vikrant Nair", event: "Consolidation & QR Tagging" },
      { timestamp: "2026-10-20T14:30:00Z", location: "Port of Cape Town", handler: "Cape Shipping Agent", event: "Vessel Staging Aboard Vasily Golovnin" },
      { timestamp: "2026-11-04T08:15:00Z", location: "Larsemann Hills Fast Ice Edge", handler: "Tarun Rawat", event: "Unloaded via Heavy Crane to PistenBully Sledge" },
      { timestamp: "2026-11-05T16:00:00Z", location: "Bharati Station Main Bunker", handler: "Priya Sen", event: "Station Receipt & Inventory Inward" }
    ]
  },
  {
    id: "CRG-2026-002",
    name: "Arctic Aviation Kerosene (ATF-50 Low Freeze Point)",
    category: "Fuel / POL",
    containerId: "CONT-FUEL-TANK-04",
    weightKg: 18500,
    volumeM3: 24.0,
    priority: "Critical",
    handling: "Hazmat Class 3 / Flammable / Static Grounding Mandatory",
    origin: "Indian Oil Corp / Cape Town Bunkering",
    destination: "Bharati Station - Fuel Farm",
    status: "In Transit",
    qrCode: "NP-CRG-2026-002-ATF50-POL",
    chainOfCustody: [
      { timestamp: "2026-10-22T09:00:00Z", location: "Cape Town Berth #4", handler: "Logistics Officer", event: "Fuel ISO Container Inspection" },
      { timestamp: "2026-11-01T12:00:00Z", location: "Southern Ocean (55°S 40°E)", handler: "Chief Mate", event: "En Route Aboard Vessel" }
    ]
  },
  {
    id: "CRG-2026-003",
    name: "Advanced Hypothermia Resuscitation & Plasma Units",
    category: "Medical / Life Support",
    containerId: "CONT-MED-01",
    weightKg: 380,
    volumeM3: 2.2,
    priority: "Critical",
    handling: "Temperature Monitored (+4°C Regulated) / Fragile",
    origin: "Army Medical Corps, Pune",
    destination: "Bharati Station - Medical Bay",
    status: "At Station",
    qrCode: "NP-CRG-2026-003-MED-PLASMA",
    chainOfCustody: [
      { timestamp: "2026-10-10T11:00:00Z", location: "Pune AMC Depot", handler: "Dr. Ananya Mukherjee", event: "Cold-chain Validation" },
      { timestamp: "2026-11-06T15:45:00Z", location: "Bharati Medical Bay", handler: "Dr. Rajesh Sharma", event: "Received & Locked in Med Safe" }
    ]
  },
  {
    id: "CRG-2026-004",
    name: "Caterpillar 3406 Gen-A Fuel Injectors & Alternator Core",
    category: "Spare Parts / Engineering",
    containerId: "CONT-DRY-SPARE-02",
    weightKg: 890,
    volumeM3: 4.8,
    priority: "Important",
    handling: "Heavy / Anti-Moisture Desiccant Sealed",
    origin: "CAT India Spare Centre",
    destination: "Bharati Station - Workshop",
    status: "At Station",
    qrCode: "NP-CRG-2026-004-CAT-SPARES",
    chainOfCustody: [
      { timestamp: "2026-10-15T09:00:00Z", location: "Goa Hub", handler: "Priya Sen", event: "Packed in Heavy Pelican Crate" },
      { timestamp: "2026-11-06T17:20:00Z", location: "Bharati Generator Room", handler: "Priya Sen", event: "Shelved at Bay 3" }
    ]
  },
  {
    id: "CRG-2026-005",
    name: "Sub-Ice Diamond Drill Bits & Core Barrel Liners",
    category: "Scientific Equipment",
    containerId: "CONT-SCI-03",
    weightKg: 1450,
    volumeM3: 5.6,
    priority: "Normal",
    handling: "Precision Instruments / Shock Sensors Attached",
    origin: "NCPOR Earth Science Labs",
    destination: "Bharati Station - Science Module",
    status: "Staged at Cape Town",
    qrCode: "NP-CRG-2026-005-ICE-DRILL-BITS",
    chainOfCustody: [
      { timestamp: "2026-10-25T14:00:00Z", location: "Cape Town Forwarding Yard", handler: "Logistics Agent", event: "Customs Staged" }
    ]
  }
];

export const inventory = [
  {
    id: "INV-001",
    item: "Polar Arctic Diesel (Euro-VI Kero Blended)",
    category: "Fuel",
    quantity: 142000,
    unit: "Liters",
    minThreshold: 45000,
    emergencyReserve: 30000,
    location: "Bharati Station - Fuel Farm Tanks 1-4",
    dailyBurnRate: 680, // Liters per day across 24 crew + heating
    daysRemaining: 208,
    status: "Optimal",
    batch: "IOCL-POL-2026-K9",
    expiryDate: "2028-12-31"
  },
  {
    id: "INV-002",
    item: "Emergency Freeze-Dried Entrees (4500 kcal Ration Packs)",
    category: "Food/Rations",
    quantity: 5800,
    unit: "Packs",
    minThreshold: 1500,
    emergencyReserve: 1000,
    location: "Bharati Bunker Storage A",
    dailyBurnRate: 36, // Packs per day
    daysRemaining: 161,
    status: "Optimal",
    batch: "DFRL-MYSORE-EXP26",
    expiryDate: "2028-06-30"
  },
  {
    id: "INV-003",
    item: "Medical Freeze-Dried Human Blood Plasma (Type O- & A+)",
    category: "Medical",
    quantity: 28,
    unit: "Units",
    minThreshold: 15,
    emergencyReserve: 10,
    location: "Bharati Medical Bay Cold Safe",
    dailyBurnRate: 0.1,
    daysRemaining: 280,
    status: "Optimal",
    batch: "AFMC-PUNE-PL-902",
    expiryDate: "2027-04-15"
  },
  {
    id: "INV-004",
    item: "High-Altitude / Polar Oxygen Cylinders (Lightweight Carbon)",
    category: "Life Support",
    quantity: 14,
    unit: "Cylinders (10L)",
    minThreshold: 12,
    emergencyReserve: 8,
    location: "Bharati Medical Trauma Ward",
    dailyBurnRate: 0.05,
    daysRemaining: 280,
    status: "Low Reserve Warning",
    batch: "OX-POLAR-2026-08",
    expiryDate: "2030-01-01"
  },
  {
    id: "INV-005",
    item: "PistenBully Hydraulic Extreme-Low-Temp Fluid (ISO 15)",
    category: "Maintenance",
    quantity: 180,
    unit: "Liters",
    minThreshold: 120,
    emergencyReserve: 80,
    location: "Mechanical Workshop Bay 1",
    dailyBurnRate: 1.5,
    daysRemaining: 120,
    status: "Optimal",
    batch: "SHELL-AERO-HYD-04",
    expiryDate: "2029-08-20"
  },
  {
    id: "INV-006",
    stationId: "ST-MAITRI",
    item: "Polar Arctic Diesel Reserve",
    category: "Fuel",
    quantity: 88000,
    unit: "Liters",
    minThreshold: 40000,
    emergencyReserve: 28000,
    location: "Maitri Station - Fuel Farm",
    dailyBurnRate: 520,
    daysRemaining: 169,
    resupplyGapDays: 90,
    status: "Optimal",
    batch: "IOCL-MAITRI-2026-04",
    expiryDate: "2028-11-30"
  },
  {
    id: "INV-007",
    stationId: "ST-MAITRI",
    item: "Emergency Ration Packs - Maitri",
    category: "Food/Rations",
    quantity: 920,
    unit: "Packs",
    minThreshold: 1000,
    emergencyReserve: 600,
    location: "Maitri Station - Bunker 2",
    dailyBurnRate: 24,
    daysRemaining: 38,
    resupplyGapDays: 60,
    status: "Low Reserve Warning",
    batch: "DFRL-MAITRI-EXP26",
    expiryDate: "2028-05-31"
  },
  {
    id: "INV-008",
    stationId: "ST-HIMADRI",
    item: "Generator Injector Service Kits",
    category: "Maintenance",
    quantity: 6,
    unit: "Kits",
    minThreshold: 8,
    emergencyReserve: 3,
    location: "Himadri Station - Workshop Store",
    dailyBurnRate: 0.03,
    daysRemaining: 200,
    resupplyGapDays: 120,
    status: "Low Reserve Warning",
    batch: "NCPOR-HIM-MRO-26",
    expiryDate: "2030-03-01"
  },
  {
    id: "INV-009",
    stationId: "ST-HIMADRI",
    item: "Medical Oxygen Cylinders",
    category: "Life Support",
    quantity: 7,
    unit: "Cylinders",
    minThreshold: 10,
    emergencyReserve: 5,
    location: "Himadri Station - Medical Bay",
    dailyBurnRate: 0.08,
    daysRemaining: 88,
    resupplyGapDays: 90,
    status: "Low Reserve Warning",
    batch: "OX-HIM-2026-11",
    expiryDate: "2030-02-01"
  }
];

export const assets = [
  {
    id: "AST-PB-300-01",
    name: "Kässbohrer PistenBully 300 Polar Snowcat (Tiger 1)",
    type: "Heavy Track Vehicle / Glacier Traverse",
    serialNumber: "KB-PB300-8849-POLAR",
    stationId: "ST-BHARATI",
    condition: "Good",
    operationalStatus: "Active in Field",
    healthScore: 88,
    operatingHours: 1420,
    maintenanceIntervalHours: 250,
    hoursSinceLastService: 195,
    maintenanceDue: "In 55 operating hours",
    custodian: "Tarun Rawat",
    location: "Traverse Route Charlie (Waypoint 4, 38km SW)",
    telemetry: {
      engineTempC: 84,
      oilPressurePsi: 58,
      vibrationLevelG: 0.32,
      fuelLevelPercent: 68,
      batteryVoltage: 27.8
    },
    qrCode: "NP-AST-PB300-01",
    recentMaintenance: [
      { date: "2026-09-15", task: "Track tensioning and rubber guide replacement", technician: "Priya Sen" },
      { date: "2026-08-01", task: "Hydraulic filter flush and anti-freeze top up", technician: "Priya Sen" }
    ]
  },
  {
    id: "AST-GEN-250-A",
    name: "Caterpillar 3406 250kVA Polar Diesel Genset #1",
    type: "Primary Power Generation & Life Support",
    serialNumber: "CAT-3406-PGEN-001",
    stationId: "ST-BHARATI",
    condition: "Fair / Anomaly Detected",
    operationalStatus: "Active / High Load",
    healthScore: 71,
    operatingHours: 8420,
    maintenanceIntervalHours: 500,
    hoursSinceLastService: 480,
    maintenanceDue: "In 20 operating hours (Urgent)",
    custodian: "Priya Sen",
    location: "Bharati Station Power Plant Block A",
    telemetry: {
      engineTempC: 92,
      oilPressurePsi: 46,
      vibrationLevelG: 0.68, // Elevated vibration
      fuelLevelPercent: 85,
      batteryVoltage: 24.2
    },
    qrCode: "NP-AST-GEN-250-A",
    recentMaintenance: [
      { date: "2026-08-10", task: "500-hour major overhaul, injector cleaning", technician: "Priya Sen" }
    ],
    predictiveAlert: "Vibration frequency spike at 1800 RPM suggests impending bearing wear in main alternator coupling. Schedule inspection before next blizzard."
  },
  {
    id: "AST-GEN-250-B",
    name: "Caterpillar 3406 250kVA Polar Diesel Genset #2 (Cold Standby)",
    type: "Emergency Backup Power Generation",
    serialNumber: "CAT-3406-PGEN-002",
    stationId: "ST-BHARATI",
    condition: "Excellent",
    operationalStatus: "Standby / Pre-Heated",
    healthScore: 96,
    operatingHours: 3210,
    maintenanceIntervalHours: 500,
    hoursSinceLastService: 120,
    maintenanceDue: "In 380 operating hours",
    custodian: "Priya Sen",
    location: "Bharati Station Power Plant Block B",
    telemetry: {
      engineTempC: 45, // Pre-heat block active
      oilPressurePsi: 60,
      vibrationLevelG: 0.15,
      fuelLevelPercent: 94,
      batteryVoltage: 26.5
    },
    qrCode: "NP-AST-GEN-250-B",
    recentMaintenance: [
      { date: "2026-09-20", task: "Weekly 30-min auto-crank test under 50kW dummy load", technician: "Priya Sen" }
    ]
  },
  {
    id: "AST-SNOW-LYNX-02",
    name: "BRP Lynx 69 Ranger Snowmobile #2",
    type: "Rapid Field Reconnaissance",
    serialNumber: "LYNX-69R-0044",
    stationId: "ST-BHARATI",
    condition: "Good",
    operationalStatus: "Available in Hangar",
    healthScore: 92,
    operatingHours: 420,
    maintenanceIntervalHours: 100,
    hoursSinceLastService: 35,
    maintenanceDue: "In 65 operating hours",
    custodian: "Tarun Rawat",
    location: "Bharati Vehicle Hangar Bay 2",
    telemetry: {
      engineTempC: 20,
      oilPressurePsi: 50,
      vibrationLevelG: 0.22,
      fuelLevelPercent: 100,
      batteryVoltage: 13.6
    },
    qrCode: "NP-AST-SNOW-LYNX-02",
    recentMaintenance: [
      { date: "2026-09-02", task: "Ski runner wear plate replacement", technician: "Tarun Rawat" }
    ]
  }
];

export const incidents = [
  {
    id: "INC-2026-003",
    title: "Category 3 Polar Blizzard & Severe Whiteout Warning",
    type: "Severe Weather Disruption",
    severity: "High",
    stationId: "ST-BHARATI",
    location: "Larsemann Hills Sector 4",
    reportedBy: "NCPOR Polar AWS Automated Alert",
    status: "Response",
    createdAt: "2026-09-21T18:30:00Z",
    affectedEntities: {
      personnel: ["Dr. Kabir Das", "Tarun Rawat"],
      assets: ["AST-PB-300-01 (Tiger 1)"],
      operations: ["Deep Ice-Core Drilling Traverse halted at Waypoint 4"]
    },
    responseChecklist: [
      { id: "step-1", task: "All personnel on exterior station decks recalled to main habitat module", completed: true },
      { id: "step-2", task: "Field Traverse Team Alpha ordered to tether PistenBully, deploy blizzard ice-anchors and activate emergency survival beacon", completed: true },
      { id: "step-3", task: "Station emergency backup generator Gen-B pre-heat warmed to 60°C", completed: true },
      { id: "step-4", task: "Hourly satellite VHF check-in schedule enforced with Team Alpha", completed: false },
      { id: "step-5", task: "Outdoor fuel line heat-tracing tape verify circuit integrity", completed: false }
    ],
    timeline: [
      { timestamp: "2026-09-21T18:30:00Z", actor: "System Monitor", note: "Barometric pressure fell 14 hPa in 3 hours; sustained wind clocked at 54 knots." },
      { timestamp: "2026-09-21T18:35:00Z", actor: "Dr. Rajesh Sharma", note: "Acknowledged high severity blizzard warning; declared Station Alert Level Yellow." },
      { timestamp: "2026-09-21T18:45:00Z", actor: "Dr. Rajesh Sharma", note: "Radioed Team Alpha. Confirmed PistenBully cabin heater operating normally with 4 days food & fuel." }
    ]
  },
  {
    id: "INC-2026-002",
    title: "Missed Scheduled VHF Check-in - Field Traverse Team Bravo",
    type: "Personnel Safety / Missed Check-in",
    severity: "Medium",
    stationId: "ST-MAITRI",
    location: "Schirmacher Oasis South Ridge (Grid 70.8S 11.6E)",
    reportedBy: "Automated Safety Muster Watchdog",
    status: "Stabilized",
    createdAt: "2026-09-20T14:15:00Z",
    affectedEntities: {
      personnel: ["Team Bravo (2 Glaciologists)"],
      assets: ["Snowmobile Lynx-01"],
      operations: ["Lake Ice Thickness Survey"]
    },
    responseChecklist: [
      { id: "step-1", task: "Attempt primary VHF and Iridium Handset ping", completed: true },
      { id: "step-2", task: "Confirm GPS beacon coordinates from Iridium tracking packet", completed: true },
      { id: "step-3", task: "Dispatch backup snowmobile team if 45-min overdue threshold exceeded", completed: true }
    ],
    timeline: [
      { timestamp: "2026-09-20T14:15:00Z", actor: "Safety Watchdog", note: "14:00Z Check-in missed by 15 minutes." },
      { timestamp: "2026-09-20T14:28:00Z", actor: "Dr. Ananya Mukherjee", note: "Team radioed via backup HF transceiver; delayed due to temporary antenna icing. Personnel safe." }
    ]
  }
];

export const riskAlerts = [
  {
    id: "RSK-01",
    title: "Main Generator #1 (Gen-A) Imminent Service Breach",
    category: "Asset Health",
    severity: "High",
    stationId: "ST-BHARATI",
    reasons: [
      "Operating hours reached 480 / 500 allowable limit before compulsory lube-oil and injector flush.",
      "Vibration sensor recorded 0.68G at 1800 RPM, exceeding safety threshold of 0.50G.",
      "Blizzard condition prevents external crane maneuver if secondary catastrophic failure occurs."
    ],
    sourceTimestamp: "2026-09-21T19:00:00Z",
    mitigation: "Execute planned load-switchover to Gen-B (Cold Standby) and perform injector service within 20 operating hours."
  },
  {
    id: "RSK-02",
    title: "Supply Ship (Vasily Golovnin) Staged Resupply Window Vulnerability",
    category: "Logistics & Supply Chain",
    severity: "Medium",
    stationId: "ST-BHARATI",
    reasons: [
      "Satellite sea-ice imagery indicates multi-year fast ice thickness at Prydz Bay is 1.8m (30% thicker than average).",
      "Vessel speed reduced to 4.2 knots; projected arrival delayed by 6 days.",
      "Current station fuel autonomy is 208 days (satisfactory), but specialized drilling fluids are down to 14 days operational reserve."
    ],
    sourceTimestamp: "2026-09-21T17:15:00Z",
    mitigation: "Delay deep-core drilling run by 5 days or reallocate drilling fluid from auxiliary test-well."
  },
  {
    id: "RSK-03",
    title: "Portable Oxygen Cylinders Below 15-Unit Comfort Threshold",
    category: "Inventory / Medical",
    severity: "Medium",
    stationId: "ST-BHARATI",
    reasons: [
      "Current stock is 14 cylinders against minimum operational threshold of 15.",
      "Emergency high-altitude traverse Team Alpha took 2 reserve cylinders into the field."
    ],
    sourceTimestamp: "2026-09-21T14:30:00Z",
    mitigation: "Replenish 6 lightweight composite cylinders on upcoming Twin Otter resupply sortie from Maitri."
  }
];
