"use client";

/**
 * Simulated session flag, kept outside React so `useSyncExternalStore` can read
 * it without an effect. Replaced by a real token/cookie once the backend lands.
 */

const STORAGE_KEY = "atlas.session";

const listeners = new Set<() => void>();

let snapshot = false;
let loaded = false;

export function getSession(): boolean {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      snapshot = window.localStorage.getItem(STORAGE_KEY) === "ativa";
    } catch {
      snapshot = false;
    }
  }
  return snapshot;
}

export function getServerSession(): boolean {
  return false;
}

export function subscribeToSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSession(active: boolean) {
  snapshot = active;
  loaded = true;
  try {
    if (active) window.localStorage.setItem(STORAGE_KEY, "ativa");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures — the in-memory flag still drives the UI.
  }
  for (const listener of listeners) listener();
}
