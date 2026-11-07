"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
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

type Quick = (value: number) => void;

export function ProofTable() {
  const { play, returning, ready } = usePress();
  const reduced = useReducedMotion();
  const [roll, setRoll] = useState(0);
  const [holding, setHolding] = useState(false);
  const [rings, setRings] = useState(0);
  const bellNoted = useRef(false);
  const holdingRef = useRef(false);
  const holdTimer = useRef<number | null>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const squishRef = useRef<HTMLSpanElement>(null);
  const pupil = useRef<{ x?: Quick; y?: Quick }>({});
  const ghosts = useRef<{ x: Quick; y: Quick }[]>([]);
  const lastPointer = useRef({ x: 0, y: 0, t: 0 });
  const { findEgg, openEgg, egg } = usePress();

  useEffect(() => {
    const root = figureRef.current;
    if (!root) return;
    const pupils = root.querySelector(".sable-pupils");
    const eyes = root.querySelector(".sable-eyes");
    const handle = root.querySelector(".sable-handle");
    const plates = root.querySelectorAll<HTMLElement>(".ghost");
    let blinking = true;
    const context = gsap.context(() => {
      ghosts.current = [];
      plates.forEach((plate, index) => {
        const ghost = GHOSTS[index];
        const x = reduced ? 0 : ghost.x * 22;
        const y = reduced ? 0 : ghost.y * 22;
        gsap.set(plate, { x, y, force3D: true });
        ghosts.current[index] = {
          x: gsap.quickTo(plate, "x", { duration: reduced ? 0 : 0.6, ease: "power3.out" }),
          y: gsap.quickTo(plate, "y", { duration: reduced ? 0 : 0.6, ease: "power3.out" }),
        };
      });
      if (pupils) {
        gsap.set(pupils, { x: 0, y: 0, force3D: true });
        pupil.current.x = gsap.quickTo(pupils, "x", { duration: reduced ? 0 : 0.5, ease: "power3.out" });
        pupil.current.y = gsap.quickTo(pupils, "y", { duration: reduced ? 0 : 0.5, ease: "power3.out" });
      }
      if (reduced || !eyes) return;
      const blink = () => {
        if (!blinking) return;
        gsap.to(eyes, {
          scaleY: 0.08,
          duration: 0.07,
          yoyo: true,
          repeat: 1,
          transformOrigin: "50% 62%",
          ease: "power1.inOut",
          onComplete: () => {
            if (blinking) gsap.delayedCall(gsap.utils.random(2.4, 5.6), blink);
          },
        });
      };
      gsap.delayedCall(1.1, blink);
    }, root);
    const squish = squishRef.current;
    return () => {
      blinking = false;
      if (eyes) gsap.killTweensOf(eyes);
      context.revert();
      if (handle) gsap.killTweensOf(handle);
      if (squish) gsap.killTweensOf(squish);
    };
  }, [reduced]);

  useEffect(() => {
    return () => {
      if (holdTimer.current) window.clearInterval(holdTimer.current);
    };
  }, []);

  function settle(x: number, y: number) {
    pupil.current.x?.(x * 6);
    pupil.current.y?.(y * 3.5);
    const scatter = reduced ? 0 : Math.min(1, Math.hypot(x, y) * 1.15);
    GHOSTS.forEach((ghost, index) => {
      ghosts.current[index]?.x(ghost.x * scatter * 22);
      ghosts.current[index]?.y(ghost.y * scatter * 22);
    });
  }

  function track(event: React.PointerEvent<HTMLElement>) {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    settle(x, y);
    const now = performance.now();
    const previous = lastPointer.current;
    const dt = Math.max(16, now - previous.t);
    const velocity = previous.t === 0 ? 0 : (event.clientX - previous.x) / dt;
    lastPointer.current = { x: event.clientX, y: event.clientY, t: now };
    const handle = figureRef.current?.querySelector(".sable-handle");
    if (!handle || Math.abs(velocity) < 0.85) return;
    gsap.to(handle, {
      rotation: gsap.utils.clamp(-14, 14, velocity * 9),
      duration: 0.16,
      ease: "power3.out",
      transformOrigin: "50% 100%",
      overwrite: "auto",
      onComplete: () => {
        gsap.to(handle, { rotation: 0, duration: 0.75, ease: "elastic.out(1, 0.45)", overwrite: "auto" });
      },
    });
  }

  function squish(pressed: boolean) {
    const el = squishRef.current;
    if (!el || reduced) return;
    gsap.to(el, {
      scaleX: pressed ? 1.12 : 1,
      scaleY: pressed ? 0.88 : 1,
      duration: pressed ? 0.12 : 0.46,
      ease: pressed ? "power3.out" : "elastic.out(1, 0.45)",
      transformOrigin: "50% 70%",
      force3D: true,
      overwrite: "auto",
    });
  }

  function pullTogether() {
    settle(0, 0);
    if (!bellNoted.current) {
      bellNoted.current = true;
      play("bell");
    }
  }

  function startHold(event: React.PointerEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) {
    if ("button" in event && event.button !== 0) return;
    if (holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    squish(true);
    play("rustle");
    holdTimer.current = window.setInterval(() => {
      setRoll((value) => value + (reduced ? 0 : 10));
    }, 50);
  }

  function endHold() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
    play("press");
    squish(false);
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
        <div className="figure" ref={figureRef}>
          <div className="ghosts" aria-hidden="true">
            {GHOSTS.map((ghost) => (
              <div key={ghost.ink} className="ghost">
                <Sable ink={ghost.ink} platesOnly />
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
            <span className="sable-squish" ref={squishRef}>
              <Sable roll={roll} />
            </span>
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
