"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UiProvider } from "@/store/ui-store";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <UiProvider>
            <TooltipProvider delayDuration={180}>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className:
                    "!bg-surface !border-border !text-foreground !shadow-lift !rounded-xl",
                }}
              />
            </TooltipProvider>
          </UiProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
