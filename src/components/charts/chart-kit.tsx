"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

/**
 * Shared Recharts tooltip. Recharts passes `active`, `label` and `payload`;
 * `formatter` turns each raw value into display text.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  className,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string | number) => string;
  className?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "min-w-36 rounded-xl border border-border bg-surface/95 p-3 shadow-lift backdrop-blur-xl",
        className,
      )}
    >
      {label !== undefined && (
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-subtle">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[12px]">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="flex-1 text-muted">{entry.name}</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {formatter
                ? formatter(Number(entry.value), String(entry.name ?? ""))
                : String(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; value?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: item.color }}
          />
          <span className="text-[11.5px] text-muted">{item.label}</span>
          {item.value && (
            <span className="font-mono text-[11.5px] tabular-nums text-foreground">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Fixed-height wrapper so charts never collapse before Recharts measures. */
export function ChartFrame({
  height = 260,
  children,
  className,
}: {
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full min-w-0 overflow-hidden", className)}
      style={{ height }}
    >
      {children}
    </div>
  );
}

/** Tiny inline trend line — no axes, no interaction. */
export function Sparkline({
  data,
  width = 84,
  height = 28,
  tone = "var(--primary)",
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: string;
  className?: string;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const rising = data[data.length - 1] >= data[0];
  const stroke = tone === "auto" ? (rising ? "var(--success)" : "var(--danger)") : tone;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <polyline
        points={points.join(" ")}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2"
        fill={stroke}
      />
    </svg>
  );
}

export const chartColors = [
  "var(--color-brand-500)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-brand-300)",
];

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11 },
} as const;
