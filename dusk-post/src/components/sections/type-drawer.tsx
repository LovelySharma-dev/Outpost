"use client";

import { useState } from "react";
import { SORTS } from "@/data/press";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";

export function TypeDrawer() {
  const { caption, lockCaption, play, findEgg } = usePress();
  const [stick, setStick] = useState("");
  const [note, setNote] = useState("");

  function addSort(letter: string) {
    if (stick.length >= 18) {
      setNote("The stick is full.");
      play("clack");
      return;
    }
    setStick((current) => `${current}${letter}`);
    setNote("");
    play("clack");
  }

  function lockUp() {
    const next = stick.trim();
    if (!next) {
      setNote("Set at least one letter.");
      return;
    }
    lockCaption(next);
    setNote(`Locked up: ${next}`);
    play("press");
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
        <p className="stick" aria-live="polite">
          {stick || "Empty stick"}
        </p>
        <div className="sorts" role="group" aria-label="Metal sorts">
          {SORTS.map((letter) => (
            <button key={letter} type="button" className="sort" onClick={() => addSort(letter)}>
              {letter}
            </button>
          ))}
          <button type="button" className="sort sort-wide" onClick={() => addSort(" ")}>
            Space
          </button>
          <button
            type="button"
            className="sort sort-wide"
            onClick={() => {
              setStick((current) => current.slice(0, -1));
              play("clack");
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
