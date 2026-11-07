"use client";

import {
  useCallback,
  useEffect,
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";
import { z } from "zod";
import {
  type Scholarship,
  type StudentProfile,
  type ApplicationStage,
  SCHOLARSHIPS,
  DEFAULT_STUDENT_PROFILE,
} from "@/data/scholarships";

export interface TrackedApplication {
  scholarshipId: string;
  stage: ApplicationStage;
  notes: string;
  checklist: {
    essayCompleted: boolean;
    transcriptsUploaded: boolean;
    lettersRequested: boolean;
    financialDocsReady: boolean;
  };
  submittedDate?: string;
  updatedAt: number;
}

const STORAGE_KEYS = {
  profile: "grantly-profile",
  applications: "grantly-applications",
  muted: "grantly-muted",
};

const applicationSchema = z.object({
  scholarshipId: z.string(),
  stage: z.enum(["saved", "drafting", "documents-ready", "submitted", "awarded"]),
  notes: z.string(),
  checklist: z.object({
    essayCompleted: z.boolean(),
    transcriptsUploaded: z.boolean(),
    lettersRequested: z.boolean(),
    financialDocsReady: z.boolean(),
  }),
  submittedDate: z.string().optional(),
  updatedAt: z.number(),
});

type StoreState = {
  ready: boolean;
  muted: boolean;
  profile: StudentProfile;
  applications: Record<string, TrackedApplication>;
};

const serverState: StoreState = {
  ready: false,
  muted: false,
  profile: DEFAULT_STUDENT_PROFILE,
  applications: {},
};

let storeSnapshot: StoreState = serverState;

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getClientSnapshot(): StoreState {
  return storeSnapshot;
}

function getServerSnapshot(): StoreState {
  return serverState;
}

function readApplications(): Record<string, TrackedApplication> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.applications);
    if (!raw) return {};
    const parsed = z.record(z.string(), applicationSchema).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function hydrateGrantly() {
  if (storeSnapshot.ready) return;
  let profile = DEFAULT_STUDENT_PROFILE;
  let muted = false;
  let applications: Record<string, TrackedApplication> = {};
  try {
    muted = localStorage.getItem(STORAGE_KEYS.muted) === "1";
    const rawProfile = localStorage.getItem(STORAGE_KEYS.profile);
    if (rawProfile) {
      const value: unknown = JSON.parse(rawProfile);
      if (value && typeof value === "object") profile = { ...DEFAULT_STUDENT_PROFILE, ...(value as StudentProfile) };
    }
    applications = readApplications();
  } catch {
    profile = DEFAULT_STUDENT_PROFILE;
    applications = {};
  }
  storeSnapshot = { ready: true, muted, profile, applications };
  emitChange();
}

interface GrantlyContextType {
  ready: boolean;
  muted: boolean;
  toggleMuted: () => void;
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  applications: Record<string, TrackedApplication>;
  trackScholarship: (scholarshipId: string, stage?: ApplicationStage) => void;
  removeApplication: (scholarshipId: string) => void;
  restoreApplication: (application: TrackedApplication) => void;
  updateApplicationStage: (scholarshipId: string, stage: ApplicationStage) => void;
  toggleChecklistItem: (
    scholarshipId: string,
    key: keyof TrackedApplication["checklist"]
  ) => void;
  updateNotes: (scholarshipId: string, notes: string) => void;
  scholarships: Scholarship[];
  getScholarshipById: (id: string) => Scholarship | undefined;
  financialMetrics: {
    targetTuition: number;
    currentSavings: number;
    awardedAmount: number;
    pendingAmount: number;
    unfundedGap: number;
    coveragePercent: number;
  };
}

const GrantlyContext = createContext<GrantlyContextType | null>(null);

