"use client";

import { useGrantly } from "@/lib/grantly-store";
import { type ScholarshipCategory } from "@/data/scholarships";
import { Search, SlidersHorizontal } from "lucide-react";

interface FilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  minMatchScore: number;
  setMinMatchScore: (score: number) => void;
}

const CATEGORIES: ("All" | ScholarshipCategory)[] = [
  "All",
  "STEM & Tech",
  "Women in Leadership",
  "Financial Need",
  "Merit & Academic",
  "Creative Arts & Design",
  "Global & International",
];

export function MatchingFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  minMatchScore,
  setMinMatchScore,
}: FilterProps) {
  const { profile, updateProfile } = useGrantly();

  return (
    <div className="space-y-4 mb-8">
      {/* Student Persona Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-black text-sm">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{profile.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-medium">
                Active Student
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {profile.major} • GPA: <strong className="text-emerald-400">{profile.gpa}</strong> •{" "}
              {profile.educationLevel.replace("-", " ")}
            </p>
          </div>
        </div>

        {/* Quick Profile Controls */}
        <div className="flex items-center gap-3 text-xs">
          <label className="text-slate-400 font-medium">Simulate Your GPA:</label>
          <select
            value={profile.gpa}
            onChange={(e) => updateProfile({ gpa: parseFloat(e.target.value) })}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="4.0">4.0 (Top Honors)</option>
            <option value="3.8">3.8 (High Honors)</option>
            <option value="3.5">3.5 (Dean&apos;s List)</option>
            <option value="3.2">3.2 (Above Average)</option>
            <option value="2.9">2.9 (Passing Tier)</option>
          </select>
        </div>
      </div>

      {/* Search Input & Score Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keyword, major, foundation, or field (e.g. STEM, design, first-gen)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2 p-2 px-4 rounded-2xl bg-slate-900 border border-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 whitespace-nowrap">Min Match:</span>
          <input
            type="range"
            min={40}
            max={90}
            step={5}
            value={minMatchScore}
            onChange={(e) => setMinMatchScore(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-emerald-400 w-8 text-right">
            {minMatchScore}%
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
