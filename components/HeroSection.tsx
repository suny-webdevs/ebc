'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  ArrowDown,
  Calculator,
  FileSpreadsheet,
} from 'lucide-react';
import Prism from './Prism';
import { TariffPlan } from '../lib/types';
import { DEFAULT_TARIFFS } from '../lib/tariffs';

interface HeroSectionProps {
  onScrollToCalculator: () => void;
  onScrollToReport?: () => void;
  selectedTariffId: string;
  onTariffChange: (tariffId: string) => void;
}

export function HeroSection({
  onScrollToCalculator,
  onScrollToReport,
  selectedTariffId,
  onTariffChange,
}: HeroSectionProps) {
  const currentTariff =
    DEFAULT_TARIFFS.find((t) => t.id === selectedTariffId) || DEFAULT_TARIFFS[0];

  return (
    <section className="relative overflow-hidden bg-white text-slate-900 min-h-[480px] lg:min-h-[540px] flex items-center justify-center border-b border-slate-200/80">
      {/* Official ReactBits Prism TS-TW Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <Prism
          animationType="3drotate"
          timeScale={0.35}
          scale={3.6}
          height={3.4}
          baseWidth={5.2}
          glow={1.1}
          noise={0.25}
          bloom={1.0}
          colorFrequency={1.0}
          transparent={true}
          suspendWhenOffscreen={true}
        />
      </div>

      {/* Subtle Ambient Radial Light Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(241,245,249,0.6)_0%,rgba(255,255,255,0.95)_75%)] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 text-center">
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-blue-900 text-xs sm:text-sm font-medium backdrop-blur-md mb-6 shadow-2xs"
        >
          <Zap className="w-4 h-4 text-blue-600 fill-blue-600 animate-pulse" />
          <span className="font-bold text-slate-900">BERC 2026</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-700">Official Bangladesh Electric Bill Engine</span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-blue-600 text-white rounded font-bold">
            Verified
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.14]"
        >
          Calculate & Optimize Your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
            Electric Bill with Precision
          </span>
        </motion.h1>

        {/* Subtitle / Value proposition */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' }}
          className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Complete multi-slab calculations with BERC Life-Line subsidization (≤50 units @ ৳4.63),
          Steps 1–6 tariffs, sanctioned load capacity charges, and appliance audits.
        </motion.p>

        {/* Live Slab Rates Ticker / Chips */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto"
        >
          <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-emerald-200 backdrop-blur-md text-xs flex items-center gap-1.5 text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-900">Life-line:</span>
            <span>≤50 Units @ ৳4.63</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 backdrop-blur-md text-xs flex items-center gap-1.5 text-slate-700 shadow-2xs">
            <span className="font-bold text-slate-900">Step 1:</span>
            <span>0–75 Units @ ৳5.26</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 backdrop-blur-md text-xs flex items-center gap-1.5 text-slate-700 shadow-2xs">
            <span className="font-bold text-slate-900">Step 2:</span>
            <span>76–200 Units @ ৳8.50</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 backdrop-blur-md text-xs flex items-center gap-1.5 text-slate-700 shadow-2xs">
            <span className="font-bold text-slate-900">Step 3:</span>
            <span>201–300 Units @ ৳9.10</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 backdrop-blur-md text-xs flex items-center gap-1.5 text-slate-700 shadow-2xs">
            <span className="font-bold text-slate-900">Step 4:</span>
            <span>301–400 Units @ ৳9.62</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 backdrop-blur-md text-xs flex items-center gap-1.5 text-slate-700 shadow-2xs">
            <span className="font-bold text-slate-900">Step 5 & 6:</span>
            <span>৳15.01 & ৳17.35</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          {/* Gradient Button with Dark Text */}
          <button
            id="hero-start-calc-btn"
            type="button"
            onClick={onScrollToCalculator}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 hover:from-amber-200 hover:via-emerald-200 hover:to-cyan-200 text-slate-950 font-bold text-sm sm:text-base transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-400/40"
          >
            <Calculator className="w-5 h-5 text-slate-950" />
            <span className="text-slate-950">Open Bill Calculator</span>
            <ArrowDown className="w-4 h-4 text-slate-950 animate-bounce" />
          </button>

          {onScrollToReport && (
            <button
              id="hero-view-report-btn"
              type="button"
              onClick={onScrollToReport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm hover:text-slate-900 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>View Tariff Statement</span>
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

