import {
  CalculationInput,
  DetailedCostBreakdown,
  SavingRecommendation,
  TariffPlan,
  TierCostBreakdown,
} from './types';
import { DEFAULT_TARIFFS } from './tariffs';

export function calculateApplianceKwh(
  wattage: number,
  hoursPerDay: number,
  quantity: number,
  daysPerMonth: number = 30
): number {
  // Watt * hours / 1000 = kWh
  return (wattage * hoursPerDay * quantity * daysPerMonth) / 1000;
}

export function calculateTotalApplianceLoad(appliances: CalculationInput['appliances']): number {
  return appliances
    .filter((a) => a.enabled)
    .reduce((total, a) => total + calculateApplianceKwh(a.wattage, a.hoursPerDay, a.quantity, a.daysPerMonth), 0);
}

export function calculateElectricityBill(input: CalculationInput): DetailedCostBreakdown {
  // 1. Resolve Tariff
  const tariff: TariffPlan =
    input.customTariff ||
    DEFAULT_TARIFFS.find((t) => t.id === input.selectedTariffId) ||
    DEFAULT_TARIFFS[0];

  // 2. Resolve Gross Consumption kWh
  let grossConsumptionKwh = 0;

  if (input.mode === 'simple_slider') {
    grossConsumptionKwh = input.monthlyKwh;
  } else if (input.mode === 'meter_reading') {
    if (input.meterUnits !== undefined && input.meterUnits >= 0) {
      grossConsumptionKwh = input.meterUnits;
    } else {
      const diff = Math.max(0, input.meterCurrent - input.meterPrevious);
      grossConsumptionKwh = diff * (input.meterMultiplier || 1);
    }
  } else if (input.mode === 'appliance_load') {
    grossConsumptionKwh = calculateTotalApplianceLoad(input.appliances);
  } else if (input.mode === 'solar_tou') {
    grossConsumptionKwh = input.monthlyKwh;
  } else {
    grossConsumptionKwh = input.monthlyKwh;
  }

  // Adjust for billing days proportion (default 30 days)
  const billingDaysFactor = input.billingDays ? input.billingDays / 30 : 1;

  // 3. Solar Generation & Net Metering
  let solarGeneratedKwh = 0;
  let solarSelfConsumedKwh = 0;
  let solarExportedKwh = 0;
  let solarCredit = 0;

  if (input.solar && input.solar.hasSolar && input.solar.systemCapacityKw > 0) {
    // Monthly solar = capacity (kW) * peak sun hours * 30 days * system efficiency (~0.80)
    const monthlySunHours = (input.solar.dailySunHours || 4.8) * 30 * billingDaysFactor;
    solarGeneratedKwh = input.solar.systemCapacityKw * monthlySunHours * 0.82;

    const selfConsumptionRatio = (input.solar.selfConsumptionPercent || 65) / 100;
    solarSelfConsumedKwh = Math.min(grossConsumptionKwh, solarGeneratedKwh * selfConsumptionRatio);
    solarExportedKwh = Math.max(0, solarGeneratedKwh - solarSelfConsumedKwh);

    // Exported credit rate
    const feedInRate = input.solar.feedInTariffPerKwh || 0.085;
    solarCredit = solarExportedKwh * feedInRate;
  }

  // Net energy supplied from grid
  const netBilledKwh = Math.max(0, grossConsumptionKwh - solarSelfConsumedKwh);

  // 4. Calculate Energy Charges by Tariff Structure
  let energyCharges = 0;
  const tierBreakdowns: TierCostBreakdown[] = [];
  let touCharges: DetailedCostBreakdown['touCharges'] = undefined;

  // Sanctioned Load (kW) - specific to consumer category or customized by user
  const defaultSanction = tariff.defaultSanctionLoadKw ?? (tariff.structure === 'commercial' ? 5 : 2);
  const sanctionLoadKw = input.sanctionLoadKw !== undefined && input.sanctionLoadKw >= 0
    ? input.sanctionLoadKw
    : (input.peakDemandKw || defaultSanction);
  
  const demandChargeRatePerKw = tariff.demandChargePerKw || 0;
  const demandCharge = Math.round(sanctionLoadKw * demandChargeRatePerKw * billingDaysFactor);

  if (tariff.structure === 'tiered' && tariff.tiers && tariff.tiers.length > 0) {
    const hasLifeline =
      tariff.hasLifeline ||
      tariff.tiers.some((t) => t.isLifeline) ||
      (tariff.tiers[0]?.maxKwh === 50 && tariff.tiers[1]?.maxKwh === 75);

    if (hasLifeline && netBilledKwh <= 50) {
      // 1. Consumption is <= 50 Units: Consumer qualifies for Life-line Tier only
      const lifelineTier =
        tariff.lifelineTier ||
        tariff.tiers.find((t) => t.isLifeline) ||
        tariff.tiers[0];
      const tierCost = Math.round(netBilledKwh * lifelineTier.rate);

      tierBreakdowns.push({
        tierName: lifelineTier.label || 'Life-line Tier (0 - 50 Units)',
        kwhInTier: netBilledKwh,
        ratePerKwh: lifelineTier.rate,
        cost: tierCost,
      });

      energyCharges = tierCost;
    } else {
      // 2. Consumption is > 50 Units (or tariff does not have lifeline):
      // Life-line tier is NOT used. Calculation starts directly from Step 1 (0 - 75 Units).
      const slabsToUse = hasLifeline
        ? tariff.tiers.filter((t) => !t.isLifeline && t.maxKwh !== 50)
        : tariff.tiers;

      let remainingKwh = netBilledKwh;
      let previousMax = 0;

      for (const tier of slabsToUse) {
        if (remainingKwh <= 0) break;
        const tierCapacity = tier.maxKwh === Infinity ? Infinity : tier.maxKwh - previousMax;
        const kwhInThisTier = Math.min(remainingKwh, tierCapacity);
        const tierCost = Math.round(kwhInThisTier * tier.rate);

        tierBreakdowns.push({
          tierName: tier.label,
          kwhInTier: kwhInThisTier,
          ratePerKwh: tier.rate,
          cost: tierCost,
        });

        energyCharges += tierCost;
        remainingKwh -= kwhInThisTier;
        previousMax = tier.maxKwh;
      }
    }
  } else if (tariff.structure === 'tou') {
    const peakPct = (input.tou.peakPercent || 25) / 100;
    const midPeakPct = (input.tou.midPeakPercent || 35) / 100;
    const offPeakPct = (input.tou.offPeakPercent || 40) / 100;

    const peakKwh = netBilledKwh * peakPct;
    const midPeakKwh = netBilledKwh * midPeakPct;
    const offPeakKwh = netBilledKwh * offPeakPct;

    const peakRate = tariff.peakRate || 0.38;
    const midPeakRate = tariff.midPeakRate || 0.24;
    const offPeakRate = tariff.offPeakRate || 0.14;

    const peakCost = Math.round(peakKwh * peakRate);
    const midPeakCost = Math.round(midPeakKwh * midPeakRate);
    const offPeakCost = Math.round(offPeakKwh * offPeakRate);

    energyCharges = peakCost + midPeakCost + offPeakCost;

    touCharges = {
      peakKwh,
      peakCost,
      midPeakKwh,
      midPeakCost,
      offPeakKwh,
      offPeakCost,
    };
  } else if (tariff.structure === 'commercial') {
    const flatRate = tariff.flatRate || 0.12;
    energyCharges = Math.round(netBilledKwh * flatRate);
  } else {
    // Flat Rate
    const flatRate = tariff.flatRate || 0.15;
    energyCharges = Math.round(netBilledKwh * flatRate);
  }

  // 5. Fixed Base / Meter Customer Charge
  const fixedCustomerCharge = Math.round(tariff.fixedBaseFee * billingDaysFactor);

  // 6. Delivery, Fuel Adjustment, & Riders
  const transmissionDeliveryCharge = Math.round(netBilledKwh * (tariff.transmissionDeliveryPerKwh || 0));
  const fuelAdjustmentCharge = Math.round(netBilledKwh * (tariff.fuelAdjustmentPerKwh || 0));
  const environmentalRiderCharge = Math.round(energyCharges * ((tariff.environmentalRiderPercent || 0) / 100));

  // 7. Subtotal before credits
  const subtotalBeforeCredits = Math.round(
    fixedCustomerCharge +
    energyCharges +
    demandCharge +
    transmissionDeliveryCharge +
    fuelAdjustmentCharge +
    environmentalRiderCharge
  );

  // 8. Apply Solar credits
  const subtotalAfterCredits = Math.round(Math.max(0, subtotalBeforeCredits - solarCredit));

  // 9. State/Local Taxes (VAT 5%)
  const taxes = Math.round(subtotalAfterCredits * ((tariff.taxPercent || 5.0) / 100));

  // 10. Total Bill
  const totalBill = Math.round(subtotalAfterCredits + taxes);

  // 11. Metrics & Projections
  const daysInPeriod = input.billingDays || 30;
  const dailyAverageCost = Math.round(totalBill / daysInPeriod);
  const dailyAverageKwh = Math.round((grossConsumptionKwh / daysInPeriod) * 10) / 10;
  const annualProjectedCost = Math.round((totalBill / daysInPeriod) * 365);
  const annualProjectedKwh = Math.round((grossConsumptionKwh / daysInPeriod) * 365);
  const effectiveRatePerKwh = netBilledKwh > 0 ? Math.round((totalBill / netBilledKwh) * 100) / 100 : 0;

  // Bangladesh Grid average: ~0.55 kg CO2e / kWh
  const carbonFootprintKg = netBilledKwh * 0.55;
  const equivalentTreesNeeded = Math.ceil(carbonFootprintKg / 21.7); // 1 mature tree absorbs ~21.7 kg CO2/year

  return {
    grossConsumptionKwh,
    solarGeneratedKwh,
    solarSelfConsumedKwh,
    solarExportedKwh,
    netBilledKwh,
    fixedCustomerCharge,
    energyCharges,
    tierBreakdowns,
    touCharges,
    transmissionDeliveryCharge,
    fuelAdjustmentCharge,
    environmentalRiderCharge,
    demandCharge,
    sanctionLoadKw,
    demandChargeRatePerKw,
    subtotalBeforeCredits,
    solarCredit,
    subtotalAfterCredits,
    taxes,
    totalBill,
    dailyAverageCost,
    dailyAverageKwh,
    annualProjectedCost,
    annualProjectedKwh,
    effectiveRatePerKwh,
    carbonFootprintKg,
    equivalentTreesNeeded,
  };
}

