"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * `false` during SSR and the hydration pass, `true` afterwards.
 *
 * Preferred over the `useState` + `useEffect` "mounted" pattern: it produces
 * the same result without writing state from an effect.
 */
export function useIsClient() {
  return useSyncExternalStore(noop, clientSnapshot, serverSnapshot);
}
