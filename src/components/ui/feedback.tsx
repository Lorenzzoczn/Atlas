"use client";

import { LoaderCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { Button } from "./button";

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("size-4 animate-spin text-primary", className)} />;
}

export function LoadingState({
  label = "Carregando dados…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className,
      )}
    >
      <div className="relative grid size-11 place-items-center">
        <span className="absolute inset-0 rounded-full border border-primary/25" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-[13px] text-muted">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick?: () => void };
  className?: string;
}) {
  return (
    <Reveal
      y={10}
      duration={0.4}
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative mb-4 grid size-14 place-items-center rounded-2xl border border-border bg-surface-2">
        <div className="absolute inset-0 rounded-2xl bg-primary/8 blur-lg" />
        <Icon className="relative size-6 text-primary" />
      </div>
      <h3 className="font-display text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
        {description}
      </p>
      {action && (
        <Button size="sm" variant="secondary" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Reveal>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  description = "Tente novamente em alguns instantes.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 grid size-12 place-items-center rounded-2xl border border-danger/25 bg-danger/10">
        <span className="text-lg text-danger">!</span>
      </div>
      <h3 className="font-display text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-[13px] text-muted">{description}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" className="mt-5" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/** Section heading used above cards and tables. */
export function SectionTitle({
  title,
  description,
  action,
  icon: Icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-primary" />}
          <h2 className="font-display text-[17px] font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        {description && (
          <p className="mt-1 text-[13px] text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
