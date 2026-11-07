import { z } from "zod";

export const KEYS = {
  theme: "night-press-theme",
  muted: "night-press-muted",
  edition: "night-press-edition",
  session: "night-press-session",
  commissions: "night-press-commissions",
  registered: "night-press-registered",
  proofs: "night-press-proofs",
  kept: "night-press-kept",
  caption: "night-press-caption",
  egg: "night-press-egg",
} as const;

const storedSheet = z.object({
  id: z.string().min(1),
  to: z.string(),
  line: z.string(),
  createdAt: z.number(),
});

export type StoredSheet = z.infer<typeof storedSheet>;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Private mode can refuse storage. The visit still works. */
  }
}

export function readSheets(): StoredSheet[] {
  const raw = read(KEYS.commissions);
  if (!raw) return [];
  try {
    const parsed = z.array(storedSheet).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function writeSheets(sheets: StoredSheet[]) {
  write(KEYS.commissions, JSON.stringify(sheets));
}

export function readProofs(): Record<string, number> {
  const raw = read(KEYS.proofs);
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return {};
    const proofs: Record<string, number> = {};
    for (const [key, count] of Object.entries(value)) {
      if (typeof count === "number" && Number.isFinite(count)) proofs[key] = count;
    }
    return proofs;
  } catch {
    return {};
  }
}

export function writeProofs(proofs: Record<string, number>) {
  write(KEYS.proofs, JSON.stringify(proofs));
}

export function readKept(): string[] {
  const raw = read(KEYS.kept);
  if (!raw) return [];
  try {
    const parsed = z.array(z.string()).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function writeKept(ids: string[]) {
  write(KEYS.kept, JSON.stringify(ids));
}

export function readFlag(key: string): boolean {
  return read(key) === "1";
}

export function writeFlag(key: string, on: boolean) {
  write(key, on ? "1" : "0");
}

export function readCaption(): string {
  return read(KEYS.caption) ?? "";
}

export function writeCaption(caption: string) {
  write(KEYS.caption, caption);
}

export function nextEdition(): { edition: number; returning: boolean } {
  try {
    const seen = sessionStorage.getItem(KEYS.session) === "1";
    const current = Number(localStorage.getItem(KEYS.edition) ?? "0");
    const edition = Number.isFinite(current) && current > 0 ? current : 0;
    if (seen) return { edition: Math.max(edition, 1), returning: edition > 1 };
    const next = edition + 1;
    sessionStorage.setItem(KEYS.session, "1");
    localStorage.setItem(KEYS.edition, String(next));
    return { edition: next, returning: next > 1 };
  } catch {
    return { edition: 1, returning: false };
  }
}
