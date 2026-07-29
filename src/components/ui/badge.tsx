import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium transition-colors [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-surface-3 text-muted border border-border",
        brand: "bg-primary/12 text-primary border border-primary/25",
        accent: "bg-accent/12 text-accent border border-accent/25",
        success: "bg-success/12 text-success border border-success/25",
        warning: "bg-warning/12 text-warning border border-warning/25",
        danger: "bg-danger/12 text-danger border border-danger/25",
        outline: "border border-border text-muted",
      },
      size: {
        sm: "h-5 rounded-md px-1.5 text-[10.5px] tracking-wide",
        md: "h-6 rounded-md px-2 text-[11.5px]",
        lg: "h-7 rounded-lg px-2.5 text-xs",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

/** Status dot + label, used in tables and lists. */
export function StatusDot({
  tone = "neutral",
  pulse,
  className,
}: {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "accent";
  pulse?: boolean;
  className?: string;
}) {
  const colors: Record<string, string> = {
    neutral: "bg-subtle",
    brand: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <span className={cn("relative flex size-2 shrink-0", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex size-full rounded-full opacity-70",
            colors[tone],
          )}
          style={{ animation: "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite" }}
        />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", colors[tone])} />
    </span>
  );
}

export { badgeVariants };
