"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SHOP_SHEETS } from "@/data/press";
import { createPressAudio, type PressAudio, type SoundName } from "@/lib/audio";
import {
  KEYS,
  nextEdition,
  readCaption,
  readFlag,
  readKept,
  readProofs,
  readSheets,
  writeCaption,
  writeFlag,
  writeKept,
  writeProofs,
  writeSheets,
  type StoredSheet,
} from "@/lib/storage";

export type Sheet = StoredSheet & { mine: boolean };

type Snapshot = {
  ready: boolean;
  theme: "day" | "night";
  muted: boolean;
  edition: number;
  returning: boolean;
  mine: StoredSheet[];
  registered: boolean;
  proofs: Record<string, number>;
  kept: string[];
  caption: string;
  egg: boolean;
};

const serverSnapshot: Snapshot = {
  ready: false,
  theme: "day",
  muted: false,
  edition: 0,
  returning: false,
  mine: [],
  registered: false,
  proofs: {},
  kept: [],
  caption: "",
  egg: false,
};

let snapshot: Snapshot = serverSnapshot;
const listeners = new Set<() => void>();

function emit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function patch(partial: Partial<Snapshot>) {
  emit({ ...snapshot, ...partial });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hydrateSnapshot() {
  if (snapshot.ready) return;
  const visit = nextEdition();
  emit({
    ready: true,
    theme: document.documentElement.dataset.theme === "night" ? "night" : "day",
    muted: document.documentElement.dataset.muted === "muted",
    edition: visit.edition,
    returning: visit.returning,
    mine: readSheets(),
    registered: readFlag(KEYS.registered),
    proofs: readProofs(),
    kept: readKept(),
    caption: readCaption(),
    egg: readFlag(KEYS.egg),
  });
}

type PressContextValue = {
  ready: boolean;
  theme: "day" | "night";
  toggleTheme: () => void;
  muted: boolean;
  toggleMuted: () => void;
  edition: number;
  returning: boolean;
  play: (name: SoundName, force?: number) => void;
  sheets: Sheet[];
  addSheet: (to: string, line: string) => void;
  removeSheet: (id: string) => StoredSheet | null;
  restoreSheet: (sheet: StoredSheet) => void;
  registered: boolean;
  setRegistered: (value: boolean) => void;
  proofs: Record<string, number>;
  pullProof: (id: string) => void;
  kept: string[];
  toggleKept: (id: string) => void;
  caption: string;
  lockCaption: (value: string) => void;
  egg: boolean;
  eggOpen: boolean;
  findEgg: () => void;
  openEgg: () => void;
  closeEgg: () => void;
};

const PressContext = createContext<PressContextValue | null>(null);

export function PressProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<PressAudio | null>(null);
  const stored = useSyncExternalStore(subscribe, () => snapshot, () => serverSnapshot);
  const [eggOpen, setEggOpen] = useState(false);

  useEffect(() => {
    const audio = createPressAudio();
    audioRef.current = audio;
    hydrateSnapshot();
    audio.setMuted(snapshot.muted);
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      audio.dispose();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback((name: SoundName, force?: number) => {
    audioRef.current?.play(name, force);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = snapshot.theme === "night" ? "day" : "night";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEYS.theme, next);
    patch({ theme: next });
    audioRef.current?.play("clack");
  }, []);

  const toggleMuted = useCallback(() => {
    const next = !snapshot.muted;
    document.documentElement.dataset.muted = next ? "muted" : "on";
    localStorage.setItem(KEYS.muted, next ? "1" : "0");
    audioRef.current?.setMuted(next);
    patch({ muted: next });
    if (!next) audioRef.current?.play("bell");
  }, []);

  const addSheet = useCallback((to: string, line: string) => {
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const sheet: StoredSheet = { id, to, line, createdAt: Date.now() };
    const mine = [sheet, ...snapshot.mine];
    writeSheets(mine);
    patch({ mine });
  }, []);

  const removeSheet = useCallback((id: string) => {
    const removed = snapshot.mine.find((sheet) => sheet.id === id) ?? null;
    const mine = snapshot.mine.filter((sheet) => sheet.id !== id);
    writeSheets(mine);
    patch({ mine });
    return removed;
  }, []);

  const restoreSheet = useCallback((sheet: StoredSheet) => {
    if (snapshot.mine.some((item) => item.id === sheet.id)) return;
    const mine = [sheet, ...snapshot.mine].sort((a, b) => b.createdAt - a.createdAt);
    writeSheets(mine);
    patch({ mine });
  }, []);

  const setRegistered = useCallback((value: boolean) => {
    writeFlag(KEYS.registered, value);
    patch({ registered: value });
  }, []);

  const pullProof = useCallback((id: string) => {
    const proofs = { ...snapshot.proofs, [id]: (snapshot.proofs[id] ?? 0) + 1 };
    writeProofs(proofs);
    patch({ proofs });
  }, []);

  const toggleKept = useCallback((id: string) => {
    const kept = snapshot.kept.includes(id) ? snapshot.kept.filter((item) => item !== id) : [...snapshot.kept, id];
    writeKept(kept);
    patch({ kept });
  }, []);

  const lockCaption = useCallback((value: string) => {
    writeCaption(value);
    patch({ caption: value });
  }, []);

  const findEgg = useCallback(() => {
    writeFlag(KEYS.egg, true);
    patch({ egg: true });
    setEggOpen(true);
  }, []);

  const openEgg = useCallback(() => setEggOpen(true), []);
  const closeEgg = useCallback(() => setEggOpen(false), []);

  const sheets = useMemo<Sheet[]>(
    () => [
      ...stored.mine.map((sheet) => ({ ...sheet, mine: true as const })),
      ...SHOP_SHEETS.map((sheet) => ({ ...sheet, createdAt: 0, mine: false as const })),
    ],
    [stored.mine],
  );

  const value = useMemo<PressContextValue>(
    () => ({
      ready: stored.ready,
      theme: stored.theme,
      toggleTheme,
      muted: stored.muted,
      toggleMuted,
      edition: stored.edition,
      returning: stored.returning,
      play,
      sheets,
      addSheet,
      removeSheet,
      restoreSheet,
      registered: stored.registered,
      setRegistered,
      proofs: stored.proofs,
      pullProof,
      kept: stored.kept,
      toggleKept,
      caption: stored.caption,
      lockCaption,
      egg: stored.egg,
      eggOpen,
      findEgg,
      openEgg,
      closeEgg,
    }),
    [
      stored,
      toggleTheme,
      toggleMuted,
      play,
      sheets,
      addSheet,
      removeSheet,
      restoreSheet,
      setRegistered,
      pullProof,
      toggleKept,
      lockCaption,
      eggOpen,
      findEgg,
      openEgg,
      closeEgg,
    ],
  );

  return <PressContext.Provider value={value}>{children}</PressContext.Provider>;
}

export function usePress(): PressContextValue {
  const value = useContext(PressContext);
  if (!value) throw new Error("usePress must be used inside PressProvider");
  return value;
}
