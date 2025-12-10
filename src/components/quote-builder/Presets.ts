// Smart Presets for Quote Builder (Australian Market)
// Phase 1: UI-only preset data structures

export interface PresetLineItem {
  category: string;
  description: string;
  qty: number;
  unitPrice: number;
  tax: boolean;
  costCOGS?: number;
}

export interface PresetBundle {
  name: 'Economy' | 'Balanced' | 'Premium';
  label: string;
  description: string;
  systemType: string;
  systemSize: number;
  panels: {
    brand: string;
    model: string;
    wattage: number;
    efficiency: number;
    qty: number;
    productWarranty: number;
    performanceWarranty: number;
    tier1: boolean;
  };
  inverter: {
    brand: string;
    model: string;
    type: string;
    capacityKw: number;
    mppts: number;
    warranty: number;
  };
  battery?: {
    brand: string;
    model: string;
    usableKwh: number;
    powerKw: number;
    expandable: boolean;
    warranty: number;
    chemistry: string;
    backupSupported: boolean;
  };
  lineItems: PresetLineItem[];
  estimatedTotal: number;
}

export const PRESET_BUNDLES: PresetBundle[] = [
  {
    name: 'Economy',
    label: 'Economy Package',
    description: '6.6kW system with quality components - best value',
    systemType: 'grid-connected',
    systemSize: 6.6,
    panels: {
      brand: 'Trina Solar',
      model: 'Vertex S+ 430W',
      wattage: 430,
      efficiency: 21.5,
      qty: 16,
      productWarranty: 12,
      performanceWarranty: 25,
      tier1: true
    },
    inverter: {
      brand: 'Solis',
      model: 'RHI-5K-48ES-5G',
      type: 'Hybrid String',
      capacityKw: 5,
      mppts: 2,
      warranty: 10
    },
    lineItems: [
      { category: 'System', description: '6.6kW Solar System Supply & Install', qty: 1, unitPrice: 6500, tax: true },
      { category: 'Labour', description: 'Standard Installation Labour', qty: 1, unitPrice: 1200, tax: true },
      { category: 'Other', description: 'Electrical Compliance & Certification', qty: 1, unitPrice: 300, tax: true }
    ],
    estimatedTotal: 8000
  },
  {
    name: 'Balanced',
    label: 'Balanced Package',
    description: '6.6kW system with 10kWh battery - energy independence',
    systemType: 'hybrid',
    systemSize: 6.6,
    panels: {
      brand: 'Canadian Solar',
      model: 'HiKu6 545W',
      wattage: 545,
      efficiency: 21.3,
      qty: 12,
      productWarranty: 12,
      performanceWarranty: 25,
      tier1: true
    },
    inverter: {
      brand: 'Sungrow',
      model: 'SH5.0RS',
      type: 'Hybrid String',
      capacityKw: 5,
      mppts: 2,
      warranty: 10
    },
    battery: {
      brand: 'Sungrow',
      model: 'SBR096',
      usableKwh: 9.6,
      powerKw: 5,
      expandable: true,
      warranty: 10,
      chemistry: 'LFP',
      backupSupported: true
    },
    lineItems: [
      { category: 'System', description: '6.6kW Solar System Supply & Install', qty: 1, unitPrice: 7000, tax: true },
      { category: 'Battery', description: 'Sungrow 9.6kWh Battery System', qty: 1, unitPrice: 8500, tax: true },
      { category: 'Labour', description: 'Hybrid System Installation Labour', qty: 1, unitPrice: 2000, tax: true },
      { category: 'Other', description: 'Electrical Compliance & Certification', qty: 1, unitPrice: 500, tax: true }
    ],
    estimatedTotal: 18000
  },
  {
    name: 'Premium',
    label: 'Premium Package',
    description: '10kW system with 13.5kWh battery - maximum performance',
    systemType: 'hybrid',
    systemSize: 10,
    panels: {
      brand: 'SunPower',
      model: 'Maxeon 6 440W',
      wattage: 440,
      efficiency: 22.8,
      qty: 23,
      productWarranty: 25,
      performanceWarranty: 25,
      tier1: true
    },
    inverter: {
      brand: 'Fronius',
      model: 'Primo GEN24 10.0 Plus',
      type: 'Hybrid String',
      capacityKw: 10,
      mppts: 2,
      warranty: 10
    },
    battery: {
      brand: 'Tesla',
      model: 'Powerwall 2',
      usableKwh: 13.5,
      powerKw: 5,
      expandable: false,
      warranty: 10,
      chemistry: 'NMC',
      backupSupported: true
    },
    lineItems: [
      { category: 'System', description: '10kW Premium Solar System Supply & Install', qty: 1, unitPrice: 12000, tax: true },
      { category: 'Battery', description: 'Tesla Powerwall 2 System', qty: 1, unitPrice: 14500, tax: true },
      { category: 'Labour', description: 'Premium Installation with Backup', qty: 1, unitPrice: 3500, tax: true },
      { category: 'Other', description: 'Full Compliance & Premium Warranty', qty: 1, unitPrice: 1000, tax: true }
    ],
    estimatedTotal: 31000
  }
];

