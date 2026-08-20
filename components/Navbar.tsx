'use client';

import React from 'react';
import { Zap, RefreshCw, Layers, DollarSign, Sparkles } from 'lucide-react';
import { Currency, TariffPlan } from '../lib/types';
import { CURRENCIES, DEFAULT_TARIFFS, PRESET_PROFILES } from '../lib/tariffs';

interface NavbarProps {
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  selectedTariffId: string;
  onTariffChange: (tariffId: string) => void;
  onLoadPreset: (presetId: string) => void;
  onReset: () => void;
}

export function Navbar({
  currentCurrency,
  onCurrencyChange,
  selectedTariffId,
  onTariffChange,
  onLoadPreset,
  onReset,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              EBC <span className="text-blue-600 font-medium">Calculator</span>
            </span>
            <span className="hidden md:inline-flex text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              v2.4
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Profile Dropdown */}
          <div className="relative group">
            <button
              id="preset-profiles-btn"
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sample Profiles</span>
              <span className="sm:hidden">Presets</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 p-2 bg-white rounded-xl shadow-xl border border-slate-200 hidden group-hover:block group-focus-within:block z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Household Presets
              </div>
              {PRESET_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onLoadPreset(p.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-slate-800 transition-colors text-xs flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-900">{p.name}</span>
                  <span className="text-[11px] text-slate-500">{p.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Regional Tariff Selector */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="tariff-selector-nav"
              aria-label="Regional Tariff Plan"
              value={selectedTariffId}
              onChange={(e) => onTariffChange(e.target.value)}
              className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
            >
              {DEFAULT_TARIFFS.map((t: TariffPlan) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="currency-selector-nav"
              aria-label="Display Currency"
              value={currentCurrency.code}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onCurrencyChange(found);
              }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            id="reset-calculator-btn"
            onClick={onReset}
            title="Reset to default settings"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
