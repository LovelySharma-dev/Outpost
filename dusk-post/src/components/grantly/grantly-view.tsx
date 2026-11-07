"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Sunset, Volume2, VolumeX } from "lucide-react";
import { createPressAudio } from "@/lib/audio";
import { useGrantly } from "@/lib/grantly-store";
import { MODES, cycleMode, setMode, useGrantlyMode } from "@/lib/mode";
import { VerificationColophon } from "./colophon";
import { DeadlineHorizon } from "./deadline-horizon";
import { EssayWorkshop } from "./essay-workshop";
import { GapSimulator } from "./gap-simulator";
import { GrantlyHero } from "./hero";
import { KanbanBoard } from "./kanban-board";
import { MatchFeed } from "./match-feed";
import "./grantly.css";

const MODE_LABEL = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
} as const;

const MODE_ICON = {
  morning: Sun,
  afternoon: Sunset,
  night: Moon,
} as const;

const SECTIONS = [
  { id: "match", label: "Match" },
  { id: "kanban", label: "Kanban" },
  { id: "gap", label: "Gap" },
  { id: "deadlines", label: "Deadlines" },
  { id: "essay", label: "Essay" },
  { id: "colophon", label: "Colophon" },
] as const;

function typingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")
  );
}

export function GrantlyView() {
  const mode = useGrantlyMode();
  const { muted, toggleMuted } = useGrantly();
  const audio = useRef<ReturnType<typeof createPressAudio> | null>(null);
  const seen = useRef(new Map<string, number>());
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const engine = createPressAudio();
    audio.current = engine;
    return () => {
      engine.dispose();
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    audio.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    const nodes = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => node !== null,
    );
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.current.set(entry.target.id, entry.intersectionRatio);
          else seen.current.delete(entry.target.id);
        }
        let next: string | null = null;
        let score = -1;
        for (const [id, ratio] of seen.current) {
          if (ratio >= score) {
            score = ratio;
            next = id;
          }
        }
        setCurrent(next);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.2, 0.5] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || typingTarget(event.target)) return;
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        cycleMode();
      } else if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        toggleMuted();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleMuted]);

  return (
    <div className="g-shell">
      <header className="g-header">
        <div className="g-topbar">
          <a className="g-mark" href="#top">
            <span className="g-monogram" aria-hidden>
              G
            </span>
            Grantly
          </a>
          <nav className="g-nav" aria-label="Grantly sections">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={current === section.id ? "location" : undefined}
                onClick={() => setCurrent(section.id)}
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="g-tools">
            <div className="g-modes" role="radiogroup" aria-label="Atmosphere" aria-keyshortcuts="N">
              {MODES.map((item) => {
                const Icon = MODE_ICON[item];
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={mode === item}
                    aria-label={MODE_LABEL[item]}
                    onClick={() => setMode(item)}
                  >
                    <Icon aria-hidden size={15} />
                    <span>{MODE_LABEL[item]}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" className="g-mute" aria-pressed={muted} onClick={() => toggleMuted()}>
              {muted ? <VolumeX aria-hidden size={16} /> : <Volume2 aria-hidden size={16} />}
              <span>{muted ? "Muted" : "Sound"}</span>
            </button>
          </div>
        </div>
        <p className="g-sr" aria-live="polite">
          Atmosphere {MODE_LABEL[mode]}
        </p>
      </header>
      <main className="g-main" id="content">
        <GrantlyHero />
        <MatchFeed />
        <KanbanBoard
          onStageSound={(name) => {
            audio.current?.play(name, name === "bell" ? 0.7 : 0.45);
          }}
        />
        <GapSimulator />
        <DeadlineHorizon />
        <EssayWorkshop />
        <VerificationColophon />
        <p className="g-foot">
          Grantly keeps the catalog in the page and the board in this browser. Applications are not filed with funders from here.
        </p>
      </main>
    </div>
  );
}
