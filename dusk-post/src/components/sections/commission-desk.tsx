"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";
import type { StoredSheet } from "@/lib/storage";

const inputSchema = z.object({
  to: z.string().trim().min(2, "Name the person. Two letters at least.").max(32, "That name will not fit the sheet."),
  line: z.string().trim().min(2, "Give Sable one real line.").max(80, "Eighty characters is all one pull can hold."),
});

type Field = "to" | "line";
type Errors = Partial<Record<Field, string>>;
type Filter = "all" | "mine" | "shop";

export function CommissionDesk() {
  const { sheets, addSheet, removeSheet, restoreSheet, play } = usePress();
  const [to, setTo] = useState("");
  const [line, setLine] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState("");
  const [inking, setInking] = useState(false);
  const [undo, setUndo] = useState<StoredSheet | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  function copySheet(toName: string, textLine: string, id: string) {
    const text = `To ${toName}: "${textLine}" — Pulled at Night Press`;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    play("clack");
    window.setTimeout(() => setCopiedId(null), 2000);
  }

  const visible = sheets.filter((sheet) => {
    if (filter === "mine") return sheet.mine;
    if (filter === "shop") return !sheet.mine;
    return true;
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = inputSchema.safeParse({ to, line });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === "to" || key === "line") && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    setInking(true);
    play("press");
    window.setTimeout(() => {
      addSheet(parsed.data.to, parsed.data.line);
      setTo("");
      setLine("");
      setInking(false);
      setFilter("mine");
      setStatus("Hung on the drying rack in this browser. Nothing was sent to a server.");
    }, 450);
  }

  return (
    <section id="desk" className="section" aria-labelledby="desk-title">
      <div className="section-intro">
        <p className="eyebrow">The drying rack</p>
        <h2 id="desk-title">Hang one true line</h2>
        <p>Sable keeps it on this windowsill, in this browser, until you take it down.</p>
      </div>
      <div className="desk-grid">
        <form className="sheet" noValidate onSubmit={submit}>
          <CropMarks />
          {Object.keys(errors).length > 0 ? (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="error-summary" aria-labelledby="error-title">
              <h3 id="error-title">The sheet is not ready</h3>
              <ul>
                {(["to", "line"] as const).map((field) =>
                  errors[field] ? (
                    <li key={field}>
                      <a href={`#field-${field}`}>{errors[field]}</a>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="field-to">To</label>
            <input
              id="field-to"
              name="to"
              value={to}
              maxLength={32}
              autoComplete="name"
              aria-invalid={errors.to ? true : undefined}
              aria-describedby={errors.to ? "error-to" : undefined}
              onChange={(event) => setTo(event.target.value)}
            />
            {errors.to ? (
              <p id="error-to" className="field-error">
                {errors.to}
              </p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="field-line">The line</label>
            <textarea
              id="field-line"
              name="line"
              value={line}
              maxLength={80}
              rows={3}
              aria-invalid={errors.line ? true : undefined}
              aria-describedby={errors.line ? "error-line" : undefined}
              onChange={(event) => setLine(event.target.value)}
            />
            {errors.line ? (
              <p id="error-line" className="field-error">
                {errors.line}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button" disabled={inking}>
            {inking ? "Inking…" : "Hang on the rack"}
          </button>
          <p className="status" role="status">
            {status}
          </p>
        </form>
        <div className="rack-wrap">
          <div className="tabs" role="tablist" aria-label="Drying rack">
            {(
              [
                ["all", "All"],
                ["mine", "Mine"],
                ["shop", "Shop copies"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {undo ? (
            <p className="undo" role="status">
              Taken down.
              <button
                type="button"
                onClick={() => {
                  restoreSheet(undo);
                  setUndo(null);
                  play("clack");
                }}
              >
                Hang it back
              </button>
            </p>
          ) : null}
          {visible.length === 0 ? (
            <p className="empty">The rack is clear. Fold a line and it will hang here.</p>
          ) : (
            <ul className="rack">
              {visible.map((sheet) => (
                <li key={sheet.id} className="hanging">
                  <p className="eyebrow">{sheet.mine ? "Your pull" : "Shop copy"}</p>
                  <p className="hanging-to">To {sheet.to}</p>
                  <p>{sheet.line}</p>
                  <div className="actions">
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={() => copySheet(sheet.to, sheet.line, sheet.id)}
                      aria-label={`Copy line to ${sheet.to}`}
                    >
                      {copiedId === sheet.id ? "Copied" : "Copy line"}
                    </button>
                    {sheet.mine ? (
                      <button
                        type="button"
                        className="button button-quiet"
                        onClick={() => {
                          const removed = removeSheet(sheet.id);
                          if (removed) setUndo(removed);
                          play("rustle");
                        }}
                      >
                        Take down
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
