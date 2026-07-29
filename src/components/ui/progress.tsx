import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "from-brand-500 to-accent",
  accent: "from-accent to-brand-400",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  danger: "from-danger to-danger/70",
} as const;

const HEIGHTS = { xs: "h-1", sm: "h-1.5", md: "h-2" } as const;

export function Progress({
  value,
  max = 100,
  className,
  tone = "brand",
  size = "md",
  animated = true,
}: {
  value: number;
  max?: number;
  className?: string;
  tone?: keyof typeof TONES;
  size?: keyof typeof HEIGHTS;
  animated?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface-3",
        HEIGHTS[size],
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Width is inline so the bar is already correct without JS; the wipe is
          a CSS animation layered on top. */}
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r",
          TONES[tone],
          animated && "wipe-x",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Circular gauge used for scores and goal completion. */
export function RadialProgress({
  value,
  size = 120,
  stroke = 9,
  tone = "var(--primary)",
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  label?: string;
  sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);

  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="dash-in"
          style={{ "--dash-from": circumference } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-semibold tracking-tight">
            {label ?? Math.round(value)}
          </div>
          {sublabel && <div className="mt-0.5 text-[11px] text-subtle">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
