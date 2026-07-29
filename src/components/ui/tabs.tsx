"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { createContext, useContext, useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const LayoutIdContext = createContext("atlas-tabs");

export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  const id = useId();
  return (
    <LayoutIdContext.Provider value={id}>
      <TabsPrimitive.Root className={cn("w-full", className)} {...props} />
    </LayoutIdContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-surface-2/60 p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const layoutId = useContext(LayoutIdContext);
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "group relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-muted",
        "transition-colors duration-200 hover:text-foreground",
        "data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-lg bg-surface opacity-0 shadow-[0_1px_0_0_var(--glass-highlight)_inset,0_2px_8px_-3px_hsl(var(--shadow-color)/0.5)] group-data-[state=active]:opacity-100"
        layoutId={`${layoutId}-tab-pill`}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-5 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1",
        className,
      )}
      {...props}
    />
  );
}

/** Compact segmented control for range / view switches. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const layoutId = useId();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border bg-surface-2/60 p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-lg font-medium transition-colors duration-200",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-[13px]",
              active ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                aria-hidden
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-surface shadow-[0_1px_0_0_var(--glass-highlight)_inset,0_2px_8px_-3px_hsl(var(--shadow-color)/0.5)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 [&_svg]:size-3.5">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
