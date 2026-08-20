'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sliders,
  Tv,
  Gauge,
  Sun,
  Clock,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Calculator,
} from 'lucide-react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { HeroEstimationCard } from './HeroEstimationCard';
import { ApplianceLoadCalculator } from './ApplianceLoadCalculator';
import { MeterReadingInput } from './MeterReadingInput';
import { SolarStorageSimulator } from './SolarStorageSimulator';
import { TimeOfUseSimulator } from './TimeOfUseSimulator';
import { CostBreakdownReport } from './CostBreakdownReport';
import { EnergySavingsRecommendations } from './EnergySavingsRecommendations';
import { PdfReportModal } from './PdfReportModal';
import {
  ApplianceItem,
  CalculationInput,
  Currency,
  SolarConfig,
  TOUDistribution,
} from '../lib/types';
import { CURRENCIES, DEFAULT_TARIFFS, INITIAL_APPLIANCES, PRESET_PROFILES } from '../lib/tariffs';
import { calculateElectricityBill, generateEnergySavingRecommendations } from '../lib/calculator';
import { downloadElectricBillPdf } from '../lib/pdf-generator';

export function MainCalculator() {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [selectedTariffId, setSelectedTariffId] = useState<string>('bd_residential_postpaid');
  const [sanctionLoadKw, setSanctionLoadKw] = useState<number>(2);
  const [mode, setMode] = useState<CalculationInput['mode']>('simple_slider');
  const [monthlyKwh, setMonthlyKwh] = useState<number>(320);
  const [billingDays, setBillingDays] = useState<number>(30);
  const [meterPrevious, setMeterPrevious] = useState<number>(14500);
  const [meterCurrent, setMeterCurrent] = useState<number>(14820);
  const [meterMultiplier, setMeterMultiplier] = useState<number>(1);
  const [meterUnits, setMeterUnits] = useState<number>(320);
  const [peakDemandKw, setPeakDemandKw] = useState<number>(2);

  const [appliances, setAppliances] = useState<ApplianceItem[]>(INITIAL_APPLIANCES);
  const [solar, setSolar] = useState<SolarConfig>({
    hasSolar: false,
    systemCapacityKw: 3.5,
    dailySunHours: 4.8,
    feedInTariffPerKwh: 6.50,
    selfConsumptionPercent: 70,
    batteryCapacityKwh: 0,
  });

  const [tou, setTou] = useState<TOUDistribution>({
    peakPercent: 25,
    midPeakPercent: 35,
    offPeakPercent: 40,
  });

  const [customerInfo, setCustomerInfo] = useState({
    customerName: 'Residential Consumer (গ্রাহক)',
    accountNumber: 'DESCO-LT-409281',
    address: 'Dhanmondi, Dhaka - 1205, Bangladesh',
  });

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [hasSubmittedAudit, setHasSubmittedAudit] = useState(false);

  const calculatorSectionRef = useRef<HTMLDivElement>(null);
  const reportSectionRef = useRef<HTMLDivElement>(null);

  // When tariff changes, set the category's default sanction load
  const handleTariffChange = (tariffId: string) => {
    setSelectedTariffId(tariffId);
    const newTariff = DEFAULT_TARIFFS.find((t) => t.id === tariffId);
    if (newTariff && newTariff.defaultSanctionLoadKw !== undefined) {
      setSanctionLoadKw(newTariff.defaultSanctionLoadKw);
      setPeakDemandKw(newTariff.defaultSanctionLoadKw);
    }
  };

  // Assemble full calculation input
  const input: CalculationInput = useMemo(() => {
    return {
      billingDays,
      selectedTariffId,
      monthlyKwh,
      mode,
      meterPrevious,
      meterCurrent,
      meterMultiplier,
      meterUnits,
      appliances,
      solar,
      tou,
      peakDemandKw: sanctionLoadKw,
      sanctionLoadKw,
      currency,
      customerName: customerInfo.customerName,
      accountNumber: customerInfo.accountNumber,
      address: customerInfo.address,
    };
  }, [
    billingDays,
    selectedTariffId,
    monthlyKwh,
    mode,
    meterPrevious,
    meterCurrent,
    meterMultiplier,
    meterUnits,
    appliances,
    solar,
    tou,
    sanctionLoadKw,
    currency,
    customerInfo,
  ]);

  // Real-time reactive calculation
  const breakdown = useMemo(() => {
    return calculateElectricityBill(input);
  }, [input]);

  // Smart Recommendations
  const recommendations = useMemo(() => {
    return generateEnergySavingRecommendations(input, breakdown);
  }, [input, breakdown]);

  // Handlers
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_PROFILES.find((p) => p.id === presetId);
    if (!preset) return;
    setMonthlyKwh(preset.kwh);
    setMeterUnits(preset.kwh);
    setMeterCurrent(meterPrevious + preset.kwh);
    setSelectedTariffId(preset.tariffId);
    const targetTariff = DEFAULT_TARIFFS.find((t) => t.id === preset.tariffId);
    if (targetTariff && targetTariff.defaultSanctionLoadKw !== undefined) {
      setSanctionLoadKw(targetTariff.defaultSanctionLoadKw);
      setPeakDemandKw(targetTariff.defaultSanctionLoadKw);
    }
    if (preset.solarCapacity > 0) {
      setSolar((prev) => ({
        ...prev,
        hasSolar: true,
        systemCapacityKw: preset.solarCapacity,
      }));
    } else {
      setSolar((prev) => ({
        ...prev,
        hasSolar: false,
      }));
    }
  };

  const handleReset = () => {
    setCurrency(CURRENCIES[0]);
    setSelectedTariffId('bd_residential_postpaid');
    setSanctionLoadKw(2);
    setPeakDemandKw(2);
    setMode('simple_slider');
    setMonthlyKwh(320);
    setBillingDays(30);
    setMeterPrevious(14500);
    setMeterCurrent(14820);
    setMeterMultiplier(1);
    setMeterUnits(320);
    setAppliances(INITIAL_APPLIANCES);
    setSolar({
      hasSolar: false,
      systemCapacityKw: 3.5,
      dailySunHours: 4.8,
      feedInTariffPerKwh: 6.50,
      selfConsumptionPercent: 70,
      batteryCapacityKwh: 0,
    });
    setTou({
      peakPercent: 25,
      midPeakPercent: 35,
      offPeakPercent: 40,
    });
  };

  const handleUpdateAppliance = (id: string, updates: Partial<ApplianceItem>) => {
    setAppliances((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const handleAddAppliance = (newApp: ApplianceItem) => {
    setAppliances((prev) => [newApp, ...prev]);
  };

  const handleRemoveAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleApplyRecommendation = (recId: string) => {
    if (recId === 'rec_thermostat') {
      setMonthlyKwh((prev) => Math.max(50, Math.round(prev * 0.92)));
    } else if (recId === 'rec_tou_shift') {
      setTou({
        peakPercent: 12,
        midPeakPercent: 28,
        offPeakPercent: 60,
      });
    } else if (recId === 'rec_led_upgrade') {
      setMonthlyKwh((prev) => Math.max(50, prev - 65));
    } else if (recId === 'rec_water_heater') {
      setMonthlyKwh((prev) => Math.max(50, prev - 85));
    } else if (recId === 'rec_solar_pv') {
      setSolar({
        hasSolar: true,
        systemCapacityKw: 6.0,
        dailySunHours: 4.8,
        feedInTariffPerKwh: 0.085,
        selfConsumptionPercent: 70,
        batteryCapacityKwh: 0,
      });
    } else if (recId === 'rec_phantom_load') {
      setMonthlyKwh((prev) => Math.max(50, prev - 35));
    }
  };

  const handleSubmitAudit = () => {
    setHasSubmittedAudit(true);
    setTimeout(() => {
      reportSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrollToCalculator = () => {
    calculatorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickDownloadPdf = () => {
    downloadElectricBillPdf({
      input,
      breakdown,
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Sticky Navigation */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        selectedTariffId={selectedTariffId}
        onTariffChange={setSelectedTariffId}
        onLoadPreset={handleLoadPreset}
        onReset={handleReset}
      />

      <main className="flex-1">
        {/* ReactBits Prism Animated Hero Section */}
        <HeroSection
          selectedTariffId={selectedTariffId}
          onTariffChange={handleTariffChange}
          onScrollToCalculator={handleScrollToCalculator}
          onScrollToReport={() => {
            reportSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Separated Dedicated Bill Calculator Section */}
        <section
          ref={calculatorSectionRef}
          id="calculator-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10"
        >
          {/* Calculator Section Title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/70">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                <span>Interactive Estimation Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Electricity Bill Calculator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Adjust your monthly consumption units, select utility tariff categories, and view live slab calculations with demand charges and VAT.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Calculation Active</span>
            </div>
          </div>

          {/* Primary Quick Bill Estimation & Live Summary Card */}
          <HeroEstimationCard
            input={input}
            breakdown={breakdown}
            onKwhChange={(val) => {
              setMonthlyKwh(val);
              if (mode !== 'simple_slider') setMode('simple_slider');
            }}
            onSanctionLoadChange={setSanctionLoadKw}
            onBillingDaysChange={setBillingDays}
            onTariffChange={handleTariffChange}
            onSubmitAudit={handleSubmitAudit}
            onScrollToCalculator={handleScrollToCalculator}
          />

          {/* Interactive Calculation Suite Container */}
          <div className="space-y-6 pt-4">
            {/* Section Sub-Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Precision Calculation Suite
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Customize Your Power Consumption Model
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
                  Switch between direct slider estimation, individual appliance audits, physical meter reading deltas, and solar net metering simulations.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl gap-1 self-start md:self-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMode('simple_slider')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    mode === 'simple_slider'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Slider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('appliance_load')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    mode === 'appliance_load'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5 text-blue-600" />
                  <span>Appliances ({appliances.filter((a) => a.enabled).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('meter_reading')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    mode === 'meter_reading'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  <span>Meter Read</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('solar_tou')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    mode === 'solar_tou'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Solar & TOU</span>
                </button>
              </div>
            </div>

          {/* Quick Category & Sanction Load Configuration Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Consumer Category & Sanctioned Load</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    BERC Official
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Demand charge is applied on sanctioned load: <strong className="text-slate-700">৳{breakdown.demandChargeRatePerKw}/kW/month</strong> (Current Demand: <strong className="text-slate-900">৳{Math.round(breakdown.demandCharge)}</strong>)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Tariff Category Selector */}
              <div className="flex flex-col gap-1 flex-1 sm:flex-initial">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Tariff Plan</label>
                <select
                  aria-label="Tariff Plan Selector"
                  value={selectedTariffId}
                  onChange={(e) => handleTariffChange(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  {DEFAULT_TARIFFS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Default: {t.defaultSanctionLoadKw || 2} kW)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sanction Load Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Sanction Load (kW)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    aria-label="Sanction Load in kW"
                    min={0.5}
                    max={500}
                    step={0.5}
                    value={sanctionLoadKw}
                    onChange={(e) => setSanctionLoadKw(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                    className="w-20 px-2.5 py-1.5 text-right font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-xs font-bold text-slate-600">kW</span>
                </div>
              </div>

              {/* Reset to Default Button if modified */}
              {(() => {
                const curTariff = DEFAULT_TARIFFS.find((t) => t.id === selectedTariffId);
                const isCustom = curTariff && curTariff.defaultSanctionLoadKw !== undefined && sanctionLoadKw !== curTariff.defaultSanctionLoadKw;
                if (!isCustom) return null;
                return (
                  <div className="flex flex-col gap-1 self-end">
                    <span className="text-[11px] invisible">Reset</span>
                    <button
                      type="button"
                      onClick={() => curTariff.defaultSanctionLoadKw && setSanctionLoadKw(curTariff.defaultSanctionLoadKw)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                      title="Reset load to category default"
                    >
                      Default ({curTariff.defaultSanctionLoadKw} kW)
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Active Tab View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {mode === 'appliance_load' && (
              <ApplianceLoadCalculator
                appliances={appliances}
                currency={currency}
                effectiveRatePerKwh={breakdown.effectiveRatePerKwh}
                onUpdateAppliance={handleUpdateAppliance}
                onAddAppliance={handleAddAppliance}
                onRemoveAppliance={handleRemoveAppliance}
                onResetToDefault={() => setAppliances(INITIAL_APPLIANCES)}
              />
            )}

            {mode === 'meter_reading' && (
              <MeterReadingInput
                input={input}
                currency={currency}
                effectiveRatePerKwh={breakdown.effectiveRatePerKwh}
                onUpdateMeter={({ meterPrevious: mp, meterCurrent: mc, meterMultiplier: mm, meterUnits: mu, billingDays: bd }) => {
                  if (mp !== undefined) setMeterPrevious(mp);
                  if (mc !== undefined) setMeterCurrent(mc);
                  if (mm !== undefined) setMeterMultiplier(mm);
                  if (mu !== undefined) {
                    setMeterUnits(mu);
                    setMonthlyKwh(mu);
                  }
                  if (bd !== undefined) setBillingDays(bd);
                }}
              />
            )}

            {mode === 'solar_tou' && (
              <div className="space-y-10">
                <SolarStorageSimulator
                  solar={solar}
                  currency={currency}
                  grossKwh={breakdown.grossConsumptionKwh}
                  onUpdateSolar={(updates) => setSolar((prev) => ({ ...prev, ...updates }))}
                />
                <hr className="border-slate-200" />
                <TimeOfUseSimulator
                  tou={tou}
                  currency={currency}
                  netKwh={breakdown.netBilledKwh}
                  peakRate={input.customTariff?.peakRate || DEFAULT_TARIFFS.find((t) => t.id === selectedTariffId)?.peakRate}
                  midPeakRate={input.customTariff?.midPeakRate || DEFAULT_TARIFFS.find((t) => t.id === selectedTariffId)?.midPeakRate}
                  offPeakRate={input.customTariff?.offPeakRate || DEFAULT_TARIFFS.find((t) => t.id === selectedTariffId)?.offPeakRate}
                  onUpdateTOU={(updates) => setTou((prev) => ({ ...prev, ...updates }))}
                />
              </div>
            )}

            {mode === 'simple_slider' && (
              <div className="space-y-6">
                <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Quick Slider Mode
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Direct Consumption Adjustment</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Directly fine-tune your monthly billable units and billing cycle duration.
                    </p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <div className="text-[11px] text-slate-400">Current Rate Basis</div>
                    <div className="text-sm font-bold text-blue-400">
                      {DEFAULT_TARIFFS.find((t) => t.id === selectedTariffId)?.name}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Monthly Electricity Usage: <strong className="text-blue-700">{monthlyKwh} kWh</strong>
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={4000}
                      step={25}
                      value={monthlyKwh}
                      onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                      <span>50 kWh</span>
                      <span>1,000 kWh</span>
                      <span>2,000 kWh</span>
                      <span>4,000 kWh</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Billing Period Duration: <strong className="text-blue-700">{billingDays} Days</strong>
                    </label>
                    <input
                      type="range"
                      min={15}
                      max={60}
                      step={1}
                      value={billingDays}
                      onChange={(e) => setBillingDays(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                      <span>15 Days</span>
                      <span>30 Days (Standard)</span>
                      <span>45 Days</span>
                      <span>60 Days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Detailed Breakdown & PDF Section */}
          <div ref={reportSectionRef}>
            <CostBreakdownReport
              input={input}
              breakdown={breakdown}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onQuickDownloadPdf={handleQuickDownloadPdf}
            />
          </div>

          {/* Energy Savings Recommendations Section */}
          <EnergySavingsRecommendations
            recommendations={recommendations}
            currency={currency}
            onApplyRecommendation={handleApplyRecommendation}
          />
        </section>
      </main>

      {/* PDF Modal */}
      <PdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        input={input}
        breakdown={breakdown}
        onUpdateCustomerInfo={(info) => {
          setCustomerInfo((prev) => ({
            ...prev,
            customerName: info.customerName || prev.customerName,
            accountNumber: info.accountNumber || prev.accountNumber,
            address: info.address || prev.address,
          }));
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">EBC - Electric Bill Calculator</span>
            <span>• High-Performance Reactive Energy Modeling Engine</span>
          </div>
          <div>
            Built with Next.js, Tailwind CSS, Framer Motion, and GSAP.
          </div>
        </div>
      </footer>
    </div>
  );
}