// System Types
export const SYSTEM_TYPES = [
  { value: 'grid-connected', label: 'Grid-Connected Solar' },
  { value: 'hybrid', label: 'Hybrid (Solar + Battery)' },
  { value: 'off-grid', label: 'Off-Grid System' },
  { value: 'battery-only', label: 'Battery Only' },
  { value: 'ev-charger', label: 'EV Charger Add-on' },
  { value: 'add-panels', label: 'Add Panels to Existing' },
  { value: 'replace-inverter', label: 'Replace Inverter' }
];

// Roof Types
export const ROOF_TYPES = [
  { value: 'tile', label: 'Tile' },
  { value: 'metal', label: 'Metal' },
  { value: 'colorbond', label: 'Colorbond' },
  { value: 'tin', label: 'Tin' },
  { value: 'slate', label: 'Slate' },
  { value: 'flat', label: 'Flat' },
  { value: 'other', label: 'Other' }
];

// Orientations
export const ORIENTATIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// Shading Levels
export const SHADING_LEVELS = [
  { value: 0, label: 'None (0%)' },
  { value: 5, label: 'Light (5-10%)' },
  { value: 15, label: 'Medium (10-20%)' },
  { value: 25, label: 'Heavy (20%+)' }
];

// Phase Types
export const PHASE_TYPES = [
  { value: 'single', label: 'Single Phase' },
  { value: 'three', label: 'Three Phase' }
];

// Inverter Types
export const INVERTER_TYPES = [
  { value: 'string', label: 'String Inverter' },
  { value: 'hybrid', label: 'Hybrid Inverter' },
  { value: 'micro', label: 'Microinverter' },
  { value: 'optimizers', label: 'Power Optimizers' }
];

// Battery Chemistry Types
export const BATTERY_CHEMISTRY = [
  { value: 'LFP', label: 'LFP (Lithium Iron Phosphate)' },
  { value: 'NMC', label: 'NMC (Lithium Nickel Manganese Cobalt)' },
  { value: 'NCA', label: 'NCA (Lithium Nickel Cobalt Aluminum)' }
];

// Add-ons
export const ADDON_OPTIONS = [
  { key: 'ev-charger', label: 'EV Charger', defaultPrice: 1500 },
  { key: 'extra-array', label: 'Extra Array', defaultPrice: 2000 },
  { key: 'extra-battery', label: 'Extra Battery Module', defaultPrice: 5000 },
  { key: 'monitoring', label: 'Premium Monitoring System', defaultPrice: 500 },
  { key: 'smart-meter', label: 'Smart Meter Upgrade', defaultPrice: 400 },
  { key: 'racking', label: 'Premium Racking System', defaultPrice: 800 },
  { key: 'bird-proofing', label: 'Bird Proofing', defaultPrice: 600 },
  { key: 'tilt-frames', label: 'Tilt Frames', defaultPrice: 1200 },
  { key: 'switchboard-upgrade', label: 'Switchboard Upgrade', defaultPrice: 1500 },
  { key: 'extra-labour', label: 'Extra Labour/Complex Install', defaultPrice: 1000 },
  { key: 'travel-cost', label: 'Travel Cost (Remote)', defaultPrice: 500 }
];
