"use client";

import { useState } from "react";
import { z } from "zod";
import { type ApplicationStage } from "@/data/scholarships";
import { useGrantly, type TrackedApplication } from "@/lib/grantly-store";

const STAGES: Array<{ id: ApplicationStage; label: string }> = [
  { id: "saved", label: "Saved" },
  { id: "drafting", label: "Drafting" },
  { id: "documents-ready", label: "Docs Ready" },
  { id: "submitted", label: "Submitted" },
  { id: "awarded", label: "Awarded" },
];

const CHECKS: Array<{ key: keyof TrackedApplication["checklist"]; label: string }> = [
  { key: "transcriptsUploaded", label: "Transcripts" },
  { key: "lettersRequested", label: "Letters" },
  { key: "essayCompleted", label: "Essay" },
  { key: "financialDocsReady", label: "Financial Verification" },
];

const noteSchema = z.string().trim().max(240, "Keep the note under 240 characters.");

function CardNotes({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (draft: string, report: (message: string) => void) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [message, setMessage] = useState("");
  const invalid = message.startsWith("Keep");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft, setMessage);
      }}
    >
      <label className="g-field">
        Private note
        <textarea value={draft} maxLength={280} rows={3} onChange={(event) => setDraft(event.target.value)} />
      </label>
      {message ? (
        <p className={invalid ? "g-error" : "g-note"} role="status">
          {message}
        </p>
      ) : null}
      <button type="submit">Save note</button>
    </form>
  );
}

export function KanbanBoard({ onStageSound }: { onStageSound: (name: "clack" | "bell") => void }) {
  const { applications, getScholarshipById, updateApplicationStage, toggleChecklistItem, updateNotes, removeApplication } =
    useGrantly();
  const [notice, setNotice] = useState("");
  const entries = Object.values(applications);

  function move(id: string, stage: ApplicationStage) {
    if (applications[id]?.stage === stage) return;
    updateApplicationStage(id, stage);
    onStageSound(stage === "awarded" ? "bell" : "clack");
    const title = getScholarshipById(id)?.title ?? "Application";
    setNotice(`${title} moved to ${STAGES.find((item) => item.id === stage)?.label ?? stage}. Stored in this browser.`);
  }

  return (
    <section className="g-section" id="kanban" aria-labelledby="kanban-title">
      <p className="g-kicker">Application tracker</p>
      <h2 id="kanban-title">Five stages, kept in this browser</h2>
      <p className="g-note">Drag a card onto a stage, or use the stage menu. Notes stay on this device.</p>
      {notice ? (
        <p className="g-note" role="status">
          {notice}
        </p>
      ) : null}
      {entries.length === 0 ? (
        <div className="g-panel">
          <h3>The board is empty.</h3>
          <p>Save an award from the match feed and it lands in Saved.</p>
        </div>
      ) : (
        <div className="g-kanban">
          {STAGES.map((column) => {
            const items = entries.filter((item) => item.stage === column.id);
            return (
              <div
                key={column.id}
                className="g-column"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const id = event.dataTransfer.getData("text/plain");
                  if (id) move(id, column.id);
                }}
              >
                <h3>
                  {column.label}
                  <span>{items.length}</span>
                </h3>
                {items.length === 0 ? <p className="g-note">None here.</p> : null}
                {items.map((item) => {
                  const scholarship = getScholarshipById(item.scholarshipId);
                  if (!scholarship) return null;
                  const done = CHECKS.filter((check) => item.checklist[check.key]).length;
                  return (
                    <article
                      key={item.scholarshipId}
                      className="g-card"
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", item.scholarshipId)}
                    >
                      <h3>{scholarship.title}</h3>
                      <p className="g-meta">
                        {done}/4 documents · {scholarship.amountFormatted}
                      </p>
                      <label className="g-field">
                        Stage
                        <select
                          value={item.stage}
                          aria-label={`Stage for ${scholarship.title}`}
                          onChange={(event) => move(item.scholarshipId, event.target.value as ApplicationStage)}
                        >
                          {STAGES.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {CHECKS.map((check) => (
                        <label key={check.key} className="g-check">
                          <input
                            type="checkbox"
                            checked={item.checklist[check.key]}
                            onChange={() => toggleChecklistItem(item.scholarshipId, check.key)}
                          />
                          {check.label}
                        </label>
                      ))}
                      <CardNotes
                        key={item.scholarshipId}
                        initial={item.notes}
                        onSave={(draft, report) => {
                          const parsed = noteSchema.safeParse(draft);
                          if (!parsed.success) {
                            report(parsed.error.issues[0]?.message ?? "Note is too long.");
                            return;
                          }
                          updateNotes(item.scholarshipId, parsed.data);
                          report("Note kept in this browser.");
                        }}
                      />
                      <button type="button" className="g-quiet" onClick={() => removeApplication(item.scholarshipId)}>
                        Take down
                      </button>
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
