"use client";

import { useState } from "react";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { useGrantly } from "@/lib/grantly-store";

function download(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function VerificationColophon() {
  const { applications, profile, getScholarshipById } = useGrantly();
  const [notice, setNotice] = useState("");
  const sponsors = Array.from(new Set(SCHOLARSHIPS.map((scholarship) => scholarship.provider)));

  function rows() {
    return Object.values(applications).map((application) => {
      const scholarship = getScholarshipById(application.scholarshipId);
      return {
        id: application.scholarshipId,
        title: scholarship?.title ?? application.scholarshipId,
        provider: scholarship?.provider ?? "",
        stage: application.stage,
        notes: application.notes,
        transcripts: application.checklist.transcriptsUploaded,
        letters: application.checklist.lettersRequested,
        essay: application.checklist.essayCompleted,
        financial: application.checklist.financialDocsReady,
      };
    });
  }

  return (
    <section className="g-section" id="colophon" aria-labelledby="colophon-title">
      <p className="g-kicker">Verification</p>
      <h2 id="colophon-title">Selection ratios, sponsors, and your board</h2>
      <p className="g-note">Exports read the board stored in this browser. Grantly does not upload them.</p>
      <ul className="g-sponsors">
        {sponsors.map((sponsor) => (
          <li key={sponsor}>{sponsor}</li>
        ))}
      </ul>
      <ul className="g-stack">
        {SCHOLARSHIPS.map((scholarship) => (
          <li key={scholarship.id} className="g-ratio">
            {scholarship.title}: {scholarship.selectionRatio}
          </li>
        ))}
      </ul>
      <div className="g-row">
        <button
          type="button"
          onClick={() => {
            download(
              "grantly-board.json",
              JSON.stringify({ profile, applications: rows() }, null, 2),
              "application/json",
            );
            setNotice("JSON file downloaded from this browser.");
          }}
        >
          Download JSON
        </button>
        <button
          type="button"
          onClick={() => {
            const header = ["title", "provider", "stage", "notes", "transcripts", "letters", "essay", "financial"];
            const body = rows().map((row) =>
              [row.title, row.provider, row.stage, row.notes, String(row.transcripts), String(row.letters), String(row.essay), String(row.financial)]
                .map(csvCell)
                .join(","),
            );
            download("grantly-board.csv", [header.join(","), ...body].join("\n"), "text/csv");
            setNotice("CSV file downloaded from this browser.");
          }}
        >
          Download CSV
        </button>
      </div>
      {notice ? (
        <p className="g-note" role="status">
          {notice}
        </p>
      ) : null}
    </section>
  );
}
