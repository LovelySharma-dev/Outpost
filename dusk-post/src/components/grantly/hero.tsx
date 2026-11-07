"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PERSONAS, SCHOLARSHIPS } from "@/data/scholarships";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGrantly } from "@/lib/grantly-store";
import { rankScholarshipsForProfile } from "@/lib/matching";

const FIRST_GEN = PERSONAS[0].profile;
const RING = 2 * Math.PI * 30;

export function GrantlyHero() {
  const reduced = useReducedMotion();
  const { profile, updateProfile } = useGrantly();
  const best = rankScholarshipsForProfile(SCHOLARSHIPS, profile)[0];
  const score = best?.score ?? 98;
  const reasons = (best?.reasons ?? ["GPA clears the STEM floor", "Major lines up with computing", "First-gen path is named"]).slice(0, 3);
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!hero || !stage || !card) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const floats = Array.from(stage.querySelectorAll<HTMLElement>(".g-float"));
    const cleanups: Array<() => void> = [];

    const spotlight = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--x", `${event.clientX - rect.left}px`);
      hero.style.setProperty("--y", `${event.clientY - rect.top}px`);
    };
    hero.addEventListener("pointermove", spotlight);
    cleanups.push(() => hero.removeEventListener("pointermove", spotlight));

    if (!reduced) {
      const tweens = floats.map((node) => {
        const tween = gsap.fromTo(
          node,
          { y: -8 },
          { y: 8, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 },
        );
        const pause = () => tween.pause();
        const play = () => tween.play();
        node.addEventListener("pointerenter", pause);
        node.addEventListener("pointerleave", play);
        cleanups.push(() => {
          node.removeEventListener("pointerenter", pause);
          node.removeEventListener("pointerleave", play);
          tween.kill();
        });
        return tween;
      });
      const pauseAll = () => tweens.forEach((tween) => tween.pause());
      const playAll = () => tweens.forEach((tween) => tween.play());
      card.addEventListener("pointerenter", pauseAll);
      card.addEventListener("pointerleave", playAll);
      cleanups.push(() => {
        card.removeEventListener("pointerenter", pauseAll);
        card.removeEventListener("pointerleave", playAll);
      });
    }

    if (!reduced && fine) {
      const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.45, ease: "power3.out" });
      const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.45, ease: "power3.out" });
      const tilt = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        rotateY(Math.max(-7, Math.min(7, (px - 0.5) * 14)));
        rotateX(Math.max(-7, Math.min(7, (0.5 - py) * 14)));
        card.style.setProperty("--sx", `${px * 100}%`);
        card.style.setProperty("--sy", `${py * 100}%`);
      };
      const reset = () => {
        rotateX(0);
        rotateY(0);
      };
      card.addEventListener("pointermove", tilt);
      card.addEventListener("pointerleave", reset);
      cleanups.push(() => {
        card.removeEventListener("pointermove", tilt);
        card.removeEventListener("pointerleave", reset);
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [reduced]);

  return (
    <section className="g-hero" id="top" ref={heroRef} aria-labelledby="grantly-title">
      <div className="g-hero-grid">
        <div>
          <p className="g-badge">
            <span className="g-beacon" aria-hidden="true" />
            LIVE SCHOLARSHIP RADAR • OVER $14.2M INDEXED
          </p>
          <h1 id="grantly-title">Turn Financial Friction Into Debt-Free Degrees.</h1>
          <div className="g-ctas">
            <a className="g-cta g-cta-primary" href="#match" onClick={() => updateProfile(FIRST_GEN)}>
              Launch Smart Match Engine →
            </a>
            <a className="g-cta g-cta-glass" href="#kanban">
              Explore Application Tracker (Kanban)
            </a>
          </div>
        </div>
        <div className="g-holo" ref={stageRef}>
          <div className="g-holo-stage">
            <button
              type="button"
              className="g-holo-card"
              ref={cardRef}
              onClick={() => {
                updateProfile(FIRST_GEN);
                document.getElementById("match")?.scrollIntoView({
                  behavior: reduced ? "auto" : "smooth",
                  block: "start",
                });
              }}
            >
              <span className="g-sheen" aria-hidden="true" />
              <span className="g-pill">
                <span className="g-ring">98%</span>
                <span>
                  <strong>GPA 3.85</strong>
                  <br />
                  CS / First-Gen
                  <span className="g-sr">Opens the match feed</span>
                </span>
              </span>
            </button>
          </div>
          <p className="g-orbit g-orbit-a">
            <span className="g-float">Ada Lovelace STEM: +$15,000/yr • 21d Left</span>
          </p>
          <p className="g-orbit g-orbit-b">
            <span className="g-float">Global Pathways: +$20,000 • Full Ride Eligible</span>
          </p>
          <p className="g-orbit g-orbit-c">
            <span className="g-float">Women in Tech: +$12,500 • Mentorship Included</span>
          </p>
        </div>
      </div>
      <ul className="g-metrics">
        <li>
          <strong>$14.2M+</strong>
          <span>Total Verified Aid</span>
        </li>
        <li>
          <strong>94.8%</strong>
          <span>Average Student Match Rate</span>
        </li>
        <li>
          <strong>14 Days</strong>
          <span>Average Time to First Grant Application</span>
        </li>
        <li>
          <strong>$0.00</strong>
          <span>Out-of-Pocket Student Cost</span>
        </li>
      </ul>
    </section>
  );
}
