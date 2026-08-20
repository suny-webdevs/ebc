'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingDown, CheckCircle2, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, SavingRecommendation } from '../lib/types';
import { formatCurrency } from '../lib/calculator';

interface EnergySavingsRecommendationsProps {
  recommendations: SavingRecommendation[];
  currency: Currency;
  onApplyRecommendation: (recId: string) => void;
}

export function EnergySavingsRecommendations({
  recommendations,
  currency,
  onApplyRecommendation,
}: EnergySavingsRecommendationsProps) {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const handleApply = (id: string) => {
    const next = new Set(appliedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    setAppliedIds(next);
    onApplyRecommendation(id);
  };

  const totalPossibleSavings = recommendations.reduce((sum, r) => sum + r.estimatedMonthlySavings, 0);
  const totalAppliedSavings = recommendations
    .filter((r) => appliedIds.has(r.id))
    .reduce((sum, r) => sum + r.estimatedMonthlySavings, 0);

  return (
    <div className="p-6 sm:p-7 rounded-xl bg-slate-900 text-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Smart Energy Optimization
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Actionable Ways to Lower Your Electric Bill
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Apply simulated energy-efficiency strategies below to see immediate reductions in monthly spend.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shrink-0">
          <div>
            <div className="text-[11px] text-slate-400">Total Potential Savings</div>
            <div className="text-2xl font-extrabold text-blue-400">
              {formatCurrency(totalPossibleSavings, currency)}
              <span className="text-xs text-slate-400 font-normal"> / mo</span>
            </div>
          </div>
          {totalAppliedSavings > 0 && (
            <>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <div className="text-[11px] text-emerald-400 font-semibold">Active Reduction</div>
                <div className="text-2xl font-extrabold text-emerald-400">
                  -{formatCurrency(totalAppliedSavings, currency)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const isApplied = appliedIds.has(rec.id);

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isApplied
                  ? 'bg-slate-800 border-blue-500 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                    {rec.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.impactLevel === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : rec.impactLevel === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {rec.impactLevel.toUpperCase()} IMPACT
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug">{rec.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rec.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-700/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Monthly Reduction</span>
                  <div className="text-base font-extrabold text-blue-400">
                    ~{formatCurrency(rec.estimatedMonthlySavings, currency)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(rec.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isApplied
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <span>Simulate Savings</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
