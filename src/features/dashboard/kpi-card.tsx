"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/chart-kit";
import { Money } from "@/components/ui/money";
import { Reveal, stagger } from "@/components/ui/reveal";
import { Hint } from "@/components/ui/tooltip";
import { delta } from "@/utils/format";

export interface KpiCardProps {
  label: string;
  value: number;
  previous?: number;
  format?: "currency" | "number" | "percent" | "ratio";
  icon: LucideIcon;
  trend?: number[];
  hint?: string;
  /** Inverts the good/bad colouring — lower is better for costs and ACOS. */
  invert?: boolean;
  index?: number;
  footer?: string;
}

export function KpiCard({
  label,
  value,
  previous,
  format = "currency",
  icon: Icon,
  trend,
  hint,
  invert,
  index = 0,
  footer,
}: KpiCardProps) {
  const change =
    previous && previous !== 0 ? ((value - previous) / previous) * 100 : undefined;

  const positive = change === undefined ? true : invert ? change < 0 : change > 0;

  return (
    <Reveal
      delay={stagger(index, 0.06)}
      y={16}
      className="group/card surface-card relative overflow-hidden rounded-card p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover/card:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted">
            {label}
            {hint && (
              <Hint label={hint}>
                <span className="grid size-3.5 cursor-help place-items-center rounded-full border border-border text-[8px] text-subtle">
                  i
                </span>
              </Hint>
            )}
          </p>

          <p className="mt-2.5 font-display text-[26px] font-semibold leading-none tracking-[-0.03em]">
            {format === "currency" ? (
              <Money value={value} />
            ) : format === "percent" ? (
              <span className="tabular-nums">
                {value.toFixed(1).replace(".", ",")}%
              </span>
            ) : format === "ratio" ? (
              <span className="tabular-nums">
                {value.toFixed(2).replace(".", ",")}×
              </span>
            ) : (
              <span className="tabular-nums">
                {new Intl.NumberFormat("pt-BR").format(Math.round(value))}
              </span>
            )}
          </p>
        </div>

        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-2 text-subtle transition-colors duration-300 group-hover/card:border-primary/35 group-hover/card:bg-primary/10 group-hover/card:text-primary">
          <Icon className="size-4" />
        </span>
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium tabular-nums",
                positive
                  ? "border-success/25 bg-success/12 text-success"
                  : "border-danger/25 bg-danger/12 text-danger",
              )}
            >
              {change > 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {delta(change)}
            </span>
          )}
          {footer && (
            <p className="mt-1.5 truncate text-[11px] text-subtle">{footer}</p>
          )}
        </div>

        {trend && trend.length > 1 && (
          <Sparkline
            data={trend}
            tone={positive ? "var(--success)" : "var(--danger)"}
            className="shrink-0 opacity-80 transition-opacity duration-300 group-hover/card:opacity-100"
          />
        )}
      </div>
    </Reveal>
  );
}
