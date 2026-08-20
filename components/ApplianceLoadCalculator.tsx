'use client';

import React, { useState } from 'react';
import {
  AirVent,
  Refrigerator,
  Flame,
  Car,
  Shirt,
  Sparkles,
  Tv,
  Lightbulb,
  Laptop,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { ApplianceItem, Currency } from '../lib/types';
import { INITIAL_APPLIANCES } from '../lib/tariffs';
import { calculateApplianceKwh, formatCurrency } from '../lib/calculator';

interface ApplianceLoadCalculatorProps {
  appliances: ApplianceItem[];
  currency: Currency;
  effectiveRatePerKwh: number;
  onUpdateAppliance: (id: string, updates: Partial<ApplianceItem>) => void;
  onAddAppliance: (appliance: ApplianceItem) => void;
  onRemoveAppliance: (id: string) => void;
  onResetToDefault: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  cooling_heating: 'HVAC & Climate',
  kitchen: 'Kitchen & Refrigeration',
  laundry: 'Laundry & Cleaning',
  transportation: 'Electric Vehicles',
  water_heating: 'Water Heating',
  electronics: 'Electronics & Lighting',
  other: 'Custom & Other Loads',
};

export function ApplianceLoadCalculator({
  appliances,
  currency,
  effectiveRatePerKwh,
  onUpdateAppliance,
  onAddAppliance,
  onRemoveAppliance,
  onResetToDefault,
}: ApplianceLoadCalculatorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New appliance form state
  const [newName, setNewName] = useState('');
  const [newWattage, setNewWattage] = useState(1000);
  const [newHours, setNewHours] = useState(3);
  const [newCategory, setNewCategory] = useState<ApplianceItem['category']>('other');

  const filteredAppliances = appliances.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const totalApplianceKwh = appliances
    .filter((a) => a.enabled)
    .reduce((sum, a) => sum + calculateApplianceKwh(a.wattage, a.hoursPerDay, a.quantity, a.daysPerMonth), 0);

  const totalApplianceCost = totalApplianceKwh * (effectiveRatePerKwh || 0.16);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newApp: ApplianceItem = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      wattage: Math.max(1, newWattage),
      hoursPerDay: Math.max(0.1, newHours),
      quantity: 1,
      daysPerMonth: 30,
      enabled: true,
      iconName: 'Zap',
    };

    onAddAppliance(newApp);
    setNewName('');
    setNewWattage(1000);
    setNewHours(3);
    setShowAddForm(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cooling_heating':
        return <AirVent className="w-4 h-4 text-sky-500" />;
      case 'transportation':
        return <Car className="w-4 h-4 text-indigo-500" />;
      case 'kitchen':
        return <Refrigerator className="w-4 h-4 text-emerald-500" />;
      case 'water_heating':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'laundry':
        return <Shirt className="w-4 h-4 text-purple-500" />;
      case 'electronics':
        return <Tv className="w-4 h-4 text-amber-500" />;
      default:
        return <Zap className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Appliance Load Breakdown
          </span>
          <h3 className="text-xl font-bold text-white mt-0.5">Itemized Household Load Calculator</h3>
          <p className="text-xs text-slate-300 mt-1">
            Toggle devices, adjust operating hours, or add custom loads to calculate exact consumption.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-lg border border-slate-700">
          <div>
            <div className="text-[11px] text-slate-400">Total Appliance Load</div>
            <div className="text-xl font-extrabold text-blue-400">
              {Math.round(totalApplianceKwh).toLocaleString()} <span className="text-xs font-normal text-slate-300">kWh/mo</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[11px] text-slate-400">Est. Appliance Cost</div>
            <div className="text-xl font-extrabold text-white">
              {formatCurrency(totalApplianceCost, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Appliances ({appliances.length})
          </button>
          {Object.entries(CATEGORY_NAMES).map(([catKey, catLabel]) => {
            const count = appliances.filter((a) => a.category === catKey).length;
            if (count === 0) return null;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === catKey
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {catLabel} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Load</span>
          </button>
          <button
            type="button"
            onClick={onResetToDefault}
            title="Reset to default appliance catalog"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Custom Load Modal / Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-4 sm:p-5 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-900 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">
            Add Custom Appliance / Equipment
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appliance Name
              </label>
              <input
                type="text"
                placeholder="e.g. Pool Pump, Space Heater"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ApplianceItem['category'])}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500"
              >
                {Object.entries(CATEGORY_NAMES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Power Draw (Watts)
              </label>
              <input
                type="number"
                min={1}
                max={50000}
                value={newWattage}
                onChange={(e) => setNewWattage(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Hours
              </label>
              <input
                type="number"
                min={0.1}
                max={24}
                step={0.1}
                value={newHours}
                onChange={(e) => setNewHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Appliance
            </button>
          </div>
        </form>
      )}

      {/* Appliance Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppliances.map((app) => {
          const appKwh = calculateApplianceKwh(app.wattage, app.hoursPerDay, app.quantity, app.daysPerMonth);
          const appCost = appKwh * (effectiveRatePerKwh || 0.16);

          return (
            <div
              key={app.id}
              className={`p-4 rounded-xl border transition-all ${
                app.enabled
                  ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  : 'bg-slate-50/60 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getCategoryIcon(app.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{app.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {CATEGORY_NAMES[app.category] || 'General Appliance'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Enable / Disable Toggle */}
                  <button
                    type="button"
                    onClick={() => onUpdateAppliance(app.id, { enabled: !app.enabled })}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                      app.enabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        app.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  {/* Remove custom load button if custom */}
                  {app.id.startsWith('custom_') && (
                    <button
                      type="button"
                      onClick={() => onRemoveAppliance(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Delete custom appliance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sliders for Power & Operating Hours */}
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span>Power Rating (Watts)</span>
                    <span className="font-semibold text-slate-900">{app.wattage} W</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={10000}
                    step={10}
                    value={app.wattage}
                    disabled={!app.enabled}
                    onChange={(e) => onUpdateAppliance(app.id, { wattage: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Usage (Hours / Day)
                    </span>
                    <span className="font-semibold text-slate-900">{app.hoursPerDay} hrs</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={24}
                    step={0.1}
                    value={app.hoursPerDay}
                    disabled={!app.enabled}
                    onChange={(e) => onUpdateAppliance(app.id, { hoursPerDay: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Monthly Computed Cost for this device */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{Math.round(appKwh)} kWh/month</span>
                <span className="font-bold text-slate-900">{formatCurrency(appCost, currency)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
