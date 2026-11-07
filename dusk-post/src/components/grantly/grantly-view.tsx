"use client";

import { useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
        <a className="g-mark" href="#top">
          Grantly
        </a>
        <nav className="g-nav" aria-label="Grantly sections">
          <a href="#match">Match</a>
          <a href="#kanban">Kanban</a>
          <a href="#gap">Gap</a>
          <a href="#deadlines">Deadlines</a>
          <a href="#essay">Essay</a>
          <a href="#colophon">Colophon</a>
        </nav>
        <div className="g-modes" role="radiogroup" aria-label="Atmosphere" aria-keyshortcuts="N">
          {MODES.map((item) => (
            <button key={item} type="button" role="radio" aria-checked={mode === item} onClick={() => setMode(item)}>
              {MODE_LABEL[item]}
            </button>
          ))}
        </div>
        <button type="button" className="g-mute" aria-pressed={muted} onClick={() => toggleMuted()}>
          {muted ? <VolumeX aria-hidden size={18} /> : <Volume2 aria-hidden size={18} />}
          {muted ? "Muted" : "Sound"}
        </button>
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
