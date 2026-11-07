"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { PLATES, START_OFFSETS, ZERO_OFFSETS, type PlateId } from "@/data/press";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { usePress } from "@/components/press-provider";
import { CropMarks } from "@/components/shared/crop-marks";

type Offset = { x: number; y: number };
type Layout = Record<PlateId, Offset>;

function clamp(value: number) {
  return Math.max(-120, Math.min(120, value));
}

function aligned(layout: Layout) {
  return PLATES.every((plate) => Math.hypot(layout[plate.id].x, layout[plate.id].y) <= 12);
}

function PlateStage({ initialLocked }: { initialLocked: boolean }) {
  const { setRegistered, play } = usePress();
  const reduced = useReducedMotion();
  const grainId = useId().replace(/:/g, "");
  const [pos, setPos] = useState<Layout>(initialLocked ? ZERO_OFFSETS : START_OFFSETS);
  const [locked, setLocked] = useState(initialLocked);
  const [selected, setSelected] = useState<PlateId>("c");
  const drag = useRef<{ id: PlateId; px: number; py: number; ox: number; oy: number } | null>(null);
  const lockedRef = useRef(initialLocked);
  const posRef = useRef(pos);
  const plateRefs = useRef<Partial<Record<PlateId, HTMLButtonElement | null>>>({});
  const bedRef = useRef<HTMLDivElement>(null);
  const snapping = useRef<Set<PlateId>>(new Set());

  useLayoutEffect(() => {
    for (const plate of PLATES) {
      const node = plateRefs.current[plate.id];
      if (!node || snapping.current.has(plate.id)) continue;
      gsap.set(node, { x: pos[plate.id].x, y: pos[plate.id].y, force3D: true });
    }
  }, [pos]);

  function commit(next: Layout) {
    posRef.current = next;
    setPos(next);
    if (lockedRef.current || !aligned(next)) return;
    lockedRef.current = true;
    setLocked(true);
    setRegistered(true);
    play("lock");
    play("bell");
    const pulse = bedRef.current?.querySelector(".bed-pulse");
    if (!pulse || reduced) return;
    gsap.fromTo(pulse, { opacity: 0.92 }, { opacity: 0, duration: 0.55, ease: "power2.out", overwrite: "auto" });
  }

  function springToCenter(id: PlateId, fromX: number, fromY: number) {
    const node = plateRefs.current[id];
    if (!node || snapping.current.has(id)) return;
    snapping.current.add(id);
    drag.current = null;
    if (reduced) {
      snapping.current.delete(id);
      commit({ ...posRef.current, [id]: { x: 0, y: 0 } });
      return;
    }
    gsap.set(node, { x: fromX, y: fromY, force3D: true });
    gsap.to(node, {
      x: 0,
      y: 0,
      duration: 0.72,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
      onComplete: () => {
        snapping.current.delete(id);
        commit({ ...posRef.current, [id]: { x: 0, y: 0 } });
      },
    });
  }

  function place(id: PlateId, x: number, y: number) {
    if (lockedRef.current || snapping.current.has(id)) return;
    const nextX = clamp(x);
    const nextY = clamp(y);
    if (Math.hypot(nextX, nextY) <= 25) {
      springToCenter(id, nextX, nextY);
      return;
    }
    commit({ ...posRef.current, [id]: { x: nextX, y: nextY } });
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>, id: PlateId) {
    if (lockedRef.current || snapping.current.has(id)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, px: event.clientX, py: event.clientY, ox: posRef.current[id].x, oy: posRef.current[id].y };
    setSelected(id);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || lockedRef.current) return;
    place(active.id, active.ox + event.clientX - active.px, active.oy + event.clientY - active.py);
  }

  function nudge(dx: number, dy: number) {
    if (lockedRef.current || snapping.current.has(selected)) return;
    place(selected, posRef.current[selected].x + dx, posRef.current[selected].y + dy);
    play("clack", 0.62);
  }

  function resetBed() {
    gsap.killTweensOf(Object.values(plateRefs.current));
    snapping.current.clear();
    lockedRef.current = false;
    posRef.current = START_OFFSETS;
    setPos(START_OFFSETS);
    setLocked(false);
    setRegistered(false);
    play("press");
  }

  const score = Math.max(...PLATES.map((plate) => Math.hypot(pos[plate.id].x, pos[plate.id].y)));
  const hint = locked ? "In register. The feeling landed." : score < 25 ? "Almost. A hair further." : "The colors are missing each other.";

  return (
    <>
      <div
        className="bed"
        ref={bedRef}
        tabIndex={0}
        role="region"
        aria-label="Registration bed. Use arrow keys to nudge the selected plate"
        onKeyDown={(event) => {
          const step = event.shiftKey ? 16 : 8;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(-step, 0);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(step, 0);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(0, -step);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(0, step);
          }
        }}
      >
        <span className="center-mark" aria-hidden="true" />
        <span className="paper-grain" aria-hidden="true">
          <svg>
            <filter id={grainId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#${grainId})`} />
          </svg>
        </span>
        <span className="bed-pulse" aria-hidden="true" />
        {PLATES.map((plate) => (
          <button
            key={plate.id}
            ref={(node) => {
              plateRefs.current[plate.id] = node;
            }}
            type="button"
            className={`plate plate-${plate.id}${selected === plate.id ? " is-selected" : ""}`}
            aria-pressed={selected === plate.id}
            aria-label={`${plate.name} plate. ${plate.hint}`}
            onPointerDown={(event) => onPointerDown(event, plate.id)}
            onPointerMove={onPointerMove}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onClick={() => setSelected(plate.id)}
          >
            <span className={`shape shape-${plate.id}`} />
            <span className="plate-name">{plate.name}</span>
          </button>
        ))}
        {locked ? <p className="stamp bed-stamp">In register</p> : null}
      </div>
      <p className="status" role="status">
        {hint}
      </p>
      <div className="nudge" aria-label="Nudge the selected plate">
        {PLATES.map((plate) => (
          <button
            key={plate.id}
            type="button"
            className={selected === plate.id ? "is-selected" : undefined}
            aria-pressed={selected === plate.id}
            onClick={() => setSelected(plate.id)}
          >
            {plate.name}
          </button>
        ))}
        <button type="button" onClick={() => nudge(0, -8)} aria-label="Nudge up">
          Up
        </button>
        <button type="button" onClick={() => nudge(0, 8)} aria-label="Nudge down">
          Down
        </button>
        <button type="button" onClick={() => nudge(-8, 0)} aria-label="Nudge left">
          Left
        </button>
        <button type="button" onClick={() => nudge(8, 0)} aria-label="Nudge right">
          Right
        </button>
        <button type="button" className="button-quiet" onClick={resetBed}>
          Misregister
        </button>
      </div>
    </>
  );
}

export function PlateBed() {
  const { ready, registered } = usePress();

  return (
    <section id="plates" className="section" aria-labelledby="plates-title">
      <div className="section-intro">
        <p className="eyebrow">Project one</p>
        <h2 id="plates-title">The registration bed</h2>
        <p>Drag each plate onto the center mark, or choose one and nudge it with the arrows.</p>
      </div>
      <div className="sheet bed-sheet">
        <CropMarks />
        {ready ? (
          <PlateStage key={registered ? "registered" : "open"} initialLocked={registered} />
        ) : (
          <p className="bed-wait">Setting the bed…</p>
        )}
      </div>
    </section>
  );
}
