"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Volume2, VolumeX } from "lucide-react";
import {
  SCHOLARSHIPS,
  type EducationLevel,
  type Scholarship,
  type ScholarshipCategory,
} from "@/data/scholarships";
import { createPressAudio } from "@/lib/audio";
import { useGrantly, type TrackedApplication } from "@/lib/grantly-store";

const TODAY = "2026-11-07";
const LEVELS: EducationLevel[] = ["high-school", "undergraduate", "graduate", "bootcamp"];
const FIELDS: Array<ScholarshipCategory | "All"> = [
  "All",
  "STEM & Tech",
  "Women in Leadership",
  "Underrepresented Groups",
  "Merit & Academic",
  "Financial Need",
  "Creative Arts & Design",
  "Global & International",
];

const noteSchema = z.string().trim().max(240, "Keep the note to 240 characters.");

const LEVEL_LABEL: Record<EducationLevel, string> = {
  "high-school": "High school",
  undergraduate: "Undergraduate",
  graduate: "Graduate",
  bootcamp: "Bootcamp",
};

const STATUS_LABEL = {
  saved: "Not started",
  drafting: "Drafting",
  "documents-ready": "Drafting",
  submitted: "Submitted",
  awarded: "Submitted",
} as const;

type DeadlineWindow = "any" | "30" | "60";
type AwardBand = "any" | "small" | "mid" | "large";
type NeedFilter = "any" | "need" | "merit";

function daysUntil(iso: string) {
  const due = Date.parse(`${iso}T00:00:00Z`);
  const today = Date.parse(`${TODAY}T00:00:00Z`);
  return Math.round((due - today) / 86400000);
}

function formatDate(iso: string, withYear = false) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, month, day] = iso.split("-");
  const base = `${months[Number(month) - 1]} ${Number(day)}`;
  return withYear ? `${base}, ${year}` : base;
}

function asks(scholarship: Scholarship) {
  const items = [
    scholarship.requirements.essay ? `Essay${scholarship.requirements.wordCount ? `, about ${scholarship.requirements.wordCount} words` : ""}` : null,
    scholarship.requirements.transcripts ? "Transcript" : null,
    scholarship.requirements.recommendationLetters
      ? `${scholarship.requirements.recommendationLetters} letter${scholarship.requirements.recommendationLetters > 1 ? "s" : ""}`
      : null,
    scholarship.requirements.portfolio ? "Portfolio" : null,
    scholarship.requirements.financialProof ? "Proof of need" : null,
  ].filter((item): item is string => Boolean(item));
  return items.length ? items : ["A short application"];
}

function PassNotes({
  initial,
  stage,
  checklist,
  onStage,
  onToggle,
  onSave,
  onRemove,
}: {
  initial: string;
  stage: "saved" | "drafting" | "submitted";
  checklist: TrackedApplication["checklist"];
  onStage: (stage: "saved" | "drafting" | "submitted") => void;
  onToggle: (key: keyof TrackedApplication["checklist"]) => void;
  onSave: (draft: string, report: (message: string) => void) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  return (
    <form
      className="pass-manage"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft, setError);
      }}
    >
      <label>
        Status
        <select value={stage} onChange={(event) => onStage(event.target.value as "saved" | "drafting" | "submitted")}>
          <option value="saved">Not started</option>
          <option value="drafting">Drafting</option>
          <option value="submitted">Submitted</option>
        </select>
      </label>
      <fieldset>
        <legend>Checklist</legend>
        <label>
          <input type="checkbox" checked={checklist.essayCompleted} onChange={() => onToggle("essayCompleted")} />
          Essay drafted
        </label>
        <label>
          <input type="checkbox" checked={checklist.transcriptsUploaded} onChange={() => onToggle("transcriptsUploaded")} />
          Transcript ready
        </label>
        <label>
          <input type="checkbox" checked={checklist.lettersRequested} onChange={() => onToggle("lettersRequested")} />
          Letters requested
        </label>
        <label>
          <input type="checkbox" checked={checklist.financialDocsReady} onChange={() => onToggle("financialDocsReady")} />
          Need documents ready
        </label>
      </fieldset>
      <label>
        Note
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={280} />
      </label>
      {error ? (
        <p className="route-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="route-actions">
        <button type="submit" className="route-primary">
          Save note
        </button>
        <button type="button" className="route-quiet" onClick={onRemove}>
          Take down
        </button>
      </div>
    </form>
  );
}

