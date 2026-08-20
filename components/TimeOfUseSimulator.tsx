'use client';

import React from 'react';
import { Clock, Moon, Sun, Flame, Zap, ArrowRightLeft } from 'lucide-react';
import { TOUDistribution, Currency } from '../lib/types';
import { formatCurrency } from '../lib/calculator';

interface TimeOfUseSimulatorProps {
  tou: TOUDistribution;
  currency: Currency;
  netKwh: number;
  peakRate?: number;
  midPeakRate?: number;
  offPeakRate?: number;
  onUpdateTOU: (updates: Partial<TOUDistribution>) => void;
}

export function TimeOfUseSimulator({
  tou,
  currency,
  netKwh,
  peakRate = 0.42,
  midPeakRate = 0.29,
  offPeakRate = 0.18,
  onUpdateTOU,
}: TimeOfUseSimulatorProps) {
  const peakKwh = (netKwh * tou.peakPercent) / 100;
  const midPeakKwh = (netKwh * tou.midPeakPercent) / 100;
  const offPeakKwh = (netKwh * tou.offPeakPercent) / 100;

  const peakCost = peakKwh * peakRate;
  const midPeakCost = midPeakKwh * midPeakRate;
  const offPeakCost = offPeakKwh * offPeakRate;
  const totalEnergyCost = peakCost + midPeakCost + offPeakCost;

  // Handle peak slider change while balancing the other two
  const handlePeakChange = (newPeak: number) => {
    const remaining = 100 - newPeak;
    // Distribute proportionally to mid and off
    const currentSub = tou.midPeakPercent + tou.offPeakPercent || 1;
    const newMid = Math.round((tou.midPeakPercent / currentSub) * remaining);
    const newOff = 100 - newPeak - newMid;
    onUpdateTOU({
      peakPercent: newPeak,
      midPeakPercent: newMid,
      offPeakPercent: newOff,
    });
  };

  const handleOffPeakChange = (newOff: number) => {
    const remaining = 100 - newOff;
    const currentSub = tou.peakPercent + tou.midPeakPercent || 1;
    const newPeak = Math.round((tou.peakPercent / currentSub) * remaining);
    const newMid = 100 - newOff - newPeak;
    onUpdateTOU({
      peakPercent: newPeak,
      midPeakPercent: newMid,
      offPeakPercent: newOff,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Time-of-Use (TOU) Smart Tariff
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-0.5">24-Hour Load Distribution & Shifting</h3>
          <p className="text-xs text-slate-300 mt-1">
            Electricity rates fluctuate during the day. Shift high-power consumption to off-peak periods to slash your bill.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
          <div>
            <div className="text-[11px] text-slate-400">Total TOU Energy Cost</div>
            <div className="text-xl font-extrabold text-blue-400">
              {formatCurrency(totalEnergyCost, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Schedule Timeline Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-3">
          <span>Standard Utility 24-Hour Rate Windows</span>
          <span className="text-slate-500 font-medium">Daily Schedule</span>
        </div>

        {/* Visual 24-Hour Bar */}
        <div className="w-full h-7 rounded-lg overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
          <div
            className="h-full bg-slate-500 flex items-center justify-center transition-all duration-300"
            style={{ width: '37.5%' }} // 12am - 9am (9 hrs = 37.5%)
            title="Off-Peak: 12:00 AM - 9:00 AM"
          >
            Off-Peak (12AM-9AM)
          </div>
          <div
            className="h-full bg-blue-600 flex items-center justify-center transition-all duration-300"
            style={{ width: '29.16%' }} // 9am - 4pm (7 hrs = 29.16%)
            title="Mid-Peak: 9:00 AM - 4:00 PM"
          >
            Mid-Peak (9AM-4PM)
          </div>
          <div
            className="h-full bg-rose-500 flex items-center justify-center transition-all duration-300"
            style={{ width: '20.84%' }} // 4pm - 9pm (5 hrs = 20.84%)
            title="On-Peak (Expensive!): 4:00 PM - 9:00 PM"
          >
            On-Peak (4PM-9PM)
          </div>
          <div
            className="h-full bg-slate-500 flex items-center justify-center transition-all duration-300"
            style={{ width: '12.5%' }} // 9pm - 12am (3 hrs = 12.5%)
            title="Off-Peak: 9:00 PM - 12:00 AM"
          >
            Off-Peak
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="font-bold text-slate-800">On-Peak ({formatCurrency(peakRate, currency)}/kWh)</span>
            <span className="text-slate-500 text-[11px]">- Highest demand period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="font-bold text-slate-800">Mid-Peak ({formatCurrency(midPeakRate, currency)}/kWh)</span>
            <span className="text-slate-500 text-[11px]">- Daytime baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" />
            <span className="font-bold text-slate-800">Off-Peak ({formatCurrency(offPeakRate, currency)}/kWh)</span>
            <span className="text-slate-500 text-[11px]">- Overnight discounted</span>
          </div>
        </div>
      </div>

      {/* Interactive Distribution Sliders & Costs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* On-Peak Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-rose-50/60 border border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-600" />
              On-Peak Share
            </span>
            <span className="text-sm font-extrabold text-rose-700">{tou.peakPercent}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            value={tou.peakPercent}
            onChange={(e) => handlePeakChange(Number(e.target.value))}
            className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="mt-3 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs">
            <span className="text-rose-700 font-medium">{Math.round(peakKwh)} kWh</span>
            <span className="font-bold text-rose-900">{formatCurrency(peakCost, currency)}</span>
          </div>
        </div>

        {/* Mid-Peak Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50/60 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-blue-600" />
              Mid-Peak Share
            </span>
            <span className="text-sm font-extrabold text-blue-700">{tou.midPeakPercent}%</span>
          </div>
          <div className="h-2 bg-blue-200 rounded-lg overflow-hidden flex">
            <div className="h-full bg-blue-600" style={{ width: `${tou.midPeakPercent}%` }} />
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200/80 flex items-center justify-between text-xs">
            <span className="text-blue-700 font-medium">{Math.round(midPeakKwh)} kWh</span>
            <span className="font-bold text-blue-900">{formatCurrency(midPeakCost, currency)}</span>
          </div>
        </div>

        {/* Off-Peak Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-slate-600" />
              Off-Peak Share
            </span>
            <span className="text-sm font-extrabold text-slate-800">{tou.offPeakPercent}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={85}
            value={tou.offPeakPercent}
            onChange={(e) => handleOffPeakChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">{Math.round(offPeakKwh)} kWh</span>
            <span className="font-bold text-slate-900">{formatCurrency(offPeakCost, currency)}</span>
          </div>
        </div>
      </div>

      {/* Quick Shift CTA */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          <span>
            <strong>Optimization Tip:</strong> Shifting 20% of your peak load to off-peak hours saves{' '}
            <strong className="text-blue-700">
              {formatCurrency(netKwh * 0.2 * (peakRate - offPeakRate), currency)}/month
            </strong>.
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onUpdateTOU({
              peakPercent: 15,
              midPeakPercent: 30,
              offPeakPercent: 55,
            })
          }
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm shadow-blue-500/20"
        >
          Apply Ideal Night-Shift (55% Off-Peak)
        </button>
      </div>
    </div>
  );
}
