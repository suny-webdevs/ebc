'use client';

import React from 'react';
import { Sun, Battery, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';
import { Currency, SolarConfig } from '../lib/types';
import { formatCurrency } from '../lib/calculator';

interface SolarStorageSimulatorProps {
  solar: SolarConfig;
  currency: Currency;
  grossKwh: number;
  onUpdateSolar: (updates: Partial<SolarConfig>) => void;
}

export function SolarStorageSimulator({
  solar,
  currency,
  grossKwh,
  onUpdateSolar,
}: SolarStorageSimulatorProps) {
  // Monthly solar generation = capacity * daily sun hours * 30 days * 0.82 efficiency
  const monthlySolarGen = solar.hasSolar
    ? solar.systemCapacityKw * (solar.dailySunHours || 4.8) * 30 * 0.82
    : 0;

  const selfConsumptionRatio = (solar.selfConsumptionPercent || 65) / 100;
  const selfConsumedKwh = Math.min(grossKwh, monthlySolarGen * selfConsumptionRatio);
  const exportedKwh = Math.max(0, monthlySolarGen - selfConsumedKwh);
  const solarCreditAmount = exportedKwh * (solar.feedInTariffPerKwh || 0.085);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Solar PV & Storage Simulation
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-0.5">Net Energy Metering & Battery Offset</h3>
          <p className="text-xs text-slate-300 mt-1">
            Simulate rooftop solar power generation, home battery self-consumption, and grid feed-in export credits.
          </p>
        </div>

        {/* Enable Solar Switch */}
        <div className="flex items-center gap-3 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
          <span className="text-xs font-semibold text-slate-200">Enable Solar PV</span>
          <button
            type="button"
            onClick={() => onUpdateSolar({ hasSolar: !solar.hasSolar })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              solar.hasSolar ? 'bg-amber-500' : 'bg-slate-600'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                solar.hasSolar ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {solar.hasSolar ? (
        <div className="space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Size */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  PV System Size
                </span>
                <span className="text-amber-600 font-extrabold">{solar.systemCapacityKw.toFixed(1)} kW</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.5}
                value={solar.systemCapacityKw}
                onChange={(e) => onUpdateSolar({ systemCapacityKw: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-2 block">
                Typical rooftop: 5 kW - 10 kW
              </span>
            </div>

            {/* Daily Peak Sun Hours */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Peak Sun Hours / Day
                </span>
                <span className="text-amber-600 font-extrabold">{solar.dailySunHours.toFixed(1)} hrs</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={7.5}
                step={0.1}
                value={solar.dailySunHours}
                onChange={(e) => onUpdateSolar({ dailySunHours: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-2 block">
                US avg: 4.2 - 5.5 sun hours/day
              </span>
            </div>

            {/* Self-Consumption % */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-blue-600" />
                  Self-Consumption
                </span>
                <span className="text-blue-600 font-extrabold">{solar.selfConsumptionPercent}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={solar.selfConsumptionPercent}
                onChange={(e) => onUpdateSolar({ selfConsumptionPercent: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-2 block">
                With battery storage: 75% - 90%
              </span>
            </div>

            {/* Feed-in Tariff Export Credit */}
            <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-slate-600" />
                  Grid Export Credit Rate
                </span>
                <span className="text-slate-800 font-extrabold">{formatCurrency(solar.feedInTariffPerKwh, currency)}/kWh</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.30}
                step={0.005}
                value={solar.feedInTariffPerKwh}
                onChange={(e) => onUpdateSolar({ feedInTariffPerKwh: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 mt-2 block">
                Net metering export credit
              </span>
            </div>
          </div>

          {/* Solar Impact Overview Cards */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600">Total Monthly Solar Yield</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {Math.round(monthlySolarGen).toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/month</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {(monthlySolarGen / 30).toFixed(1)} kWh generated per day
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Direct Self-Consumption</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">
                {Math.round(selfConsumedKwh).toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Directly reduces grid imported billable kWh
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Exported Grid Credit</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(solarCreditAmount, currency)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {Math.round(exportedKwh)} kWh exported back to grid
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center">
          <Sun className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-70" />
          <h4 className="text-sm font-bold text-slate-800">Solar Simulation is Currently Disabled</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Toggle &quot;Enable Solar PV&quot; above to model the bill reduction, solar array sizing, and exported net metering savings for your property.
          </p>
          <button
            type="button"
            onClick={() => onUpdateSolar({ hasSolar: true, systemCapacityKw: 6.5, dailySunHours: 4.8 })}
            className="mt-4 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            Activate 6.5 kW Solar System
          </button>
        </div>
      )}
    </div>
  );
}