export function GrantlyView() {
  const {
    ready,
    muted,
    toggleMuted,
    scholarships,
    applications,
    trackScholarship,
    removeApplication,
    restoreApplication,
    updateApplicationStage,
    updateNotes,
    toggleChecklistItem,
  } = useGrantly();
  const audio = useRef<ReturnType<typeof createPressAudio> | null>(null);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<EducationLevel | "any">("any");
  const [field, setField] = useState<(typeof FIELDS)[number]>("All");
  const [need, setNeed] = useState<NeedFilter>("any");
  const [deadline, setDeadline] = useState<DeadlineWindow>("any");
  const [award, setAward] = useState<AwardBand>("any");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState<TrackedApplication | null>(null);

  useEffect(() => {
    const engine = createPressAudio();
    audio.current = engine;
    return () => engine.dispose();
  }, []);

  useEffect(() => {
    audio.current?.setMuted(muted);
  }, [muted]);

  const catalog = scholarships.length ? scholarships : SCHOLARSHIPS;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog
      .map((scholarship) => ({ scholarship, days: daysUntil(scholarship.deadline) }))
      .filter(({ scholarship, days }) => {
        if (level !== "any" && !scholarship.educationLevels.includes(level)) return false;
        if (field !== "All" && scholarship.category !== field) return false;
        if (need === "need" && !scholarship.needBased) return false;
        if (need === "merit" && scholarship.needBased) return false;
        if (deadline === "30" && days > 30) return false;
        if (deadline === "60" && days > 60) return false;
        if (award === "small" && scholarship.amount >= 8000) return false;
        if (award === "mid" && (scholarship.amount < 8000 || scholarship.amount > 14000)) return false;
        if (award === "large" && scholarship.amount <= 14000) return false;
        if (!needle) return true;
        const haystack = `${scholarship.title} ${scholarship.provider} ${scholarship.description} ${scholarship.category} ${scholarship.majors.join(" ")}`.toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => a.days - b.days);
  }, [award, catalog, deadline, field, level, need, query]);

  const open = catalog.find((item) => item.id === openId) ?? null;
  const openTrack = open ? applications[open.id] : undefined;

  const saved = catalog
    .filter((item) => applications[item.id])
    .map((item) => ({ scholarship: item, track: applications[item.id], days: daysUntil(item.deadline) }))
    .sort((a, b) => a.days - b.days);
  const dueSoon = saved.filter((item) => item.days <= 45 && item.track.stage !== "submitted" && item.track.stage !== "awarded");
  const leaving = catalog
    .map((item) => ({ scholarship: item, days: daysUntil(item.deadline) }))
    .filter((item) => item.days >= 0 && item.days <= 21)
    .sort((a, b) => a.days - b.days);

  function play(name: "clack" | "press" | "bell", force = 0.7) {
    if (muted) return;
    audio.current?.play(name, force);
  }

  function keep(id: string) {
    trackScholarship(id, "saved");
    setNotice("Kept in this browser. Nothing was sent to a funder.");
    play("clack", 0.55);
  }

  function takeDown(id: string) {
    const current = applications[id];
    if (!current) return;
    setUndo(current);
    removeApplication(id);
    setNotice("Taken out of the wallet. Still only on this browser.");
    play("press", 0.4);
  }

  function saveNote(id: string, draft: string, report: (message: string) => void) {
    const parsed = noteSchema.safeParse(draft);
    if (!parsed.success) {
      report(parsed.error.issues[0]?.message ?? "That note will not fit.");
      setNotice("");
      return;
    }
    updateNotes(id, parsed.data);
    report("");
    setNotice("Note kept on this pass, in this browser.");
    play("clack", 0.35);
  }

  function resetFilters() {
    setQuery("");
    setLevel("any");
    setField("All");
    setNeed("any");
    setDeadline("any");
    setAward("any");
  }

  return (
    <div className="route">
      <header className="route-bar">
        <a className="route-mark" href="#top">
          <span className="route-dot" aria-hidden="true" />
          Grantly
        </a>
        <nav aria-label="Grantly sections">
          <a href="#timetable">Timetable</a>
          <a href="#wallet">Wallet</a>
        </nav>
        <button
          type="button"
          className="route-mute"
          aria-pressed={muted}
          onClick={() => {
            toggleMuted();
            if (muted) audio.current?.play("bell", 0.4);
          }}
        >
          {muted ? <VolumeX aria-hidden size={18} /> : <Volume2 aria-hidden size={18} />}
          {muted ? "Muted" : "Sound"}
        </button>
      </header>

      <main id="content">
        <section className="route-hero" id="top" aria-labelledby="grantly-title">
          <p className="route-kicker">A route book for student funding</p>
          <h1 id="grantly-title">Find the award. Keep the deadline.</h1>
          <p className="route-lead">
            Grantly turns a pile of scholarships into one timetable. Read who a pass fits, what it asks, and when it leaves. Save it in a wallet that stays on this browser.
          </p>
          <div className="route-actions">
            <a className="route-primary" href="#timetable">
              Open the timetable
            </a>
            <a className="route-quiet" href="#wallet">
              See the wallet
            </a>
          </div>
          <ol className="route-steps">
            <li>
              <strong>01 Find</strong>
              <span>Search by level, field, need, deadline, and size.</span>
            </li>
            <li>
              <strong>02 Read</strong>
              <span>Open the pass before you promise an essay.</span>
            </li>
            <li>
              <strong>03 Keep</strong>
              <span>Track Not started, Drafting, or Submitted.</span>
            </li>
          </ol>
        </section>

        <section className="route-soon" aria-labelledby="soon-title">
          <div className="route-section-head">
            <p className="route-kicker">Next stations</p>
            <h2 id="soon-title">Leaving within three weeks</h2>
          </div>
          <ul className="route-rail">
            {leaving.map(({ scholarship, days }) => (
              <li key={scholarship.id}>
                <button type="button" className="station" onClick={() => setOpenId(scholarship.id)}>
                  <span>{days === 0 ? "Today" : `${days}d`}</span>
                  <strong>{scholarship.title}</strong>
                  <em>{scholarship.amountFormatted}</em>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="route-board" id="timetable" aria-labelledby="table-title">
          <div className="route-section-head">
            <p className="route-kicker">The timetable</p>
            <h2 id="table-title">
              {filtered.length} {filtered.length === 1 ? "pass" : "passes"} on this route
            </h2>
          </div>
          <form className="route-filters" role="search" onSubmit={(event) => event.preventDefault()}>
            <label>
              Search
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, funder, or field"
                type="search"
              />
            </label>
            <label>
              Level
              <select value={level} onChange={(event) => setLevel(event.target.value as EducationLevel | "any")}>
                <option value="any">Any level</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {LEVEL_LABEL[item]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Field
              <select value={field} onChange={(event) => setField(event.target.value as (typeof FIELDS)[number])}>
                {FIELDS.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "Any field" : item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Need
              <select value={need} onChange={(event) => setNeed(event.target.value as NeedFilter)}>
                <option value="any">Need or merit</option>
                <option value="need">Need-based</option>
                <option value="merit">Merit only</option>
              </select>
            </label>
            <label>
              Deadline
              <select value={deadline} onChange={(event) => setDeadline(event.target.value as DeadlineWindow)}>
                <option value="any">Any date</option>
                <option value="30">Within 30 days</option>
                <option value="60">Within 60 days</option>
              </select>
            </label>
            <label>
              Award
              <select value={award} onChange={(event) => setAward(event.target.value as AwardBand)}>
                <option value="any">Any size</option>
                <option value="small">Under $8,000</option>
                <option value="mid">$8,000 to $14,000</option>
                <option value="large">Over $14,000</option>
              </select>
            </label>
          </form>

          {filtered.length === 0 ? (
            <div className="route-empty">
              <h3>No pass matches that route.</h3>
              <p>Clear a filter or search a funder by name.</p>
              <button type="button" className="route-primary" onClick={resetFilters}>
                Show every pass
              </button>
            </div>
          ) : (
            <ul className="route-list">
              {filtered.map(({ scholarship, days }) => {
                const tracked = applications[scholarship.id];
                return (
                  <li key={scholarship.id}>
                    <article className={openId === scholarship.id ? "pass is-open" : "pass"}>
                      <button type="button" className="pass-open" onClick={() => setOpenId(scholarship.id)}>
                        <span className="pass-date">
                          {formatDate(scholarship.deadline)}
                          <small>{days < 0 ? "Closed" : `${days} days`}</small>
                        </span>
                        <span>
                          <strong>{scholarship.title}</strong>
                          <em>
                            {scholarship.provider} · {scholarship.category}
                          </em>
                        </span>
                        <span className="pass-amount">{scholarship.amountFormatted}</span>
                      </button>
                      {tracked ? <span className="pass-status">{STATUS_LABEL[tracked.stage]}</span> : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          {open ? (
            <article className="pass-detail" id="pass" aria-labelledby="pass-title">
              <p className="route-kicker">{open.provider}</p>
              <h2 id="pass-title">{open.title}</h2>
              <p>{open.description}</p>
              <dl className="pass-facts">
                <div>
                  <dt>Due</dt>
                  <dd>
                    {formatDate(open.deadline, true)} · {daysUntil(open.deadline)} days from Nov 7
                  </dd>
                </div>
                <div>
                  <dt>Award</dt>
                  <dd>
                    {open.amountFormatted}
                    {open.renewable ? " · renewable" : ""}
                  </dd>
                </div>
                <div>
                  <dt>Who it fits</dt>
                  <dd>
                    {open.educationLevels.map((item) => LEVEL_LABEL[item]).join(", ")}. {open.majors.join(", ")}. GPA {open.minGpa}+.{" "}
                    {open.needBased ? "Need is part of the decision." : "Awarded on merit, not family income."} {open.citizenship.join(", ")}.
                  </dd>
                </div>
                <div>
                  <dt>What it asks</dt>
                  <dd>
                    {asks(open).join(" · ")}
                    {open.requirements.essayPrompt ? ` Prompt: ${open.requirements.essayPrompt}` : ""}
                  </dd>
                </div>
              </dl>
              {openTrack ? (
                <PassNotes
                  key={open.id}
                  initial={openTrack.notes}
                  stage={openTrack.stage === "documents-ready" ? "drafting" : openTrack.stage === "awarded" ? "submitted" : openTrack.stage}
                  checklist={openTrack.checklist}
                  onStage={(stage) => {
                    updateApplicationStage(open.id, stage);
                    setNotice("Status updated in this browser.");
                    play("clack", 0.8);
                  }}
                  onToggle={(key) => toggleChecklistItem(open.id, key)}
                  onSave={(draft, report) => saveNote(open.id, draft, report)}
                  onRemove={() => takeDown(open.id)}
                />
              ) : (
                <button type="button" className="route-primary" onClick={() => keep(open.id)}>
                  Keep in the wallet
                </button>
              )}
            </article>
          ) : null}
          {notice ? (
            <p className="route-notice" role="status">
              {notice}
            </p>
          ) : null}
          {undo ? (
            <p className="route-undo">
              Removed {catalog.find((item) => item.id === undo.scholarshipId)?.title ?? "that pass"}.
              <button
                type="button"
                onClick={() => {
                  restoreApplication(undo);
                  setUndo(null);
                  setNotice("Put back in the wallet.");
                }}
              >
                Undo
              </button>
            </p>
          ) : null}
        </section>

        <section className="route-wallet" id="wallet" aria-labelledby="wallet-title">
          <div className="route-section-head">
            <p className="route-kicker">The wallet</p>
            <h2 id="wallet-title">Due soon, then everything you kept</h2>
            <p>Saved passes live in this browser until you take them down. {ready ? "" : "Opening the wallet…"}</p>
          </div>
          <div className="wallet-grid">
            <div>
              <h3>Due soon</h3>
              {dueSoon.length === 0 ? (
                <p className="route-empty-inline">Nothing you saved leaves in the next 45 days.</p>
              ) : (
                <ul className="wallet-list">
                  {dueSoon.map(({ scholarship, track, days }) => (
                    <li key={scholarship.id}>
                      <button type="button" onClick={() => setOpenId(scholarship.id)}>
                        <strong>{scholarship.title}</strong>
                        <span>
                          {days} days · {STATUS_LABEL[track.stage]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3>Saved</h3>
              {saved.length === 0 ? (
                <p className="route-empty-inline">The wallet is empty. Keep a pass from the timetable.</p>
              ) : (
                <ul className="wallet-list">
                  {saved.map(({ scholarship, track, days }) => (
                    <li key={scholarship.id}>
                      <button type="button" onClick={() => setOpenId(scholarship.id)}>
                        <strong>{scholarship.title}</strong>
                        <span>
                          {formatDate(scholarship.deadline)} · {days} days · {STATUS_LABEL[track.stage]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="route-foot">
        <p>Grantly keeps the timetable in the page and the wallet in this browser. Applications are not filed with funders from here.</p>
      </footer>
    </div>
  );
}
