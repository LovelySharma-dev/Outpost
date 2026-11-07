"use client";

import { useSyncExternalStore } from "react";

export type GrantlyMode = "morning" | "afternoon" | "night";

export const MODE_KEY = "grantly-mode";

export const MODES: GrantlyMode[] = ["morning", "afternoon", "night"];

const listeners = new Set<() => void>();

let snapshot: GrantlyMode = "night";
let loaded = false;

function emit() {
  for (const listener of listeners) listener();
}

export function readMode(): GrantlyMode {
  const value = document.documentElement.dataset.mode;
  if (value === "morning" || value === "afternoon" || value === "night") return value;
  return "night";
}

function ensure() {
  if (loaded || typeof document === "undefined") return;
  snapshot = readMode();
  loaded = true;
}

export function subscribeMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getModeSnapshot() {
  ensure();
  return snapshot;
}

export function getModeServerSnapshot(): GrantlyMode {
  return "night";
}

export function setMode(mode: GrantlyMode) {
  snapshot = mode;
  loaded = true;
  document.documentElement.dataset.mode = mode;
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* The atmosphere still changes for this visit. */
  }
  emit();
}

export function cycleMode() {
  ensure();
  const index = MODES.indexOf(snapshot);
  setMode(MODES[(index + 1) % MODES.length]);
}

export function useGrantlyMode() {
  return useSyncExternalStore(subscribeMode, getModeSnapshot, getModeServerSnapshot);
}