export function generateEnergySavingRecommendations(
  input: CalculationInput,
  breakdown: DetailedCostBreakdown
): SavingRecommendation[] {
  const recs: SavingRecommendation[] = [];
  const tariff: TariffPlan =
    input.customTariff ||
    DEFAULT_TARIFFS.find((t) => t.id === input.selectedTariffId) ||
    DEFAULT_TARIFFS[0];

  // AC recommendation (Set temperature to 25°C - standard BERC guideline in BD)
  if (breakdown.grossConsumptionKwh > 250) {
    const coolingSavingsKwh = breakdown.grossConsumptionKwh * 0.12;
    const estSave = coolingSavingsKwh * (breakdown.effectiveRatePerKwh || 7.50);
    recs.push({
      id: 'rec_thermostat',
      title: 'Maintain AC at 25°C Setpoint (BERC Recommended)',
      description: 'Running air conditioning at 25°C instead of 18-20°C reduces compressor load by up to 15-20%, saving significant electricity.',
      estimatedMonthlySavings: estSave,
      estimatedKwhReduction: coolingSavingsKwh,
      impactLevel: 'high',
      category: 'Cooling & Climate',
      applied: false,
    });
  }

  // Lifeline Tier Re-qualification recommendation
  if (tariff.hasLifeline && breakdown.netBilledKwh > 50 && breakdown.netBilledKwh <= 75) {
    const currentCost = breakdown.energyCharges;
    const lifelineCost = 50 * 4.63;
    const estSave = Math.max(20, currentCost - lifelineCost);
    recs.unshift({
      id: 'rec_lifeline_threshold',
      title: 'Reduce Usage Under 50 Units to Re-qualify for Life-Line Rate (৳4.63/Unit)',
      description: `Your monthly usage is ${Math.round(breakdown.netBilledKwh)} Units. Reducing by only ${Math.round(breakdown.netBilledKwh - 50)} Units lets you qualify for the subsidized Life-line tariff (৳4.63/Unit) instead of regular Step-1 rates (৳5.26/Unit).`,
      estimatedMonthlySavings: estSave,
      estimatedKwhReduction: Math.round(breakdown.netBilledKwh - 50),
      impactLevel: 'high',
      category: 'Slab Optimization',
      applied: false,
    });
  }

  // TOU Shift recommendation
  if (input.tou && input.tou.peakPercent > 20) {
    const shiftKwh = breakdown.netBilledKwh * 0.15;
    const estSave = shiftKwh * 5.0; // approx peak/off-peak rate delta in BD
    recs.push({
      id: 'rec_tou_shift',
      title: 'Shift Heavy Loads Outside Peak Hours (5 PM - 11 PM)',
      description: 'Run water lifting motors, washing machines, and heavy cooking appliances before 5 PM or after 11 PM to avoid peak slab charges.',
      estimatedMonthlySavings: estSave,
      estimatedKwhReduction: 0,
      impactLevel: 'high',
      category: 'Load Shifting',
      applied: false,
    });
  }

  // BLDC Fan upgrade
  recs.push({
    id: 'rec_bldc_fan',
    title: 'Switch to BLDC Energy Efficient Ceiling Fans',
    description: 'Replacing older 75W induction ceiling fans with 28-32W BLDC fans cuts ceiling fan electricity usage by over 60%.',
    estimatedMonthlySavings: 450.00,
    estimatedKwhReduction: 60,
    impactLevel: 'high',
    category: 'Fans & Ventilation',
    applied: false,
  });

  // LED Lighting upgrade
  recs.push({
    id: 'rec_led_upgrade',
    title: 'Complete 100% LED Lighting Transition',
    description: 'Replacing standard fluorescent tube lights and incandescent bulbs with 9W-18W high lumen LED fixtures saves 70% lighting power.',
    estimatedMonthlySavings: 280.00,
    estimatedKwhReduction: 35,
    impactLevel: 'medium',
    category: 'Lighting & Fixtures',
    applied: false,
  });

  // Solar Rooftop Net Metering
  if (!input.solar.hasSolar && breakdown.grossConsumptionKwh > 300) {
    const solarSave = breakdown.totalBill * 0.70;
    recs.push({
      id: 'rec_solar_pv',
      title: 'Install Rooftop Solar Net Metering (SREDA / BERC)',
      description: 'Generate your own clean solar power and export surplus generation directly under Bangladesh SREDA Net Metering guidelines.',
      estimatedMonthlySavings: solarSave,
      estimatedKwhReduction: breakdown.grossConsumptionKwh * 0.75,
      impactLevel: 'high',
      category: 'Renewable Energy',
      applied: false,
    });
  }

  // Eliminate Phantom Standby Loads
  recs.push({
    id: 'rec_phantom_load',
    title: 'Eliminate Standby Phantom Loads',
    description: 'Turn off TV set-top boxes, chargers, and microwaves from the main switchboard when not in use to avoid phantom energy drain.',
    estimatedMonthlySavings: 150.00,
    estimatedKwhReduction: 20,
    impactLevel: 'low',
    category: 'Electronics',
    applied: false,
  });

  return recs;
}

export function formatCurrency(
  amount: number,
  currency: CalculationInput['currency'],
  allowDecimals: boolean = false
): string {
  const val = Math.max(0, amount);
  const formatted = allowDecimals
    ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(val).toLocaleString('en-US');
  if (currency.position === 'after') {
    return `${formatted} ${currency.symbol || '৳'}`;
  }
  return `${currency.symbol || '৳'} ${formatted}`;
}
