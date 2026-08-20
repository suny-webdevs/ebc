'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Layers,
  Percent,
  Leaf,
  DollarSign,
  Zap,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { CalculationInput, DetailedCostBreakdown, TariffPlan } from '../lib/types';
import { DEFAULT_TARIFFS } from '../lib/tariffs';
import { formatCurrency } from '../lib/calculator';

interface CostBreakdownReportProps {
  input: CalculationInput;
  breakdown: DetailedCostBreakdown;
  onOpenPdfModal: () => void;
  onQuickDownloadPdf: () => void;
}

export function CostBreakdownReport({
  input,
  breakdown,
  onOpenPdfModal,
  onQuickDownloadPdf,
}: CostBreakdownReportProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('itemized');

  const tariff: TariffPlan =
    input.customTariff ||
    DEFAULT_TARIFFS.find((t) => t.id === input.selectedTariffId) ||
    DEFAULT_TARIFFS[0];

  const toggleSection = (sec: string) => {
    setExpandedSection(expandedSection === sec ? null : sec);
  };

  // Month-by-month seasonal projections (simulating summer peak cooling and winter heating)
  const seasonalMultipliers = [
    { month: 'Jan', mult: 1.15, season: 'Winter' },
    { month: 'Feb', mult: 1.05, season: 'Winter' },
    { month: 'Mar', mult: 0.88, season: 'Spring' },
    { month: 'Apr', mult: 0.82, season: 'Spring' },
    { month: 'May', mult: 0.95, season: 'Spring' },
    { month: 'Jun', mult: 1.28, season: 'Summer' },
    { month: 'Jul', mult: 1.42, season: 'Summer (Peak)' },
    { month: 'Aug', mult: 1.38, season: 'Summer (Peak)' },
    { month: 'Sep', mult: 1.12, season: 'Autumn' },
    { month: 'Oct', mult: 0.85, season: 'Autumn' },
    { month: 'Nov', mult: 0.92, season: 'Autumn' },
    { month: 'Dec', mult: 1.18, season: 'Winter' },
  ];

  const maxMonthCost = Math.max(...seasonalMultipliers.map((s) => breakdown.totalBill * s.mult));

  // Compute breakdown percentages for the stacked visual bar
  const total = breakdown.totalBill || 1;
  const energyPct = ((breakdown.energyCharges + breakdown.demandCharge) / total) * 100;
  const fixedPct = (breakdown.fixedCustomerCharge / total) * 100;
  const deliveryPct = (breakdown.transmissionDeliveryCharge / total) * 100;
  const surchargesPct = ((breakdown.fuelAdjustmentCharge + breakdown.environmentalRiderCharge) / total) * 100;
  const taxesPct = (breakdown.taxes / total) * 100;

  return (
    <div id="cost-breakdown-report-section" className="space-y-8 scroll-mt-20">
      {/* Top Section Header & PDF Download Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Audit Complete
            </span>
            <span className="text-xs text-slate-400">
              Ref: EBC-CALC-{Math.round(breakdown.grossConsumptionKwh)}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Detailed Utility Bill Cost Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Itemized statement of supply charges, grid transmission, regulatory riders, taxes, and monthly forecasts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="open-pdf-modal-btn"
            type="button"
            onClick={onOpenPdfModal}
            className="px-4 py-2.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-all shadow-sm flex items-center gap-2 active:scale-95 border border-slate-200"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Customize Statement</span>
          </button>

          <button
            id="quick-download-pdf-btn"
            type="button"
            onClick={onQuickDownloadPdf}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Visual Cost Allocation Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Where Does Your Electric Bill Go?</h3>
            <p className="text-xs text-slate-500">Proportional allocation of each dollar billed</p>
          </div>
          <div className="text-sm font-bold text-slate-900">
            Total Due: <span className="text-blue-600">{formatCurrency(breakdown.totalBill, input.currency)}</span>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${energyPct}%` }}
            title={`Energy Supply: ${energyPct.toFixed(1)}%`}
          />
          <div
            className="h-full bg-sky-500 transition-all duration-500"
            style={{ width: `${deliveryPct}%` }}
            title={`Delivery & T&D: ${deliveryPct.toFixed(1)}%`}
          />
          <div
            className="h-full bg-slate-500 transition-all duration-500"
            style={{ width: `${fixedPct}%` }}
            title={`Fixed Base Fee: ${fixedPct.toFixed(1)}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${surchargesPct}%` }}
            title={`Fuel & Riders: ${surchargesPct.toFixed(1)}%`}
          />
          <div
            className="h-full bg-rose-400 transition-all duration-500"
            style={{ width: `${taxesPct}%` }}
            title={`Taxes: ${taxesPct.toFixed(1)}%`}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <div>
              <div className="text-slate-500 text-[10px]">Supply Charges</div>
              <div className="font-bold text-slate-900">{formatCurrency(breakdown.energyCharges, input.currency)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
            <div>
              <div className="text-slate-500 text-[10px]">Grid Transmission</div>
              <div className="font-bold text-slate-900">
                {formatCurrency(breakdown.transmissionDeliveryCharge, input.currency)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
            <div>
              <div className="text-slate-500 text-[10px]">Customer Base Fee</div>
              <div className="font-bold text-slate-900">
                {formatCurrency(breakdown.fixedCustomerCharge, input.currency)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="text-slate-500 text-[10px]">Fuel & Riders</div>
              <div className="font-bold text-slate-900">
                {formatCurrency(breakdown.fuelAdjustmentCharge + breakdown.environmentalRiderCharge, input.currency)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0" />
            <div>
              <div className="text-slate-500 text-[10px]">Taxes ({tariff.taxPercent}%)</div>
              <div className="font-bold text-slate-900">{formatCurrency(breakdown.taxes, input.currency)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table Breakdown */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Itemized Cost Statement</h3>
              <p className="text-xs text-slate-500">Every single line item and regulatory calculation</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {tariff.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 sm:px-6">Description</th>
                <th className="py-3 px-4">Rate Basis</th>
                <th className="py-3 px-4 text-right">Usage</th>
                <th className="py-3 px-4 sm:px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Fixed Customer Charge */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                  Customer Meter Base Availability Charge
                  <span className="block text-[11px] font-normal text-slate-500">
                    Standard fixed connection & billing fee
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">Fixed Monthly Service</td>
                <td className="py-3.5 px-4 text-right font-medium">{input.billingDays || 30} Days</td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                  {formatCurrency(breakdown.fixedCustomerCharge, input.currency)}
                </td>
              </tr>

              {/* Tiered breakdowns */}
              {breakdown.tierBreakdowns &&
                breakdown.tierBreakdowns.map((tb, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      Energy Supply - {tb.tierName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatCurrency(tb.ratePerKwh, input.currency, true)} / Unit
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">{Math.round(tb.kwhInTier)} Units</td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                      {formatCurrency(tb.cost, input.currency)}
                    </td>
                  </tr>
                ))}

              {/* TOU breakdowns */}
              {breakdown.touCharges && (
                <>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      Energy Supply - On-Peak Hours (4 PM - 9 PM)
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatCurrency(tariff.peakRate || 0.42, input.currency)} / kWh
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {Math.round(breakdown.touCharges.peakKwh)} kWh
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                      {formatCurrency(breakdown.touCharges.peakCost, input.currency)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      Energy Supply - Mid-Peak Hours (9 AM - 4 PM)
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatCurrency(tariff.midPeakRate || 0.29, input.currency)} / kWh
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {Math.round(breakdown.touCharges.midPeakKwh)} kWh
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                      {formatCurrency(breakdown.touCharges.midPeakCost, input.currency)}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                      Energy Supply - Off-Peak Hours (Night / Morning)
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatCurrency(tariff.offPeakRate || 0.18, input.currency)} / kWh
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {Math.round(breakdown.touCharges.offPeakKwh)} kWh
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                      {formatCurrency(breakdown.touCharges.offPeakCost, input.currency)}
                    </td>
                  </tr>
                </>
              )}

              {/* Demand Charge if applicable */}
              {breakdown.demandCharge > 0 && (
                <tr className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    Sanctioned Load Demand Charge (অনুমোদিত লোড ডিমান্ড চার্জ)
                    <span className="block text-[11px] font-normal text-slate-500">
                      BERC fixed capacity charge on sanctioned load ({breakdown.sanctionLoadKw} kW)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {formatCurrency(breakdown.demandChargeRatePerKw || tariff.demandChargePerKw || 42, input.currency)} / kW / month
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium">{(breakdown.sanctionLoadKw || input.sanctionLoadKw || 2).toFixed(1)} kW</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                    {formatCurrency(breakdown.demandCharge, input.currency)}
                  </td>
                </tr>
              )}

              {/* Transmission & Delivery */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                  Transmission & Distribution (T&D Delivery Charge)
                  <span className="block text-[11px] font-normal text-slate-500">
                    Wires, poles, substations, and line loss compensation
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {formatCurrency(tariff.transmissionDeliveryPerKwh, input.currency)} / kWh
                </td>
                <td className="py-3.5 px-4 text-right font-medium">{Math.round(breakdown.netBilledKwh)} kWh</td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                  {formatCurrency(breakdown.transmissionDeliveryCharge, input.currency)}
                </td>
              </tr>

              {/* Fuel Cost Adjustment */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                  Fuel Cost Adjustment (FAC / PCA Rider)
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {formatCurrency(tariff.fuelAdjustmentPerKwh, input.currency)} / kWh
                </td>
                <td className="py-3.5 px-4 text-right font-medium">{Math.round(breakdown.netBilledKwh)} kWh</td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                  {formatCurrency(breakdown.fuelAdjustmentCharge, input.currency)}
                </td>
              </tr>

              {/* Environmental Rider */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                  Environmental & Renewable Mandate Rider
                </td>
                <td className="py-3.5 px-4 text-slate-600">{tariff.environmentalRiderPercent}% on supply</td>
                <td className="py-3.5 px-4 text-right font-medium">Surcharge</td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                  {formatCurrency(breakdown.environmentalRiderCharge, input.currency)}
                </td>
              </tr>

              {/* Solar Credit */}
              {breakdown.solarCredit > 0 && (
                <tr className="bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-800">
                    Solar Net Metering Export Credit (NEM)
                    <span className="block text-[11px] font-normal text-emerald-700">
                      Excess clean energy generated & fed back to grid
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-800">
                    {formatCurrency(input.solar.feedInTariffPerKwh, input.currency)} / kWh
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold">-{Math.round(breakdown.solarExportedKwh)} kWh</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-black text-emerald-800">
                    -{formatCurrency(breakdown.solarCredit, input.currency)}
                  </td>
                </tr>
              )}

              {/* Taxes */}
              <tr className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                  State & Municipal Utility Excise Taxes
                </td>
                <td className="py-3.5 px-4 text-slate-600">{tariff.taxPercent}% statutory tax</td>
                <td className="py-3.5 px-4 text-right font-medium">Tax</td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                  {formatCurrency(breakdown.taxes, input.currency)}
                </td>
              </tr>
            </tbody>

            {/* Total Footer */}
            <tfoot className="bg-slate-50 border-t-2 border-blue-600 font-bold text-slate-900 text-sm">
              <tr>
                <td className="py-4 px-4 sm:px-6 text-slate-900 font-extrabold" colSpan={2}>
                  TOTAL ESTIMATED BILL AMOUNT
                </td>
                <td className="py-4 px-4 text-right text-slate-900">
                  {Math.round(breakdown.netBilledKwh)} kWh
                </td>
                <td className="py-4 px-4 sm:px-6 text-right text-blue-600 font-black text-base sm:text-lg">
                  {formatCurrency(breakdown.totalBill, input.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 12-Month Seasonal Forecast Bar Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">12-Month Seasonal Bill Forecast</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Projected annual cost curve factoring summer air conditioning peaks and winter heating loads.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Annual Estimated Spend:</span>
            <div className="text-base font-black text-slate-900">
              {formatCurrency(breakdown.annualProjectedCost, input.currency)}
            </div>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-48 pt-6 pb-2 border-b border-slate-200">
          {seasonalMultipliers.map((item, i) => {
            const cost = breakdown.totalBill * item.mult;
            const heightPct = Math.max(12, (cost / maxMonthCost) * 100);
            const isPeakSummer = item.season.includes('Summer');
            const isWinter = item.season.includes('Winter');

            return (
              <div key={i} className="flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                  <div className="font-bold">{item.month}: {formatCurrency(cost, input.currency)}</div>
                  <div className="text-slate-400">{item.season}</div>
                </div>

                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isPeakSummer
                      ? 'bg-rose-500 group-hover:bg-rose-600'
                      : isWinter
                      ? 'bg-blue-600 group-hover:bg-blue-700'
                      : 'bg-slate-400 group-hover:bg-slate-500'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] font-bold text-slate-600 mt-2">{item.month}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Summer Peak
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Winter Heating
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              Mild Shoulder Months
            </span>
          </div>
          <span>Based on regional thermal degree-day weather models</span>
        </div>
      </div>
    </div>
  );
}
