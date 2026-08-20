export type RateStructure = 'tiered' | 'tou' | 'flat' | 'commercial';

export type Currency = {
  code: string;
  symbol: string;
  rate: number; // relative to USD for multi-currency conversion
  position: 'before' | 'after';
};

export interface TariffTier {
  maxKwh: number; // e.g., 50, 75, 200, or Infinity
  rate: number;   // $/kWh or ৳/kWh
  label: string;
  isLifeline?: boolean; // Special lifeline tier applicable only when usage <= 50 kWh
}

export interface TariffPlan {
  id: string;
  name: string;
  region: string;
  structure: RateStructure;
  fixedBaseFee: number; // monthly fixed meter/service fee ($)
  defaultSanctionLoadKw?: number; // default sanctioned load in kW for category
  hasLifeline?: boolean; // True if <= 50 units gets lifeline tier, > 50 units starts from Step 1
  lifelineTier?: TariffTier; // Dedicated Life-line tier (0-50 units)
  // For tiered
  tiers?: TariffTier[];
  // For TOU
  peakRate?: number;     // $/kWh
  midPeakRate?: number;  // $/kWh
  offPeakRate?: number;  // $/kWh
  peakHoursDescription?: string;
  // For Flat
  flatRate?: number;     // $/kWh
  // Commercial / Sanction Load Demand Charge
  demandChargePerKw?: number; // $/kW (or ৳/kW)
  // Surcharges & Taxes
  fuelAdjustmentPerKwh: number; // $/kWh
  transmissionDeliveryPerKwh: number; // $/kWh
  environmentalRiderPercent: number; // % of energy cost
  taxPercent: number; // % state/local tax
}

export interface ApplianceItem {
  id: string;
  name: string;
  category: 'cooling_heating' | 'kitchen' | 'laundry' | 'transportation' | 'electronics' | 'water_heating' | 'other';
  wattage: number;
  hoursPerDay: number;
  quantity: number;
  daysPerMonth: number;
  enabled: boolean;
  iconName?: string;
}

export interface SolarConfig {
  hasSolar: boolean;
  systemCapacityKw: number;
  dailySunHours: number;
  feedInTariffPerKwh: number; // export credit rate
  selfConsumptionPercent: number; // % of solar consumed directly
  batteryCapacityKwh: number;
}

export interface TOUDistribution {
  peakPercent: number;    // e.g. 25%
  midPeakPercent: number; // e.g. 35%
  offPeakPercent: number; // e.g. 40%
}

export interface CalculationInput {
  billingDays: number;
  selectedTariffId: string;
  customTariff?: TariffPlan;
  monthlyKwh: number;
  mode: 'simple_slider' | 'meter_reading' | 'appliance_load' | 'solar_tou';
  meterPrevious: number;
  meterCurrent: number;
  meterMultiplier: number;
  meterUnits?: number;
  appliances: ApplianceItem[];
  solar: SolarConfig;
  tou: TOUDistribution;
  peakDemandKw: number; // for commercial legacy compatibility
  sanctionLoadKw?: number; // Sanctioned load in kW (অনুমোদিত লোড)
  currency: Currency;
  customerName?: string;
  accountNumber?: string;
  address?: string;
}

export interface TierCostBreakdown {
  tierName: string;
  kwhInTier: number;
  ratePerKwh: number;
  cost: number;
}

export interface DetailedCostBreakdown {
  // Quantities
  grossConsumptionKwh: number;
  solarGeneratedKwh: number;
  solarSelfConsumedKwh: number;
  solarExportedKwh: number;
  netBilledKwh: number;
  
  // Cost line items
  fixedCustomerCharge: number;
  energyCharges: number;
  tierBreakdowns: TierCostBreakdown[];
  touCharges?: {
    peakKwh: number;
    peakCost: number;
    midPeakKwh: number;
    midPeakCost: number;
    offPeakKwh: number;
    offPeakCost: number;
  };
  transmissionDeliveryCharge: number;
  fuelAdjustmentCharge: number;
  environmentalRiderCharge: number;
  demandCharge: number;
  sanctionLoadKw: number;
  demandChargeRatePerKw: number;
  subtotalBeforeCredits: number;
  solarCredit: number;
  subtotalAfterCredits: number;
  taxes: number;
  totalBill: number;
  
  // Averages & Projections
  dailyAverageCost: number;
  dailyAverageKwh: number;
  annualProjectedCost: number;
  annualProjectedKwh: number;
  effectiveRatePerKwh: number; // total bill / net kwh
  carbonFootprintKg: number; // CO2 emission estimate
  equivalentTreesNeeded: number;
}

export interface SavingRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedMonthlySavings: number;
  estimatedKwhReduction: number;
  impactLevel: 'high' | 'medium' | 'low';
  category: string;
  applied: boolean;
}
