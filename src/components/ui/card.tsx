"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Reveal, stagger } from "./reveal";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lifts the card and reveals a soft brand glow on hover. */
  interactive?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, glow, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "surface-card relative rounded-card",
        interactive &&
          "group/card transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lift",
        className,
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-card opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        >
          <div className="absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-primary/22 blur-3xl" />
        </div>
      )}
      {children}
    </div>
  ),
);
Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4 p-5 pb-0", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-[15px] font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-[13px] leading-relaxed text-muted", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-border px-5 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

/** Card that fades and lifts into place, staggered by `index`. */
export function RevealCard({
  index = 0,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { index?: number }) {
  return (
    <Reveal
      delay={stagger(index, 0.05, 0.4)}
      y={14}
      duration={0.45}
      className={cn("surface-card rounded-card", className)}
      {...props}
    >
      {children}
    </Reveal>
  );
}
