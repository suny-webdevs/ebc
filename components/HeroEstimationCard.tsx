'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import {
  Zap,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CalculationInput, DetailedCostBreakdown, TariffPlan } from '../lib/types';
import { DEFAULT_TARIFFS } from '../lib/tariffs';
import { formatCurrency } from '../lib/calculator';

interface HeroEstimationCardProps {
  input: CalculationInput;
  breakdown: DetailedCostBreakdown;
  onKwhChange: (kwh: number) => void;
  onSanctionLoadChange?: (loadKw: number) => void;
  onBillingDaysChange: (days: number) => void;
  onTariffChange: (tariffId: string) => void;
  onSubmitAudit: () => void;
  onScrollToCalculator?: () => void;
}

export function HeroEstimationCard({
  input,
  breakdown,
  onKwhChange,
  onSanctionLoadChange,
  onBillingDaysChange,
  onTariffChange,
  onSubmitAudit,
}: HeroEstimationCardProps) {
  const currentTariff =
    DEFAULT_TARIFFS.find((t) => t.id === input.selectedTariffId) || DEFAULT_TARIFFS[0];

  // GSAP Ref for smooth numerical animation on total bill
  const totalBillRef = useRef<HTMLHeadingElement>(null);
  const prevTotalRef = useRef<number>(breakdown.totalBill);

  useEffect(() => {
    if (!totalBillRef.current) return;
    const startVal = prevTotalRef.current;
    const endVal = breakdown.totalBill;

    const proxy = { val: startVal };
    const tween = gsap.to(proxy, {
      val: endVal,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (totalBillRef.current) {
          totalBillRef.current.innerText = formatCurrency(proxy.val, input.currency);
        }
      },
    });

    prevTotalRef.current = endVal;
    return () => {
      tween.kill();
    };
  }, [breakdown.totalBill, input.currency]);

  // Determine current Tier status
  let tierStatus = { label: 'Life-line Tier (≤ 50 Units)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (breakdown.netBilledKwh > 600) {
    tierStatus = { label: 'Step 6 (> 600 Units @ ৳17.35)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  } else if (breakdown.netBilledKwh > 400) {
    tierStatus = { label: 'Step 5 (401 - 600 Units @ ৳15.01)', color: 'text-purple-700 bg-purple-50 border-purple-200' };
  } else if (breakdown.netBilledKwh > 300) {
    tierStatus = { label: 'Step 4 (301 - 400 Units @ ৳9.62)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  } else if (breakdown.netBilledKwh > 200) {
    tierStatus = { label: 'Step 3 (201 - 300 Units @ ৳9.10)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  } else if (breakdown.netBilledKwh > 75) {
    tierStatus = { label: 'Step 2 (76 - 200 Units @ ৳8.50)', color: 'text-sky-700 bg-sky-50 border-sky-200' };
  } else if (breakdown.netBilledKwh > 50) {
    tierStatus = { label: 'Step 1 (0 - 75 Units @ ৳5.26)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Column: Interactive Inputs & Parameters */}
      <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Card Header & Tariff Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Tariff Category
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${tierStatus.color}`}>
                  {tierStatus.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {currentTariff.name}
              </h3>
            </div>

            <select
              id="calculator-tariff-select"
              aria-label="Tariff Plan Selector"
              value={input.selectedTariffId}
              onChange={(e) => onTariffChange(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
            >
              {DEFAULT_TARIFFS.map((t: TariffPlan) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Consumption Slider & Number Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="calculator-kwh-slider" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Monthly Electricity Consumption (Units / kWh)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="calculator-kwh-number-input"
                  type="number"
                  aria-label="Electricity Consumption in Units"
                  min={0}
                  max={6000}
                  step={5}
                  value={Math.round(breakdown.grossConsumptionKwh)}
                  onChange={(e) => onKwhChange(Math.max(0, Number(e.target.value) || 0))}
                  className="w-20 px-2.5 py-1 text-right font-extrabold text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-600">Units</span>
              </div>
            </div>

            <input
              id="calculator-kwh-slider"
              type="range"
              aria-label="Electricity consumption slider"
              min={0}
              max={2500}
              step={10}
              value={Math.min(2500, Math.round(breakdown.grossConsumptionKwh))}
              onChange={(e) => onKwhChange(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[10px] font-semibold text-slate-400 px-0.5">
              <span>0 Units</span>
              <span>50 (Life-line)</span>
              <span>200 (Step 2)</span>
              <span>400 (Step 4)</span>
              <span>600+ (Step 6)</span>
            </div>
          </div>

          {/* Sanctioned Load Field & Presets */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <label htmlFor="calculator-sanction-load-input" className="text-xs font-bold text-slate-800">
                    Sanctioned Load / অনুমোদিত লোড (kW)
                  </label>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Default: {currentTariff.defaultSanctionLoadKw || 2} kW
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Demand charge: {formatCurrency(currentTariff.demandChargePerKw || 42, input.currency, true)}/kW/mo · Subtotal: {formatCurrency(breakdown.demandCharge, input.currency)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <input
                  id="calculator-sanction-load-input"
                  type="number"
                  aria-label="Sanctioned load in kW"
                  min={0.5}
                  max={500}
                  step={0.5}
                  value={input.sanctionLoadKw !== undefined ? input.sanctionLoadKw : (currentTariff.defaultSanctionLoadKw || 2)}
                  onChange={(e) => {
                    const val = Math.max(0.5, parseFloat(e.target.value) || 0.5);
                    if (onSanctionLoadChange) onSanctionLoadChange(val);
                  }}
                  className="w-20 px-2.5 py-1.5 text-right font-bold text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-600">kW</span>

                {input.sanctionLoadKw !== undefined && input.sanctionLoadKw !== currentTariff.defaultSanctionLoadKw && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSanctionLoadChange && currentTariff.defaultSanctionLoadKw) {
                        onSanctionLoadChange(currentTariff.defaultSanctionLoadKw);
                      }
                    }}
                    className="px-2 py-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                    title="Reset to category default"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Quick kW Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-medium text-slate-500 mr-1">Quick Presets:</span>
              {[1, 2, 3, 5, 7.5, 10, 15, 20].map((kw) => {
                const isActive = (input.sanctionLoadKw ?? currentTariff.defaultSanctionLoadKw ?? 2) === kw;
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => onSanctionLoadChange && onSanctionLoadChange(kw)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {kw} kW
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Days Selector */}
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Billing Cycle Period:</span>
            </div>
            <div className="flex items-center gap-1">
              {[28, 30, 31].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => onBillingDaysChange(days)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                    (input.billingDays || 30) === days
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* BERC Slab Status Banner for Residential */}
          {currentTariff.hasLifeline && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
              breakdown.netBilledKwh <= 50
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${
                breakdown.netBilledKwh <= 50 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <div className="text-xs leading-relaxed">
                {breakdown.netBilledKwh <= 50 ? (
                  <>
                    <strong className="font-bold">Life-Line Subsidized Tier Active:</strong> Monthly usage is ≤ 50 units. Your entire electricity consumption is calculated at the subsidized rate of <strong>৳4.63/Unit</strong>.
                  </>
                ) : (
                  <>
                    <strong className="font-bold">Multi-Step Slabs Active:</strong> Total usage exceeds 50 units (Life-line bypassed). Billed across Step 1 (0–75 @ ৳5.26), Step 2 (76–200 @ ৳8.50), Step 3 (201–300 @ ৳9.10), Step 4 (301–400 @ ৳9.62), Step 5 (401–600 @ ৳15.01), and Step 6 (&gt;600 @ ৳17.35).
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Prominent Estimated Total Bill Card */}
      <div className="lg:col-span-5 bg-slate-950 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden flex flex-col justify-between border border-slate-800">
        {/* Ambient Top Glow */}
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Estimated Total Bill
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              BERC Verified
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-2">
            <h2
              ref={totalBillRef}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
            >
              {formatCurrency(breakdown.totalBill, input.currency)}
            </h2>
            <p className="text-cyan-300 text-xs font-medium flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{Math.round(breakdown.netBilledKwh)} Units Billed</span>
            </p>
          </div>
        </div>

        {/* Itemized summary rows */}
        <div className="mt-6 space-y-2.5 opacity-95 relative z-10">
          <div className="flex justify-between text-xs py-2 border-b border-slate-800">
            <span className="text-slate-300">Energy Consumption Charge (Slabs)</span>
            <span className="font-bold text-white">
              {formatCurrency(breakdown.energyCharges, input.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs py-2 border-b border-slate-800">
            <span className="text-slate-300">
              Demand Charge ({breakdown.sanctionLoadKw} kW @ {formatCurrency(breakdown.demandChargeRatePerKw, input.currency, true)}/kW)
            </span>
            <span className="font-bold text-white">
              {formatCurrency(breakdown.demandCharge, input.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs py-2 border-b border-slate-800">
            <span className="text-slate-300">Fixed Meter Rent & Service Fee</span>
            <span className="font-bold text-white">
              {formatCurrency(breakdown.fixedCustomerCharge, input.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs py-2">
            <span className="text-slate-300">Government VAT (ভ্যাট 5%)</span>
            <span className="font-bold text-white">
              {formatCurrency(breakdown.taxes, input.currency)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-2 relative z-10">
          <button
            id="calculator-generate-statement-btn"
            type="button"
            onClick={onSubmitAudit}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Generate Itemized Statement & PDF</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
