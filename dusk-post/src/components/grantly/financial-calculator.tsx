"use client";

import { useGrantly } from "@/lib/grantly-store";
import { TrendingUp } from "lucide-react";

export function FinancialCalculator() {
  const { profile, updateProfile, financialMetrics, scholarships } = useGrantly();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Find candidate scholarships that can close the remaining gap
  const gapClosingScholarships = scholarships
    .filter((s) => s.amount <= financialMetrics.unfundedGap + 5000)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-md shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Real-Time Aid Analysis
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
            Tuition Gap & Funding Coverage
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Calculate your true educational cost and see exactly how awarded grants reduce out-of-pocket expenses.
          </p>
        </div>
      </div>

      {/* 4 Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Target Annual Tuition</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-white">
              {formatCurrency(financialMetrics.targetTuition)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Full educational cost</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Savings & Family Aid</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-sky-400">
              {formatCurrency(financialMetrics.currentSavings)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Available capital</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Awarded Scholarships</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl md:text-2xl font-black text-emerald-400">
              {formatCurrency(financialMetrics.awardedAmount)}
            </span>
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Confirmed grants</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Unfunded Tuition Gap</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-xl md:text-2xl font-black ${
                financialMetrics.unfundedGap > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {formatCurrency(financialMetrics.unfundedGap)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Remaining to secure</span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-sm font-semibold mb-2">
          <span className="text-slate-300">Total Funding Progress</span>
          <span className="text-emerald-400 font-bold">{financialMetrics.coveragePercent}% Covered</span>
        </div>
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${financialMetrics.coveragePercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$0</span>
          <span>{formatCurrency(financialMetrics.targetTuition / 2)} (50%)</span>
          <span>{formatCurrency(financialMetrics.targetTuition)} Goal</span>
        </div>
      </div>

      {/* Interactive Sliders to Simulate Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Adjust Target Tuition ({formatCurrency(profile.targetTuition)})
          </label>
          <input
            type="range"
            min={10000}
            max={70000}
            step={1000}
            value={profile.targetTuition}
            onChange={(e) => updateProfile({ targetTuition: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>$10,000 (In-state)</span>
            <span>$70,000 (Private)</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Adjust Current Savings / Contribution ({formatCurrency(profile.currentSavings)})
          </label>
          <input
            type="range"
            min={0}
            max={40000}
            step={500}
            value={profile.currentSavings}
            onChange={(e) => updateProfile({ currentSavings: Number(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>$0</span>
            <span>$40,000</span>
          </div>
        </div>
      </div>

      {/* Recommended Grants to Close Gap */}
      {financialMetrics.unfundedGap > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Recommended Grants to Erase Your Remaining Deficit
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {gapClosingScholarships.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{s.title}</h5>
                  <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block">
                    {s.amountFormatted}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-2">
                  Deadline: <strong className="text-slate-300">{s.deadline}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
