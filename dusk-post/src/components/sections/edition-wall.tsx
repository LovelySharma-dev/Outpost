"use client";

import { useState } from "react";
import { EDITIONS, type EditionId } from "@/data/press";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";

function PosterArt({ id }: { id: EditionId }) {
  if (id === "window") {
    return (
      <svg viewBox="0 0 160 200" aria-hidden="true">
        <rect x="28" y="24" width="104" height="140" fill="#14324a" />
        <rect x="40" y="36" width="80" height="104" fill="none" stroke="#f4efe4" strokeWidth="3" />
        <rect x="86" y="78" width="10" height="62" fill="#e2b56a" />
      </svg>
    );
  }
  if (id === "cups") {
    return (
      <svg viewBox="0 0 160 200" aria-hidden="true">
        <circle cx="68" cy="96" r="36" fill="#c43b72" opacity="0.85" />
        <circle cx="98" cy="112" r="36" fill="#d4a017" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 200" aria-hidden="true">
      <path d="M30 150 C 55 90, 80 120, 130 40" fill="none" stroke="#1c1916" strokeWidth="3" />
      <circle cx="30" cy="150" r="5" fill="#0e8ea8" />
      <circle cx="78" cy="112" r="5" fill="#0e8ea8" />
      <circle cx="130" cy="40" r="5" fill="#c43b72" />
    </svg>
  );
}

export function EditionWall() {
  const { proofs, pullProof, kept, toggleKept, play } = usePress();
  const [inking, setInking] = useState<EditionId | null>(null);

  function pull(id: EditionId) {
    if (inking) return;
    setInking(id);
    play("press");
    window.setTimeout(() => {
      pullProof(id);
      setInking(null);
    }, 420);
  }

  return (
    <section id="editions" className="section" aria-labelledby="editions-title">
      <div className="section-intro">
        <p className="eyebrow">Project two</p>
        <h2 id="editions-title">Pocket editions</h2>
        <p>Three sheets Sable already pulled. A proof stays in this browser.</p>
      </div>
      <ul className="edition-grid">
        {EDITIONS.map((edition) => {
          const count = proofs[edition.id] ?? 0;
          const saved = kept.includes(edition.id);
          return (
            <li key={edition.id} className="sheet poster">
              <CropMarks />
              <p className="eyebrow">{edition.code}</p>
              <div className="poster-art">
                <PosterArt id={edition.id} />
                {count > 0 ? <span className="stamp">Proof {String(count).padStart(2, "0")}</span> : null}
              </div>
              <h3>{edition.title}</h3>
              <p>{edition.note}</p>
              <div className="actions">
                <button type="button" className="button" onClick={() => pull(edition.id)} disabled={inking === edition.id}>
                  {inking === edition.id ? "Inking…" : "Pull a proof"}
                </button>
                <button
                  type="button"
                  className="button button-quiet"
                  aria-pressed={saved}
                  onClick={() => {
                    toggleKept(edition.id);
                    play("clack");
                  }}
                >
                  {saved ? "Kept on the wall" : "Keep this sheet"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
