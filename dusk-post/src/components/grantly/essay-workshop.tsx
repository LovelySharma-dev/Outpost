"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { SCHOLARSHIPS, type Scholarship } from "@/data/scholarships";
import { useGrantly } from "@/lib/grantly-store";

const noteSchema = z.string().trim().max(4000, "Keep the draft under 4000 characters.");

type Critique = {
  strengths: string[];
  improvements: string[];
  score: number;
  mode?: "simulation" | "fallback" | "live";
  message?: string;
};

function hooksFrom(prompt: string) {
  return prompt
    .split(/[.?!]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function Notepad({
  scholarship,
  initial,
  onSave,
}: {
  scholarship: Scholarship;
  initial: string;
  onSave: (draft: string, report: (message: string) => void) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [message, setMessage] = useState("");
  const [coach, setCoach] = useState<Critique | null>(null);
  const [coaching, setCoaching] = useState(false);
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const target = scholarship.requirements.wordCount ?? 0;
  const invalid = message.startsWith("Keep") || message.startsWith("Write");

  async function askCoach() {
    setCoaching(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essayText: draft, scholarshipTitle: scholarship.title }),
      });
      const data = (await response.json()) as Critique;
      if (!response.ok) {
        setMessage(data.message ?? "The coach needs a longer draft.");
        setCoach(null);
        return;
      }
      setCoach(data);
    } catch {
      setCoach({
        strengths: ["Compelling personal voice and a clear career roadmap."],
        improvements: ["Add one concrete project with a result you can count."],
        score: 85,
        mode: "fallback",
      });
    } finally {
      setCoaching(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft, setMessage);
      }}
    >
      <p>{scholarship.requirements.essayPrompt}</p>
      <h3>Prompt breakdown</h3>
      <ul>
        {hooksFrom(scholarship.requirements.essayPrompt ?? scholarship.description).map((hook) => (
          <li key={hook}>{hook}</li>
        ))}
      </ul>
      <p className="g-meta">
        Word target {target || "open"}. Draft is {words} {words === 1 ? "word" : "words"}.
      </p>
      <label className="g-field">
        Notepad
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={8} maxLength={4000} />
      </label>
      {message ? (
        <p className={invalid ? "g-error" : "g-note"} role="status">
          {message}
        </p>
      ) : null}
      <div className="g-ctas">
        <button type="submit">Save note on this device</button>
        <button type="button" className="g-quiet" onClick={() => void askCoach()} disabled={coaching}>
          {coaching ? "Reading the draft…" : "Ask the essay coach"}
        </button>
      </div>
      {coach ? (
        <div className="g-coach" role="status">
          <p className="g-meta">
            Coach score {coach.score}.{" "}
            {coach.mode === "simulation"
              ? "Simulated read. A Gemini key is not configured on the server."
              : coach.mode === "fallback"
                ? "Gemini did not answer, so this is a local fallback."
                : "Gemini read this draft. The scholarship catalog stayed on this device."}
          </p>
          <h3>Strengths</h3>
          <ul>
            {coach.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Improvements</h3>
          <ul>
            {coach.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}

export function EssayWorkshop() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { applications, trackScholarship, updateNotes } = useGrantly();
  const [activeId, setActiveId] = useState<string | null>(null);
  const essays = SCHOLARSHIPS.filter((scholarship) => scholarship.requirements.essay && scholarship.requirements.essayPrompt);
  const active = essays.find((scholarship) => scholarship.id === activeId) ?? null;

  function open(id: string) {
    setActiveId(id);
    window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
    });
  }

  return (
    <section className="g-section" id="essay" aria-labelledby="essay-title">
      <p className="g-kicker">Essay workshop</p>
      <h2 id="essay-title">Read the prompt here, then write</h2>
      <p className="g-note">
        The catalog and your draft stay in this browser. Ask the coach and Gemini answers only when a server key is set.
        Otherwise you get a simulated read. Nothing is stored on a server.
      </p>
      <div className="g-stack">
        {essays.map((scholarship) => (
          <article key={scholarship.id} className="g-card">
            <h3>{scholarship.title}</h3>
            <p className="g-meta">About {scholarship.requirements.wordCount} words</p>
            <button type="button" onClick={() => open(scholarship.id)}>
              Open notepad
            </button>
          </article>
        ))}
      </div>
      <dialog
        className="g-dialog"
        ref={dialogRef}
        onClose={() => setActiveId(null)}
        aria-labelledby="essay-dialog-title"
      >
        {active ? (
          <>
            <h2 id="essay-dialog-title">{active.title}</h2>
            <Notepad
              key={active.id}
              scholarship={active}
              initial={applications[active.id]?.notes ?? ""}
              onSave={(draft, report) => {
                const parsed = noteSchema.safeParse(draft);
                if (!parsed.success) {
                  report(parsed.error.issues[0]?.message ?? "Note is too long.");
                  return;
                }
                if (!applications[active.id]) trackScholarship(active.id);
                updateNotes(active.id, parsed.data);
                report("Note kept in this browser.");
              }}
            />
            <button type="button" className="g-quiet" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </>
        ) : (
          <p>Choose an essay.</p>
        )}
      </dialog>
    </section>
  );
}
