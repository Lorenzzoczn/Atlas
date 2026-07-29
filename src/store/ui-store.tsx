"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { type DateRangeKey } from "@/config/ranges";
import {
  getPreferences,
  getServerPreferences,
  setPreferences,
  subscribeToPreferences,
} from "./preferences-store";

export { rangeDays, rangeLabels, type DateRangeKey } from "@/config/ranges";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  range: DateRangeKey;
  setRange: (range: DateRangeKey) => void;
  /** Hides monetary values across the app — useful for screen sharing. */
  privacyMode: boolean;
  togglePrivacy: () => void;
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
}

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  // Persisted preferences come from an external store so hydration stays clean.
  const preferences = useSyncExternalStore(
    subscribeToPreferences,
    getPreferences,
    getServerPreferences,
  );

  // Purely ephemeral UI state stays in React.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // ⌘K / Ctrl+K opens the command palette from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleSidebar = useCallback(
    () => setPreferences({ sidebarCollapsed: !getPreferences().sidebarCollapsed }),
    [],
  );

  const togglePrivacy = useCallback(
    () => setPreferences({ privacyMode: !getPreferences().privacyMode }),
    [],
  );

  const setRange = useCallback(
    (range: DateRangeKey) => setPreferences({ range }),
    [],
  );

  const setWorkspaceId = useCallback(
    (workspaceId: string) => setPreferences({ workspaceId }),
    [],
  );

  const value = useMemo<UiState>(
    () => ({
      sidebarCollapsed: preferences.sidebarCollapsed,
      toggleSidebar,
      mobileNavOpen,
      setMobileNavOpen,
      commandOpen,
      setCommandOpen,
      range: preferences.range,
      setRange,
      privacyMode: preferences.privacyMode,
      togglePrivacy,
      workspaceId: preferences.workspaceId,
      setWorkspaceId,
    }),
    [
      preferences,
      toggleSidebar,
      mobileNavOpen,
      commandOpen,
      setRange,
      togglePrivacy,
      setWorkspaceId,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) throw new Error("useUi precisa estar dentro de <UiProvider>");
  return context;
}
