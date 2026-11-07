"use client";

import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV } from "@/data/press";
import { usePress } from "@/components/press-provider";

export function TopSlug() {
  const { ready, edition, returning, toggleTheme, toggleMuted, muted } = usePress();
  const [current, setCurrent] = useState("#table");

  useEffect(() => {
    const nodes = NAV.map((item) => document.querySelector(item.href)).filter(
      (node): node is Element => node instanceof Element,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(`#${visible.target.id}`);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (event.key.toLowerCase() === "m") toggleMuted();
      if (event.key.toLowerCase() === "n") toggleTheme();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMuted, toggleTheme]);

  return (
    <header className="slug">
      <a className="wordmark" href="#table">
        <span className="mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        Night Press
      </a>
      <nav aria-label="Press sections">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} aria-current={current === item.href ? "true" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="slug-tools">
        <p className="edition">
          Sheet{" "}
          <span aria-live="polite">{ready ? String(edition).padStart(3, "0") : "—"}</span>
          {ready && returning ? <span className="back"> Back on the sill</span> : null}
        </p>
        <button type="button" className="icon-button" onClick={toggleTheme} aria-label="Switch between the proofing table and the night press">
          <Sun aria-hidden className="icon-day" size={18} />
          <Moon aria-hidden className="icon-night" size={18} />
          <span className="slug-word icon-day">Day</span>
          <span className="slug-word icon-night">Night</span>
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={toggleMuted}
          aria-pressed={muted}
          aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Mute sound"}
        >
          <Volume2 aria-hidden className="icon-on" size={18} />
          <VolumeX aria-hidden className="icon-off" size={18} />
          <span className="slug-word icon-on">Sound</span>
          <span className="slug-word icon-off">Muted</span>
        </button>
      </div>
    </header>
  );
}
