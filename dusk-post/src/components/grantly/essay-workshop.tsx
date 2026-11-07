"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { SCHOLARSHIPS, type Scholarship } from "@/data/scholarships";
import { useGrantly } from "@/lib/grantly-store";

const noteSchema = z.string().trim().max(240, "Keep the note under 240 characters.");

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
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const target = scholarship.requirements.wordCount ?? 0;
  const invalid = message.startsWith("Keep");
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
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={8} maxLength={280} />
      </label>
      {message ? (
        <p className={invalid ? "g-error" : "g-note"} role="status">
          {message}
        </p>
      ) : null}
      <button type="submit">Save note on this device</button>
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
      <p className="g-note">On-device assistance. The prompt is split in this browser. Nothing is sent to a model.</p>
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
