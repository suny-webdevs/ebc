import { Currency, TariffPlan, ApplianceItem } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'BDT', symbol: '৳', rate: 1.0, position: 'before' },
];

export const DEFAULT_TARIFFS: TariffPlan[] = [
  {
    id: 'bd_residential_postpaid',
    name: 'Bangladesh Residential (LT-A Postpaid)',
    region: 'DESCO / DPDC / BPDB / BREB / NESCO / WZPDCL',
    structure: 'tiered',
    fixedBaseFee: 10.00, // Monthly fixed meter rent fee (৳)
    defaultSanctionLoadKw: 2.0, // Default 2 kW for residential
    demandChargePerKw: 42.00, // ৳42 / kW monthly demand charge
    hasLifeline: true,
    lifelineTier: { maxKwh: 50, rate: 4.63, label: 'Life-line Tier (0 - 50 Units)', isLifeline: true },
    tiers: [
      { maxKwh: 50, rate: 4.63, label: 'Life-line Tier (0 - 50 Units)', isLifeline: true },
      { maxKwh: 75, rate: 5.26, label: 'Step 1 (0 - 75 Units)' },
      { maxKwh: 200, rate: 8.50, label: 'Step 2 (76 - 200 Units)' },
      { maxKwh: 300, rate: 9.10, label: 'Step 3 (201 - 300 Units)' },
      { maxKwh: 400, rate: 9.62, label: 'Step 4 (301 - 400 Units)' },
      { maxKwh: 600, rate: 15.01, label: 'Step 5 (401 - 600 Units)' },
      { maxKwh: Infinity, rate: 17.35, label: 'Step 6 (> 600 Units)' },
    ],
    fuelAdjustmentPerKwh: 0,
    transmissionDeliveryPerKwh: 0,
    environmentalRiderPercent: 0,
    taxPercent: 5.0, // 5% VAT under Bangladesh Govt
  },
  {
    id: 'bd_residential_prepaid',
    name: 'Smart Prepaid Meter (LT-A Residential)',
    region: 'DESCO / DPDC / BPDB Smart Prepaid',
    structure: 'tiered',
    fixedBaseFee: 10.00, // Monthly meter rent (৳)
    defaultSanctionLoadKw: 2.0, // Default 2 kW for smart prepaid
    demandChargePerKw: 42.00, // ৳42 / kW monthly demand charge
    hasLifeline: true,
    lifelineTier: { maxKwh: 50, rate: 4.63, label: 'Life-line Tier (0 - 50 Units)', isLifeline: true },
    tiers: [
      { maxKwh: 50, rate: 4.63, label: 'Life-line Tier (0 - 50 Units)', isLifeline: true },
      { maxKwh: 75, rate: 5.26, label: 'Step 1 (0 - 75 Units)' },
      { maxKwh: 200, rate: 8.50, label: 'Step 2 (76 - 200 Units)' },
      { maxKwh: 300, rate: 9.10, label: 'Step 3 (201 - 300 Units)' },
      { maxKwh: 400, rate: 9.62, label: 'Step 4 (301 - 400 Units)' },
      { maxKwh: 600, rate: 15.01, label: 'Step 5 (401 - 600 Units)' },
      { maxKwh: Infinity, rate: 17.35, label: 'Step 6 (> 600 Units)' },
    ],
    fuelAdjustmentPerKwh: 0,
    transmissionDeliveryPerKwh: 0,
    environmentalRiderPercent: 0,
    taxPercent: 5.0, // 5% VAT
  },
  {
    id: 'bd_commercial_lte',
    name: 'Commercial & Offices (LT-E)',
    region: 'Bangladesh (Commercial Establishments & Shops)',
    structure: 'commercial',
    fixedBaseFee: 40.00,
    defaultSanctionLoadKw: 5.0, // Default 5 kW for commercial shops/offices
    flatRate: 13.00,
    demandChargePerKw: 84.00, // ৳84 / kW demand charge
    fuelAdjustmentPerKwh: 0,
    transmissionDeliveryPerKwh: 0,
    environmentalRiderPercent: 0,
    taxPercent: 5.0,
  },
  {
    id: 'bd_small_industry_ltc1',
    name: 'Small Industry & Workshop (LT-C1)',
    region: 'Bangladesh Small Industry',
    structure: 'commercial',
    fixedBaseFee: 40.00,
    defaultSanctionLoadKw: 10.0, // Default 10 kW for small industry
    flatRate: 10.20,
    demandChargePerKw: 75.00, // ৳75 / kW demand charge
    fuelAdjustmentPerKwh: 0,
    transmissionDeliveryPerKwh: 0,
    environmentalRiderPercent: 0,
    taxPercent: 5.0,
  },
  {
    id: 'bd_agriculture_ltb',
    name: 'Irrigation & Agriculture Pump (LT-B)',
    region: 'Bangladesh Agriculture / Palli Bidyut',
    structure: 'flat',
    fixedBaseFee: 20.00,
    defaultSanctionLoadKw: 5.0, // Default 5 kW for irrigation pump
    flatRate: 4.82,
    demandChargePerKw: 30.00, // ৳30 / kW demand charge
    fuelAdjustmentPerKwh: 0,
    transmissionDeliveryPerKwh: 0,
    environmentalRiderPercent: 0,
    taxPercent: 5.0,
  },
  {
    id: 'bd_tou_residential',
    name: 'Time of Use (TOU / LT-T Peak & Off-Peak)',
    region: 'Bangladesh TOU Distribution',
    structure: 'tou',
    fixedBaseFee: 30.00,
    defaultSanctionLoadKw: 5.0, // Default 5 kW for TOU
    demandChargePerKw: 50.00, // ৳50 / kW demand charge
    peakRate: 14.61,
    midPeakRate: 10.50,
    offPeakRate: 8.50,
    peakHoursDescription: 'Peak (5 PM - 11 PM), Mid-Peak (11 AM - 5 PM), Off-Peak (11 PM - 11 AM)',
    fuelAdjustmentPerKwh: 0,
    transmissionDeliveryPerKwh: 0,
    environmentalRiderPercent: 0,
    taxPercent: 5.0,
  }
];

