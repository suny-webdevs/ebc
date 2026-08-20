'use client';

import React, { useState, useEffect } from 'react';
import { Gauge, Calendar, Hash, Zap, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { CalculationInput, Currency } from '../lib/types';
import { formatCurrency } from '../lib/calculator';

interface MeterReadingInputProps {
  input: CalculationInput;
  currency: Currency;
  effectiveRatePerKwh: number;
  onUpdateMeter: (updates: {
    meterPrevious?: number;
    meterCurrent?: number;
    meterMultiplier?: number;
    meterUnits?: number;
    billingDays?: number;
  }) => void;
}

export function MeterReadingInput({
  input,
  currency,
  effectiveRatePerKwh,
  onUpdateMeter,
}: MeterReadingInputProps) {
  // Mode: 'both' / synchronized
  const [activeInputFocus, setActiveInputFocus] = useState<'units' | 'readings'>('readings');

  // Compute calculated values
  const multiplier = input.meterMultiplier || 1;
  const computedFromReadings = Math.max(0, input.meterCurrent - input.meterPrevious) * multiplier;
  
  // Current active units
  const currentUnits = input.meterUnits !== undefined && input.meterUnits >= 0
    ? input.meterUnits
    : computedFromReadings;

  const estimatedCost = currentUnits * (effectiveRatePerKwh || 7.20);

  // Handle direct unit change
  const handleDirectUnitChange = (val: number) => {
    const safeVal = Math.max(0, val);
    const newCurrent = input.meterPrevious + Math.round(safeVal / multiplier);
    onUpdateMeter({
      meterUnits: safeVal,
      meterCurrent: newCurrent,
    });
  };

  // Handle previous reading change
  const handlePreviousChange = (prev: number) => {
    const safePrev = Math.max(0, prev);
    const newUnits = Math.max(0, input.meterCurrent - safePrev) * multiplier;
    onUpdateMeter({
      meterPrevious: safePrev,
      meterUnits: newUnits,
    });
  };

  // Handle current reading change
  const handleCurrentChange = (curr: number) => {
    const safeCurr = Math.max(0, curr);
    const newUnits = Math.max(0, safeCurr - input.meterPrevious) * multiplier;
    onUpdateMeter({
      meterCurrent: safeCurr,
      meterUnits: newUnits,
    });
  };

  // Handle multiplier change
  const handleMultiplierChange = (mult: number) => {
    const safeMult = Math.max(1, mult);
    const newUnits = Math.max(0, input.meterCurrent - input.meterPrevious) * safeMult;
    onUpdateMeter({
      meterMultiplier: safeMult,
      meterUnits: newUnits,
    });
  };

  // BERC Slab categorization helper
  const getSlabTierBadge = (units: number) => {
    if (units <= 50) return { label: 'Life-line Slab (0 - 50)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (units <= 75) return { label: 'Step 1 (0 - 75 Units)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    if (units <= 200) return { label: 'Step 2 (76 - 200 Units)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    if (units <= 300) return { label: 'Step 3 (201 - 300 Units)', color: 'bg-purple-50 text-purple-800 border-purple-200' };
    if (units <= 400) return { label: 'Step 4 (301 - 400 Units)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (units <= 600) return { label: 'Step 5 (401 - 600 Units)', color: 'bg-orange-50 text-orange-800 border-orange-200' };
    return { label: 'Step 6 (> 600 Units)', color: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  const currentBadge = getSlabTierBadge(currentUnits);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Bangladesh Utility Meter Audit
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentBadge.color}`}>
              {currentBadge.label}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-0.5">Electric Meter Reading & Units Calculator</h3>
          <p className="text-xs text-slate-300 mt-1">
            Enter your consumed <strong>Units directly</strong> or input <strong>Previous & Current meter readings</strong> (DESCO, DPDC, BPDB, BREB, NESCO, WZPDCL).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 p-3.5 rounded-lg border border-slate-700 shrink-0">
          <div>
            <div className="text-[11px] text-slate-400">Total Billed Units</div>
            <div className="text-2xl font-black text-blue-400">
              {Math.round(currentUnits).toLocaleString()} <span className="text-xs font-normal text-slate-300">Units (kWh)</span>
            </div>
          </div>
          <div className="h-9 w-px bg-slate-700" />
          <div>
            <div className="text-[11px] text-slate-400">Estimated Bill (Taka)</div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(estimatedCost, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section: 2 Synchronized Input Approaches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: DIRECT UNITS FIELD (Highlighted prominently as requested) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-white border-2 border-blue-500/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <label htmlFor="direct-units-input" className="text-sm font-bold text-slate-900 block">
                  Direct Units Input (ইউনিট)
                </label>
                <span className="text-[11px] text-slate-500">Put your total monthly units directly</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
              Quick Input
            </span>
          </div>

          <div className="relative">
            <input
              id="direct-units-input"
              type="number"
              min={0}
              max={10000}
              value={Math.round(currentUnits)}
              onFocus={() => setActiveInputFocus('units')}
              onChange={(e) => handleDirectUnitChange(Number(e.target.value) || 0)}
              className="w-full text-3xl font-black px-4 py-3 bg-white border-2 border-blue-500 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-inner"
              placeholder="e.g. 250"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
              Units / kWh
            </span>
          </div>

          {/* Quick preset unit buttons */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Common Bangladesh Household Units:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[50, 75, 120, 200, 300, 450, 650].map((presetUnits) => (
                <button
                  key={presetUnits}
                  type="button"
                  onClick={() => handleDirectUnitChange(presetUnits)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    Math.round(currentUnits) === presetUnits
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {presetUnits} Units
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: PREVIOUS READING & CURRENT READING INPUTS */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Gauge className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Previous & Current Meter Readings (মিটার রিডিং)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Calculate units from physical post/prepaid meter dial numbers
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Previous Reading */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label htmlFor="meter-prev-input" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                Previous Reading (পূর্ববর্তী রিডিং)
              </label>
              <input
                id="meter-prev-input"
                type="number"
                min={0}
                value={input.meterPrevious}
                onFocus={() => setActiveInputFocus('readings')}
                onChange={(e) => handlePreviousChange(Number(e.target.value) || 0)}
                className="w-full text-lg font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">From previous electric bill</span>
            </div>

            {/* Current Reading */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label htmlFor="meter-curr-input" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-600" />
                Current Reading (বর্তমান রিডিং)
              </label>
              <input
                id="meter-curr-input"
                type="number"
                min={0}
                value={input.meterCurrent}
                onFocus={() => setActiveInputFocus('readings')}
                onChange={(e) => handleCurrentChange(Number(e.target.value) || 0)}
                className="w-full text-lg font-bold px-3 py-2 bg-white border border-blue-300 rounded-lg text-slate-900 focus:outline-blue-500 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Latest meter dial / index</span>
            </div>

            {/* Meter Multiplier */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label htmlFor="meter-multiplier-input" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                Meter Constant / Multiplier
              </label>
              <input
                id="meter-multiplier-input"
                type="number"
                min={1}
                step={1}
                value={input.meterMultiplier}
                onChange={(e) => handleMultiplierChange(Number(e.target.value) || 1)}
                className="w-full text-base font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Standard residential is 1.0</span>
            </div>

            {/* Billing Cycle Days */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label htmlFor="meter-cycle-days-input" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Billing Period (দিন / Days)
              </label>
              <input
                id="meter-cycle-days-input"
                type="number"
                min={1}
                max={90}
                value={input.billingDays || 30}
                onChange={(e) => onUpdateMeter({ billingDays: Math.max(1, Number(e.target.value) || 30) })}
                className="w-full text-base font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500 focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Normally 28 to 33 days</span>
            </div>
          </div>
        </div>

      </div>

      {/* Meter Math Summary & Live Verification Box */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-700">
          <span className="text-slate-500 font-normal">Formula:</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            {input.meterCurrent} (Current)
          </span>
          <span className="text-slate-400 font-bold">-</span>
          <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            {input.meterPrevious} (Previous)
          </span>
          <span className="text-slate-400 font-bold">=</span>
          <span className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg font-extrabold shadow-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {Math.round(currentUnits)} Units (kWh)
          </span>
          {multiplier > 1 && (
            <>
              <span className="text-slate-400 font-bold">×</span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                {multiplier} Multiplier
              </span>
            </>
          )}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Daily consumption:</span>
          <strong className="text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {(currentUnits / (input.billingDays || 30)).toFixed(1)} Units/day
          </strong>
        </div>
      </div>
    </div>
  );
}

