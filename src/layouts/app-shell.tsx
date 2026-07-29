"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/layout/command-palette";
import { MobileSidebar, Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useUi } from "@/store/ui-store";

/** Soft brand light bleeding from the top of the viewport. */
function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/4 size-[520px] rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute -top-24 right-0 size-[420px] rounded-full bg-accent/6 blur-[120px]" />
      <div className="dot-bg absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,#000_0%,transparent_65%)]" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed } = useUi();
  const pathname = usePathname();

  return (
    <div className="relative min-h-dvh">
      <AmbientBackdrop />
      <Sidebar />
      <MobileSidebar />
      <CommandPalette />

      {/* The offset is pure CSS so the server and the client agree on first paint. */}
      <div
        className={cn(
          "min-h-dvh transition-[padding-left] duration-300 ease-out",
          sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[268px]",
        )}
      >
        <Topbar />
        {/* Keyed by route so the CSS entrance replays on every navigation. */}
        <main
          key={pathname}
          className="reveal mx-auto w-full max-w-[1680px] px-4 py-6 [--reveal-duration:0.35s] [--reveal-y:10px] md:px-6 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
