"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PASSES } from "@/data/press";

export function Passes() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray<HTMLElement>("[data-pass]").forEach((pass) => {
        gsap.from(pass, {
          y: 14,
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
          immediateRender: false,
          scrollTrigger: { trigger: pass, start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  useEffect(() => {
    const nodes = root.current?.querySelectorAll<HTMLElement>("[data-pass]");
    if (!nodes) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isFinite(index)) setActive(index);
        });
      },
      { rootMargin: "-40% 0px -45% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="passes" className="section" ref={root} aria-labelledby="passes-title">
      <div className="section-intro">
        <p className="eyebrow">Four passes</p>
        <h2 id="passes-title">How a mistake learned a trade</h2>
        <p id="pass-progress">
          Pass {active + 1} of {PASSES.length}. {PASSES[active]?.title}
        </p>
        <div className="meter" aria-hidden="true">
          {PASSES.map((pass, index) => (
            <span key={pass.id} className={index <= active ? "is-on" : undefined} style={{ background: pass.color }} />
          ))}
        </div>
      </div>
      <ol className="pass-list">
        {PASSES.map((pass) => (
          <li key={pass.id} data-pass data-index={pass.index}>
            <p className="eyebrow" style={{ color: pass.color }}>
              {pass.ink}
            </p>
            <h3>{pass.title}</h3>
            <p>{pass.body}</p>
          </li>
        ))}
      </ol>
      <p className="chapter-cta">
        <a className="button" href="#plates">
          The plates are on the bed
        </a>
      </p>
    </section>
  );
}