export function GrantlyProvider({ children }: { children: React.ReactNode }) {
  const store = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrateGrantly();
  }, []);

  const toggleMuted = useCallback(() => {
    const muted = !storeSnapshot.muted;
    storeSnapshot = { ...storeSnapshot, muted };
    try {
      localStorage.setItem(STORAGE_KEYS.muted, muted ? "1" : "0");
    } catch {
      /* Storage can be blocked. The mute control still flips for this visit. */
    }
    emitChange();
  }, []);

  const updateProfile = useCallback((updates: Partial<StudentProfile>) => {
    const next = { ...storeSnapshot.profile, ...updates };
    storeSnapshot = { ...storeSnapshot, profile: next };
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
    } catch {}
    emitChange();
  }, []);

  const trackScholarship = useCallback((scholarshipId: string, stage: ApplicationStage = "saved") => {
    if (storeSnapshot.applications[scholarshipId]) return;
    const next = {
      ...storeSnapshot.applications,
      [scholarshipId]: {
        scholarshipId,
        stage,
        notes: "",
        checklist: {
          essayCompleted: false,
          transcriptsUploaded: false,
          lettersRequested: false,
          financialDocsReady: false,
        },
        updatedAt: Date.now(),
      },
    };
    storeSnapshot = { ...storeSnapshot, applications: next };
    try {
      localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(next));
    } catch {}
    emitChange();
  }, []);

  const removeApplication = useCallback((scholarshipId: string) => {
    const next = { ...storeSnapshot.applications };
    delete next[scholarshipId];
    storeSnapshot = { ...storeSnapshot, applications: next };
    try {
      localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(next));
    } catch {}
    emitChange();
  }, []);

  const restoreApplication = useCallback((application: TrackedApplication) => {
    const next = { ...storeSnapshot.applications, [application.scholarshipId]: application };
    storeSnapshot = { ...storeSnapshot, applications: next };
    try {
      localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(next));
    } catch {
      /* The wallet still updates for this visit. */
    }
    emitChange();
  }, []);

  const updateApplicationStage = useCallback((scholarshipId: string, stage: ApplicationStage) => {
    const existing = storeSnapshot.applications[scholarshipId];
    if (!existing) return;
    const next = {
      ...storeSnapshot.applications,
      [scholarshipId]: {
        ...existing,
        stage,
        submittedDate: stage === "submitted" ? new Date().toISOString() : existing.submittedDate,
        updatedAt: Date.now(),
      },
    };
    storeSnapshot = { ...storeSnapshot, applications: next };
    try {
      localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(next));
    } catch {}
    emitChange();
  }, []);

  const toggleChecklistItem = useCallback(
    (scholarshipId: string, key: keyof TrackedApplication["checklist"]) => {
      const existing = storeSnapshot.applications[scholarshipId];
      if (!existing) return;
      const next = {
        ...storeSnapshot.applications,
        [scholarshipId]: {
          ...existing,
          checklist: {
            ...existing.checklist,
            [key]: !existing.checklist[key],
          },
          updatedAt: Date.now(),
        },
      };
      storeSnapshot = { ...storeSnapshot, applications: next };
      try {
        localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(next));
      } catch {}
      emitChange();
    },
    []
  );

  const updateNotes = useCallback((scholarshipId: string, notes: string) => {
    const existing = storeSnapshot.applications[scholarshipId];
    if (!existing) return;
    const next = {
      ...storeSnapshot.applications,
      [scholarshipId]: { ...existing, notes, updatedAt: Date.now() },
    };
    storeSnapshot = { ...storeSnapshot, applications: next };
    try {
      localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(next));
    } catch {}
    emitChange();
  }, []);

  const getScholarshipById = useCallback((id: string) => {
    return SCHOLARSHIPS.find((s) => s.id === id);
  }, []);

  // Compute live financial metrics
  const trackedList = Object.values(store.applications);
  const awardedAmount = trackedList
    .filter((a) => a.stage === "awarded")
    .reduce((sum, a) => sum + (getScholarshipById(a.scholarshipId)?.amount ?? 0), 0);

  const pendingAmount = trackedList
    .filter((a) => a.stage === "submitted" || a.stage === "documents-ready")
    .reduce((sum, a) => sum + (getScholarshipById(a.scholarshipId)?.amount ?? 0), 0);

  const totalFunded = store.profile.currentSavings + awardedAmount;
  const unfundedGap = Math.max(0, store.profile.targetTuition - totalFunded);
  const coveragePercent = Math.min(100, Math.round((totalFunded / store.profile.targetTuition) * 100));

  return (
    <GrantlyContext.Provider
      value={{
        ready: store.ready,
        muted: store.muted,
        toggleMuted,
        profile: store.profile,
        updateProfile,
        applications: store.applications,
        trackScholarship,
        removeApplication,
        restoreApplication,
        updateApplicationStage,
        toggleChecklistItem,
        updateNotes,
        scholarships: SCHOLARSHIPS,
        getScholarshipById,
        financialMetrics: {
          targetTuition: store.profile.targetTuition,
          currentSavings: store.profile.currentSavings,
          awardedAmount,
          pendingAmount,
          unfundedGap,
          coveragePercent,
        },
      }}
    >
      {children}
    </GrantlyContext.Provider>
  );
}

export function useGrantly() {
  const ctx = useContext(GrantlyContext);
  if (!ctx) throw new Error("useGrantly must be used inside GrantlyProvider");
  return ctx;
}
