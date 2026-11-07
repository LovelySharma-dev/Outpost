"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { EDITIONS, type EditionId } from "@/data/press";

type Edition = (typeof EDITIONS)[number];
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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

function PosterCard({
  edition,
  count,
  saved,
  onBegin,
  onPull,
  onKeep,
}: {
  edition: Edition;
  count: number;
  saved: boolean;
  onBegin: () => void;
  onPull: () => void;
  onKeep: () => void;
}) {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLLIElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const cylinderRef = useRef<HTMLSpanElement>(null);
  const dentRef = useRef<HTMLSpanElement>(null);
  const tilt = useRef<{ x?: (value: number) => void; y?: (value: number) => void }>({});
  const pullTween = useRef<gsap.core.Timeline | null>(null);
  const [inking, setInking] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || reduced) return;
    const context = gsap.context(() => {
      gsap.set(card, { transformPerspective: 1000, force3D: true });
      tilt.current.x = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power3.out" });
      tilt.current.y = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power3.out" });
    }, card);
    return () => context.revert();
  }, [reduced]);

  useEffect(() => {
    return () => {
      pullTween.current?.kill();
    };
  }, []);

  function follow(event: React.PointerEvent<HTMLLIElement>) {
    if (reduced || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    tilt.current.y?.(gsap.utils.clamp(-8, 8, (px - 0.5) * 16));
    tilt.current.x?.(gsap.utils.clamp(-8, 8, (0.5 - py) * 16));
    event.currentTarget.style.setProperty("--sx", `${px * 100}%`);
    event.currentTarget.style.setProperty("--sy", `${py * 100}%`);
    event.currentTarget.classList.add("is-tilting");
  }

  function rest() {
    tilt.current.x?.(0);
    tilt.current.y?.(0);
    cardRef.current?.classList.remove("is-tilting");
  }

  function pull() {
    if (inking) return;
    setInking(true);
    onBegin();
    const finish = () => {
      onPull();
      setInking(false);
    };
    if (reduced || !veilRef.current || !cylinderRef.current || !dentRef.current) {
      finish();
      return;
    }
    const veil = veilRef.current;
    const cylinder = cylinderRef.current;
    const dent = dentRef.current;
    const travel = (veil.parentElement?.clientWidth ?? 220) + 24;
    const passes = veil.parentElement?.querySelectorAll<HTMLElement>(".ink-pass");
    pullTween.current?.kill();
    const timeline = gsap.timeline({
      onComplete: () => {
        finish();
        gsap.set([veil, cylinder, dent, ...(passes ?? [])], { clearProps: "transform,opacity,clipPath" });
      },
    });
    pullTween.current = timeline;
    timeline
      .set(veil, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" })
      .set(cylinder, { x: -36, opacity: 1, force3D: true })
      .set(dent, { x: -18, opacity: 0.9, force3D: true })
      .to(cylinder, { x: travel, duration: 0.78, ease: "power2.inOut" }, 0)
      .to(dent, { x: travel, duration: 0.78, ease: "power2.inOut" }, 0)
      .to(veil, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.78, ease: "power2.inOut" }, 0);
    passes?.forEach((pass, index) => {
      timeline
        .set(pass, { opacity: 0.82, clipPath: "inset(0% 0% 0% 100%)" }, 0)
        .to(pass, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power2.inOut" }, index * 0.08);
    });
    timeline.to([cylinder, dent, veil, ...(passes ?? [])], { opacity: 0, duration: 0.18 }, 0.64);
  }

  return (
    <li
      ref={cardRef}
      className="sheet poster"
      onPointerMove={follow}
      onPointerLeave={rest}
    >
      <CropMarks />
      <span className="poster-sheen" aria-hidden="true" />
      <p className="eyebrow">{edition.code}</p>
      <div className="poster-art">
        <PosterArt id={edition.id} />
        <span className="ink-pass ink-c" aria-hidden="true" />
        <span className="ink-pass ink-m" aria-hidden="true" />
        <span className="ink-pass ink-y" aria-hidden="true" />
        <span className="ink-pass ink-k" aria-hidden="true" />
        <div className="proof-veil" ref={veilRef} aria-hidden="true" />
        <span className="proof-dent" ref={dentRef} aria-hidden="true" />
        <span className="proof-cylinder" ref={cylinderRef} aria-hidden="true" />
        {count > 0 ? <span className="stamp">Proof {String(count).padStart(2, "0")}</span> : null}
      </div>
      <h3>{edition.title}</h3>
      <p>{edition.note}</p>
      <div className="actions">
        <button type="button" className="button" onClick={pull} disabled={inking}>
          {inking ? "Inking…" : "Pull a proof"}
        </button>
        <button type="button" className="button button-quiet" aria-pressed={saved} onClick={onKeep}>
          {saved ? "Kept on the wall" : "Keep this sheet"}
        </button>
      </div>
    </li>
  );
}

export function EditionWall() {
  const { proofs, pullProof, kept, toggleKept, play } = usePress();

  return (
    <section id="editions" className="section" aria-labelledby="editions-title">
      <div className="section-intro">
        <p className="eyebrow">Project two</p>
        <h2 id="editions-title">Pocket editions</h2>
        <p>Three sheets Sable already pulled. A proof stays in this browser.</p>
      </div>
      <ul className="edition-grid">
        {EDITIONS.map((edition) => (
          <PosterCard
            key={edition.id}
            edition={edition}
            count={proofs[edition.id] ?? 0}
            saved={kept.includes(edition.id)}
            onBegin={() => play("press")}
            onPull={() => pullProof(edition.id)}
            onKeep={() => {
              toggleKept(edition.id);
              play("clack");
            }}
          />
        ))}
      </ul>
    </section>
  );
}
