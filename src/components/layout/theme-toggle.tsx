"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsClient } from "@/hooks/use-is-client";
import { Hint } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // The resolved theme is unknown during SSR — render a stable placeholder
  // until the client knows which icon belongs there.
  const mounted = useIsClient();

  const isDark = resolvedTheme !== "light";

  return (
    <Hint label={isDark ? "Tema claro" : "Tema escuro"}>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative grid size-9 place-items-center overflow-hidden rounded-lg border border-border bg-surface-2/50 text-muted transition-colors hover:border-border-strong hover:text-foreground"
        aria-label="Alternar tema"
      >
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "moon" : "sun"}
              initial={{ y: 14, opacity: 0, rotate: -30 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -14, opacity: 0, rotate: 30 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute grid place-items-center"
            >
              {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </motion.span>
          </AnimatePresence>
        ) : (
          <Moon className="size-4 opacity-0" />
        )}
      </button>
    </Hint>
  );
}
