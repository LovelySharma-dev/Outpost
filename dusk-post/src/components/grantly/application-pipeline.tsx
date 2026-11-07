"use client";

import { useGrantly } from "@/lib/grantly-store";
import { type ApplicationStage } from "@/data/scholarships";
import {
  CheckSquare,
  Square,
  Trash2,
  Calendar,
  AlertCircle,
} from "lucide-react";

const STAGES: { id: ApplicationStage; label: string; icon: string; color: string }[] = [
  { id: "saved", label: "Saved", icon: "📌", color: "border-slate-700 bg-slate-900/50" },
  { id: "drafting", label: "Drafting", icon: "✍️", color: "border-amber-500/30 bg-amber-950/20" },
  { id: "documents-ready", label: "Docs Ready", icon: "📁", color: "border-sky-500/30 bg-sky-950/20" },
  { id: "submitted", label: "Submitted", icon: "🚀", color: "border-indigo-500/30 bg-indigo-950/20" },
  { id: "awarded", label: "Awarded", icon: "🏆", color: "border-emerald-500/30 bg-emerald-950/20" },
];

export function ApplicationPipeline() {
  const {
    applications,
    getScholarshipById,
    updateApplicationStage,
    toggleChecklistItem,
    updateNotes,
    removeApplication,
  } = useGrantly();

  const appList = Object.values(applications);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Application Command Center</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {appList.length} Active
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track milestones, manage required documents, and advance your applications through each review phase.
          </p>
        </div>
      </div>

      {appList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Tracked Scholarships Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Browse matching opportunities above and click &ldquo;Track Application&rdquo; to organize your deadlines and documents here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map((col) => {
            const items = appList.filter((a) => a.stage === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-2xl border ${col.color} p-4 flex flex-col min-h-[420px] transition-all`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{col.icon}</span>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {items.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1">
                  {items.map((item) => {
                    const scholarship = getScholarshipById(item.scholarshipId);
                    if (!scholarship) return null;

                    const totalChecks = 4;
                    const completedChecks = Object.values(item.checklist).filter(Boolean).length;
                    const progressPercent = Math.round((completedChecks / totalChecks) * 100);

                    return (
                      <div
                        key={item.scholarshipId}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm space-y-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-100 leading-snug">
                            {scholarship.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeApplication(item.scholarshipId)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-emerald-400">
                            {scholarship.amountFormatted}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {scholarship.deadline}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Readiness</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-1 pt-1 text-xs">
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(item.scholarshipId, "essayCompleted")}
                            className="w-full flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-0.5"
                          >
                            {item.checklist.essayCompleted ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className={item.checklist.essayCompleted ? "line-through text-slate-500" : ""}>
                              Draft Essay ({scholarship.requirements.wordCount || 500}w)
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(item.scholarshipId, "transcriptsUploaded")}
                            className="w-full flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-0.5"
                          >
                            {item.checklist.transcriptsUploaded ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className={item.checklist.transcriptsUploaded ? "line-through text-slate-500" : ""}>
                              Official Transcript
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(item.scholarshipId, "lettersRequested")}
                            className="w-full flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-0.5"
                          >
                            {item.checklist.lettersRequested ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span className={item.checklist.lettersRequested ? "line-through text-slate-500" : ""}>
                              Letters ({scholarship.requirements.recommendationLetters})
                            </span>
                          </button>
                        </div>

                        {/* Notes Input */}
                        <textarea
                          placeholder="Application notes / advisor feedback…"
                          value={item.notes}
                          onChange={(e) => updateNotes(item.scholarshipId, e.target.value)}
                          rows={2}
                          className="w-full text-xs p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                        />

                        {/* Stage Mover Buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                          {col.id !== "saved" && (
                            <button
                              type="button"
                              onClick={() => {
                                const prevIndex = STAGES.findIndex((s) => s.id === col.id) - 1;
                                if (prevIndex >= 0) {
                                  updateApplicationStage(item.scholarshipId, STAGES[prevIndex].id);
                                }
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/60 cursor-pointer"
                            >
                              ← Back
                            </button>
                          )}
                          {col.id !== "awarded" && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextIndex = STAGES.findIndex((s) => s.id === col.id) + 1;
                                if (nextIndex < STAGES.length) {
                                  updateApplicationStage(item.scholarshipId, STAGES[nextIndex].id);
                                }
                              }}
                              className="text-[11px] font-semibold text-indigo-300 hover:text-white px-2.5 py-1 rounded bg-indigo-600/30 border border-indigo-500/30 ml-auto cursor-pointer"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
