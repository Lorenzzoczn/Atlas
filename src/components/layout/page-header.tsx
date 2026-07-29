import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  meta,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      y={-6}
      duration={0.4}
      className={cn(
        "flex flex-col gap-4 pb-6 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-2">
              <Icon className="size-[18px] text-primary" />
            </span>
          )}
          <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.03em] md:text-[30px]">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
            {description}
          </p>
        )}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </Reveal>
  );
}
