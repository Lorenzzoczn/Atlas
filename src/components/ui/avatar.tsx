"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/utils/format";

const sizes = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
  xl: "size-16 text-lg",
} as const;

export function Avatar({
  name,
  hue = 248,
  size = "md",
  className,
  src,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root> & {
  name: string;
  hue?: number;
  size?: keyof typeof sizes;
  src?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-border",
        sizes[size],
        className,
      )}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={name} className="size-full object-cover" />
      )}
      <AvatarPrimitive.Fallback
        delayMs={0}
        className="grid size-full place-items-center font-semibold text-white"
        style={{
          background: `linear-gradient(140deg, hsl(${hue} 72% 58%), hsl(${(hue + 42) % 360} 78% 46%))`,
        }}
      >
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

/** Overlapping avatar row with a "+N" overflow chip. */
export function AvatarStack({
  people,
  max = 4,
  size = "sm",
}: {
  people: { name: string; hue?: number }[];
  max?: number;
  size?: keyof typeof sizes;
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((person, index) => (
        <Avatar
          key={person.name}
          name={person.name}
          hue={person.hue ?? 210 + index * 34}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "grid place-items-center rounded-full border border-border bg-surface-3 font-semibold text-muted ring-2 ring-background",
            sizes[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
