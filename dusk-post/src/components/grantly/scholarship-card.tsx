"use client";

import { useState } from "react";
import { type Scholarship } from "@/data/scholarships";
import { useGrantly } from "@/lib/grantly-store";
import { evaluateScholarshipMatch } from "@/lib/matching";
import { generateGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar-export";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Bookmark,
} from "lucide-react";

export function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const { profile, applications, trackScholarship, updateApplicationStage, removeApplication } =
    useGrantly();
  const [expanded, setExpanded] = useState(false);

  const match = evaluateScholarshipMatch(scholarship, profile);
  const tracked = applications[scholarship.id];

  const getUrgencyBadge = () => {
    if (scholarship.daysRemaining <= 14) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          {scholarship.daysRemaining} days left
        </span>
      );
    }
    if (scholarship.daysRemaining <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          {scholarship.daysRemaining} days left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Clock className="w-3.5 h-3.5" />
        {scholarship.daysRemaining} days left
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 70) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-slate-400 border-slate-700 bg-slate-800/40";
  };

  return (
    <div
      className={`relative rounded-2xl border bg-slate-900/80 backdrop-blur-sm p-6 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 ${
        tracked ? "border-indigo-500/50" : "border-slate-800"
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {scholarship.category}
          </span>
          {scholarship.renewable && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Renewable
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getUrgencyBadge()}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(
              match.score
            )}`}
            title={match.reasons.join(" | ")}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {match.score}% Match
          </div>
        </div>
      </div>

      {/* Title & Organization */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-100 tracking-tight leading-snug">
          {scholarship.title}
        </h3>
        <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-1.5">
          <span>{scholarship.provider}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{scholarship.selectionRatio}</span>
        </p>
      </div>

      {/* Amount Callout */}
      <div className="flex items-baseline gap-2 py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5">
        <DollarSign className="w-5 h-5 text-emerald-400 self-center" />
        <span className="text-2xl font-black tracking-tight text-emerald-400">
          {scholarship.amountFormatted}
        </span>
        <span className="text-xs text-slate-400 ml-auto self-center">
          Min GPA: <strong className="text-slate-200">{scholarship.minGpa}</strong>
        </span>
      </div>

      {/* Description Snippet */}
      <p className="text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
        {scholarship.description}
      </p>

      {/* Quick Checklist Icons */}
      <div className="flex items-center gap-4 text-xs text-slate-400 pb-4 mb-4 border-b border-slate-800">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          {scholarship.requirements.essay
            ? `Essay (${scholarship.requirements.wordCount}w)`
            : "No Essay"}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          {scholarship.requirements.recommendationLetters > 0
            ? `${scholarship.requirements.recommendationLetters} Letters`
            : "No Letters"}
        </span>
        {scholarship.requirements.portfolio && (
          <span className="text-indigo-400">Portfolio Req.</span>
        )}
      </div>

      {/* Expandable Match Breakdown */}
      {expanded && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-3 mb-4 animate-in fade-in duration-200">
          <div>
            <h4 className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Why You Match ({profile.name})
            </h4>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              {match.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          {match.blockers.length > 0 && (
            <div>
              <h4 className="font-semibold text-rose-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Potential Hurdles
              </h4>
              <ul className="space-y-1 text-rose-300 list-disc list-inside">
                {match.blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {scholarship.requirements.essayPrompt && (
            <div className="pt-2 border-t border-slate-800">
              <span className="font-medium text-slate-400">Essay Prompt:</span>
              <p className="italic text-slate-300 mt-0.5">
                &ldquo;{scholarship.requirements.essayPrompt}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Footbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
        >
          {expanded ? "Hide Match Details" : "Inspect Match Details"}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className="flex items-center gap-2">
          {/* Calendar Dropdown */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => downloadIcsFile(scholarship)}
              title="Download iCal (.ics) file"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              aria-label="Download calendar event"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <a
              href={generateGoogleCalendarUrl(scholarship)}
              target="_blank"
              rel="noopener noreferrer"
              title="Add to Google Calendar"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
              aria-label="Add to Google Calendar"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Track Application Toggle */}
          {tracked ? (
            <div className="flex items-center gap-1.5">
              <select
                value={tracked.stage}
                onChange={(e) =>
                  updateApplicationStage(
                    scholarship.id,
                    e.target.value as "saved" | "drafting" | "documents-ready" | "submitted" | "awarded"
                  )
                }
                className="text-xs font-semibold px-2.5 py-2 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 focus:outline-none"
              >
                <option value="saved">📌 Saved</option>
                <option value="drafting">✍️ Drafting</option>
                <option value="documents-ready">📁 Docs Ready</option>
                <option value="submitted">🚀 Submitted</option>
                <option value="awarded">🏆 Awarded</option>
              </select>
              <button
                type="button"
                onClick={() => removeApplication(scholarship.id)}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 cursor-pointer"
                title="Remove from tracker"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => trackScholarship(scholarship.id, "saved")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Track Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
