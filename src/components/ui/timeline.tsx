import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "@/components/ui/reveal";

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: LucideIcon;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
}

const toneRing: Record<string, string> = {
  brand: "border-primary/40 bg-primary/12 text-primary",
  success: "border-success/40 bg-success/12 text-success",
  warning: "border-warning/40 bg-warning/12 text-warning",
  danger: "border-danger/40 bg-danger/12 text-danger",
  neutral: "border-border bg-surface-3 text-muted",
};

export function Timeline({
  entries,
  className,
}: {
  entries: TimelineEntry[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {entries.map((entry, index) => {
        const Icon = entry.icon;
        const last = index === entries.length - 1;
        return (
          <Reveal
            as="li"
            key={entry.id}
            x={-8}
            y={0}
            duration={0.4}
            delay={stagger(index, 0.06)}
            className="relative flex gap-3.5 pb-5 last:pb-0"
          >
            {!last && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-border to-transparent"
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border",
                toneRing[entry.tone ?? "neutral"],
              )}
            >
              {Icon ? <Icon className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[13px] leading-snug text-foreground">{entry.title}</p>
              {entry.description && (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">
                  {entry.description}
                </p>
              )}
              {entry.meta && (
                <p className="mt-1 text-[11px] text-subtle">{entry.meta}</p>
              )}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
