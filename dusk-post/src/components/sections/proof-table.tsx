"use client";

import { useEffect, useRef, useState } from "react";
import { CHARACTER } from "@/data/press";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";
import { Sable } from "@/components/shared/sable";

const GHOSTS = [
  { ink: "#0e8ea8", x: -1, y: 0.35 },
  { ink: "#c43b72", x: 1, y: -0.2 },
  { ink: "#c49212", x: 0.15, y: 1 },
];

export function ProofTable() {
  const { play, returning, ready } = usePress();
  const reduced = useReducedMotion();
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [scatter, setScatter] = useState(1);
  const [roll, setRoll] = useState(0);
  const [holding, setHolding] = useState(false);
  const [rings, setRings] = useState(0);
  const bellNoted = useRef(false);
  const holdTimer = useRef<number | null>(null);
  const { findEgg, openEgg, egg } = usePress();
  const shownScatter = reduced ? 0 : scatter;

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearInterval(holdTimer.current);
    };
  }, []);

  function track(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const next = {
      x: Math.max(-1, Math.min(1, x * 2)),
      y: Math.max(-1, Math.min(1, y * 2)),
    };
    setLook(next);
    if (!reduced) setScatter(Math.min(1, Math.hypot(x, y) * 2.2));
  }

  function pullTogether() {
    setScatter(0);
    setLook({ x: 0, y: 0 });
    if (!bellNoted.current) {
      bellNoted.current = true;
      play("bell");
    }
  }

  function startHold(event: React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) {
    if ("button" in event && event.button !== 0) return;
    if (holdTimer.current) return;
    setHolding(true);
    play("rustle");
    holdTimer.current = window.setInterval(() => {
      setRoll((value) => value + (reduced ? 0 : 10));
    }, 50);
  }

  function endHold() {
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
    if (holding) play("press");
    setHolding(false);
  }

  return (
    <section id="table" className="section" aria-labelledby="table-title">
      <div className="sheet hero-sheet" onPointerMove={track}>
        <CropMarks />
        <div className="hero-copy">
          <p className="eyebrow">Junior printer, night shift</p>
          <h1 id="table-title">{ready && returning ? "The plates kept your place." : "Sable is out of register."}</h1>
          <p className="tagline">{CHARACTER.tagline}</p>
          <p>
            Move across the sheet and the color plates follow. Hold the roller to ink it. The bell is not decoration.
          </p>
          <div className="actions">
            <a className="button" href="#plates">
              Align the plates
            </a>
            <button type="button" className="button button-quiet" onClick={pullTogether}>
              Pull the colors together
            </button>
          </div>
        </div>
        <div className="figure">
          <div className="ghosts" aria-hidden="true">
            {GHOSTS.map((ghost) => (
              <div
                key={ghost.ink}
                className="ghost"
                style={{ transform: `translate(${ghost.x * shownScatter * 22}px, ${ghost.y * shownScatter * 22}px)` }}
              >
                <Sable look={look} ink={ghost.ink} platesOnly />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={holding ? "roller-hit is-holding" : "roller-hit"}
            aria-label="Hold to roll Sable across the sheet"
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            onPointerLeave={endHold}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                startHold(event);
              }
            }}
            onKeyUp={(event) => {
              if (event.key === " " || event.key === "Enter") endHold();
            }}
          >
            <Sable look={look} roll={roll} />
          </button>
          <button
            type="button"
            className="bell"
            aria-label={egg ? "Brass bell. Open the first misprint." : "Brass bell. Ring it four times."}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => {
              play("bell");
              if (egg) {
                openEgg();
                return;
              }
              const next = rings + 1;
              if (next >= 4) {
                setRings(0);
                findEgg();
                return;
              }
              setRings(next);
            }}
          >
            <span className="bell-body" />
          </button>
          <p className="hold-note" aria-live="polite">
            {holding
              ? "Sable is inking."
              : egg
                ? "The bell found the first misprint."
                : rings > 0
                  ? `Bell ${rings} of 4.`
                  : "Hold the roller. Tap the bell."}
          </p>
        </div>
      </div>
    </section>
  );
}
