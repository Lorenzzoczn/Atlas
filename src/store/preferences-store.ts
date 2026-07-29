"use client";

import type { DateRangeKey } from "@/config/ranges";

/**
 * Module-level store for preferences that live in localStorage.
 *
 * It is consumed through `useSyncExternalStore`, which is what makes the
 * hydration story correct: React uses the server snapshot (the defaults) while
 * hydrating, then swaps to the persisted snapshot right after. No effect writes
 * state, so there is no cascading render and no hydration mismatch.
 */

export interface Preferences {
  sidebarCollapsed: boolean;
  range: DateRangeKey;
  privacyMode: boolean;
  workspaceId: string;
}

const STORAGE_KEY = "atlas.ui";

const DEFAULTS: Preferences = {
  sidebarCollapsed: false,
  range: "30d",
  privacyMode: false,
  workspaceId: "wsp_01",
};

const listeners = new Set<() => void>();

let snapshot: Preferences = DEFAULTS;
let loaded = false;

function readStorage(): Preferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function getPreferences(): Preferences {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    snapshot = readStorage();
  }
  return snapshot;
}

export function getServerPreferences(): Preferences {
  return DEFAULTS;
}

export function subscribeToPreferences(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setPreferences(patch: Partial<Preferences>) {
  snapshot = { ...getPreferences(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable (private mode, quota) — keep the in-memory value.
  }
  for (const listener of listeners) listener();
}