export const INITIAL_APPLIANCES: ApplianceItem[] = [
  {
    id: 'app_ceiling_fan',
    name: 'Ceiling Fan (High Efficiency)',
    category: 'cooling_heating',
    wattage: 75,
    hoursPerDay: 14,
    quantity: 4,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Wind'
  },
  {
    id: 'app_inverter_ac',
    name: 'Inverter Split AC (1.5 Ton)',
    category: 'cooling_heating',
    wattage: 1400,
    hoursPerDay: 6,
    quantity: 1,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'AirVent'
  },
  {
    id: 'app_refrigerator',
    name: 'Frost/Non-Frost Refrigerator (250L)',
    category: 'kitchen',
    wattage: 150,
    hoursPerDay: 24, // cycle effective
    quantity: 1,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Refrigerator'
  },
  {
    id: 'app_water_pump',
    name: 'Water Lifting Submersible Pump (1 HP)',
    category: 'water_heating',
    wattage: 750,
    hoursPerDay: 1.5,
    quantity: 1,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Droplet'
  },
  {
    id: 'app_led_lights',
    name: 'LED Bulbs & Tube Lights',
    category: 'electronics',
    wattage: 20,
    hoursPerDay: 6,
    quantity: 8,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Lightbulb'
  },
  {
    id: 'app_tv',
    name: 'Smart LED TV & Set-Top Box',
    category: 'electronics',
    wattage: 90,
    hoursPerDay: 5,
    quantity: 1,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Tv'
  },
  {
    id: 'app_rice_cooker',
    name: 'Electric Rice Cooker / Induction',
    category: 'kitchen',
    wattage: 1000,
    hoursPerDay: 1.0,
    quantity: 1,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Flame'
  },
  {
    id: 'app_iron',
    name: 'Electric Clothes Iron',
    category: 'laundry',
    wattage: 1000,
    hoursPerDay: 0.6,
    quantity: 1,
    daysPerMonth: 25,
    enabled: true,
    iconName: 'Shirt'
  },
  {
    id: 'app_washing_machine',
    name: 'Automatic Washing Machine',
    category: 'laundry',
    wattage: 450,
    hoursPerDay: 1.0,
    quantity: 1,
    daysPerMonth: 20,
    enabled: true,
    iconName: 'Sparkles'
  },
  {
    id: 'app_computer',
    name: 'Computer / Laptop & Wi-Fi Router',
    category: 'electronics',
    wattage: 120,
    hoursPerDay: 8,
    quantity: 1,
    daysPerMonth: 30,
    enabled: true,
    iconName: 'Laptop'
  }
];

export const PRESET_PROFILES = [
  {
    id: 'dhaka_family_apt',
    name: 'Dhaka Urban Apartment (2-3 Bed)',
    description: '1 Inverter AC, 4 fans, refrigerator, LED lighting & TV.',
    kwh: 340,
    tariffId: 'bd_residential_postpaid',
    solarCapacity: 0,
  },
  {
    id: 'chittagong_ac_home',
    name: 'High-Demand Home (2 ACs + Pump)',
    description: 'Dual ACs, deep freezer, water motor pump, heavy cooling load.',
    kwh: 580,
    tariffId: 'bd_residential_postpaid',
    solarCapacity: 0,
  },
  {
    id: 'prepaid_meter_home',
    name: 'DESCO/DPDC Smart Prepaid Meter',
    description: 'Moderate domestic consumption with real-time token recharge.',
    kwh: 220,
    tariffId: 'bd_residential_prepaid',
    solarCapacity: 0,
  },
  {
    id: 'palli_bidyut_solar',
    name: 'BREB (Palli Bidyut) Solar Home',
    description: 'Rural household with 3.5 kW net-metered rooftop solar PV.',
    kwh: 260,
    tariffId: 'bd_residential_postpaid',
    solarCapacity: 3.5,
  },
  {
    id: 'commercial_shop',
    name: 'Commercial Shop / Office (LT-E)',
    description: 'Display lights, inverter ACs, computers & equipment.',
    kwh: 750,
    tariffId: 'bd_commercial_lte',
    solarCapacity: 0,
  }
];
