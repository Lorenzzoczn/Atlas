"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Money } from "@/components/ui/money";
import type { RegionSales } from "@/types";
import { number } from "@/utils/format";

/**
 * Tile-grid cartogram of Brazil: every state is an equal-sized tile placed on a
 * grid that mirrors the country's real layout. Equal areas make the colour
 * encoding readable in a way a true choropleth cannot at this size.
 */
const GRID: Record<string, [col: number, row: number]> = {
  AM: [1, 2],
  PA: [3, 2],
  CE: [5, 1],
  RN: [6, 1],
  PE: [6, 2],
  BA: [5, 3],
  MT: [2, 3],
  GO: [3, 4],
  DF: [4, 3],
  MG: [4, 4],
  ES: [5, 4],
  RJ: [4, 5],
  SP: [3, 5],
  PR: [2, 5],
  SC: [2, 6],
  RS: [1, 6],
};

const COLS = 7;
const ROWS = 7;

export function BrazilTileMap({
  data,
  className,
}: {
  data: RegionSales[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<RegionSales | null>(null);
  const max = Math.max(...data.map((d) => d.revenue));
  const byState = new Map(data.map((d) => [d.state, d]));
  const active = hovered ?? data[0];

  return (
    <div className={cn("surface-card rounded-card p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight">
            Vendas por estado
          </h3>
          <p className="mt-1 text-[12.5px] text-muted">
            Distribuição geográfica da receita
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="mx-auto grid w-full max-w-[260px] shrink-0 gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
          onMouseLeave={() => setHovered(null)}
        >
          {Object.entries(GRID).map(([state, [col, row]], index) => {
            const entry = byState.get(state);
            const intensity = entry ? entry.revenue / max : 0;
            const isActive = hovered?.state === state;

            return (
              <button
                key={state}
                type="button"
                onMouseEnter={() => entry && setHovered(entry)}
                onFocus={() => entry && setHovered(entry)}
                style={
                  {
                    gridColumn: col + 1,
                    gridRow: row,
                    "--reveal-y": "0px",
                    "--reveal-duration": "0.35s",
                    "--reveal-delay": `${index * 0.025}s`,
                    background: `color-mix(in oklab, var(--primary) ${Math.round(14 + intensity * 78)}%, var(--surface-2))`,
                  } as CSSProperties
                }
                className={cn(
                  "reveal grid aspect-square place-items-center rounded-md text-[9.5px] font-semibold transition-all duration-200",
                  intensity > 0.45 ? "text-white" : "text-muted",
                  isActive && "scale-110 ring-2 ring-primary ring-offset-1 ring-offset-background",
                )}
                aria-label={`${entry?.name ?? state}: ${entry?.orders ?? 0} pedidos`}
              >
                {state}
              </button>
            );
          })}
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-surface-2/50 p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">
              {hovered ? "Estado selecionado" : "Maior volume"}
            </p>
            <p className="mt-1 font-display text-[17px] font-semibold tracking-tight">
              {active.name}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10.5px] text-subtle">Receita</p>
                <p className="font-mono text-[14px] font-medium tabular-nums">
                  <Money value={active.revenue} compact />
                </p>
              </div>
              <div>
                <p className="text-[10.5px] text-subtle">Pedidos</p>
                <p className="font-mono text-[14px] font-medium tabular-nums">
                  {number(active.orders)}
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-3 space-y-1.5">
            {data.slice(0, 4).map((entry) => (
              <li key={entry.state} className="flex items-center gap-2.5 text-[12px]">
                <span className="w-6 font-mono font-semibold text-subtle">
                  {entry.state}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-accent"
                    style={{ width: `${(entry.revenue / max) * 100}%` }}
                  />
                </span>
                <span className="w-14 text-right font-mono tabular-nums text-muted">
                  <Money value={entry.revenue} compact />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
