"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import gsap from "gsap";
import { SORTS } from "@/data/press";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";

function tapForce(event: PointerEvent<HTMLButtonElement>) {
  if (event.pointerType === "mouse") return 0.4;
  return Math.min(1, 0.28 + (event.pressure || 0.2));
}

export function TypeDrawer() {
  const { caption, lockCaption, play, findEgg } = usePress();
  const reduced = useReducedMotion();
  const [stick, setStick] = useState("");
  const [note, setNote] = useState("");
  const railRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);

  useEffect(() => {
    const grew = stick.length > lengthRef.current;
    lengthRef.current = stick.length;
    if (!grew || reduced) return;
    const glyphs = railRef.current?.querySelectorAll<HTMLElement>(".sort-glyph");
    const last = glyphs?.[glyphs.length - 1];
    if (!last) return;
    const jitter = gsap.utils.random(-3, 3);
    gsap.fromTo(
      last,
      { y: -22, rotation: jitter, opacity: 0 },
      {
        y: 0,
        rotation: jitter * 0.35,
        opacity: 1,
        duration: 0.42,
        ease: "bounce.out",
        transformOrigin: "50% 0%",
        force3D: true,
      },
    );
  }, [stick, reduced]);

  function addSort(letter: string, force = 0.42) {
    if (stick.length >= 18) {
      setNote("The stick is full.");
      play("clack", 0.7);
      return;
    }
    setStick((current) => `${current}${letter}`);
    setNote("");
    play("clack", force);
  }

  function lockUp() {
    const next = stick.trim();
    if (!next) {
      setNote("Set at least one letter.");
      return;
    }
    lockCaption(next);
    setNote(`Locked up: ${next}`);
    play("clack", 1);
    play("press");
    if (!reduced && railRef.current) {
      const jaws = railRef.current.querySelectorAll<HTMLElement>(".stick-jaw");
      gsap
        .timeline()
        .to(jaws[0], { x: 10, duration: 0.09, ease: "power4.in", force3D: true })
        .to(jaws[1], { x: -10, duration: 0.09, ease: "power4.in", force3D: true }, "<")
        .to(jaws, { x: 0, duration: 0.28, ease: "elastic.out(1, 0.4)" });
    }
    if (next.toUpperCase() === "SABLE") {
      play("bell");
      findEgg();
    }
  }

  return (
    <section id="drawer" className="section" aria-labelledby="drawer-title">
      <div className="section-intro">
        <p className="eyebrow">Project three</p>
        <h2 id="drawer-title">The composing stick</h2>
        <p>Set a caption from the metal sorts. Eighteen characters, then lock it up.</p>
      </div>
      <div className="sheet">
        <CropMarks />
        <div className="stick-rail" ref={railRef}>
          <span className="stick-jaw" aria-hidden="true" />
          <p className="stick" aria-live="polite">
            {stick.length === 0
              ? "Empty stick"
              : stick.split("").map((glyph, index) => (
                  <span key={`${index}-${glyph}`} className="sort-glyph">
                    {glyph === " " ? "\u00a0" : glyph}
                  </span>
                ))}
          </p>
          <span className="stick-jaw" aria-hidden="true" />
        </div>
        <div className="sorts" role="group" aria-label="Metal sorts">
          {SORTS.map((letter) => (
            <button
              key={letter}
              type="button"
              className="sort"
              onPointerDown={(event) => {
                event.currentTarget.dataset.force = String(tapForce(event));
              }}
              onClick={(event) => addSort(letter, Number(event.currentTarget.dataset.force) || 0.42)}
            >
              {letter}
            </button>
          ))}
          <button
            type="button"
            className="sort sort-wide"
            onPointerDown={(event) => {
              event.currentTarget.dataset.force = String(tapForce(event));
            }}
            onClick={(event) => addSort(" ", Number(event.currentTarget.dataset.force) || 0.42)}
          >
            Space
          </button>
          <button
            type="button"
            className="sort sort-wide"
            onClick={() => {
              setStick((current) => current.slice(0, -1));
              play("clack", 0.28);
            }}
          >
            Delete
          </button>
        </div>
        <div className="actions">
          <button type="button" className="button" onClick={lockUp}>
            Lock up
          </button>
          <button
            type="button"
            className="button button-quiet"
            onClick={() => {
              setStick("");
              setNote("");
            }}
          >
            Dump the stick
          </button>
        </div>
        <p className="status" role="status">
          {note}
        </p>
        <p className="drying">
          On the line: <strong>{caption || "nothing locked up yet"}</strong>
        </p>
      </div>
    </section>
  );
}
