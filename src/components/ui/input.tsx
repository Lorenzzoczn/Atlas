"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import {
  forwardRef,
  type ComponentProps,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full bg-surface-2/70 text-sm text-foreground placeholder:text-subtle",
  "border border-border rounded-xl",
  "transition-[border-color,box-shadow,background] duration-200",
  "hover:border-border-strong",
  "focus:outline-none focus:border-primary/70 focus:bg-surface-2",
  "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  suffix?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, suffix, invalid, ...props }, ref) => {
    if (!icon && !suffix) {
      return (
        <input
          ref={ref}
          className={cn(
            fieldBase,
            "h-10 px-3.5",
            invalid && "border-danger/60 focus:border-danger",
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle [&_svg]:size-4">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            fieldBase,
            "h-10",
            icon ? "pl-10" : "pl-3.5",
            suffix ? "pr-10" : "pr-3.5",
            invalid && "border-danger/60 focus:border-danger",
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle [&_svg]:size-4">
            {suffix}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-24 resize-none px-3.5 py-3 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-[13px] font-medium text-foreground/90 select-none",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
