import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to a `div`. */
  as?: ElementType;
  /** Stagger, in seconds. Capped by the caller. */
  delay?: number;
  /** Vertical travel in px; negative moves down-to-up from above. */
  y?: number;
  /** Horizontal travel in px. */
  x?: number;
  duration?: number;
  children?: ReactNode;
}

/**
 * Entrance animation for content that is present in the server HTML.
 *
 * Deliberately CSS-only: a JS-driven `initial={{ opacity: 0 }}` would ship the
 * markup with an inline `opacity: 0`, leaving the page blank until hydration.
 * Framer Motion is still the right tool for layout, presence and gestures —
 * just not for revealing static content.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  y = 12,
  x = 0,
  duration = 0.5,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  return (
    <Tag
      className={cn("reveal", className)}
      style={
        {
          "--reveal-delay": `${delay}s`,
          "--reveal-y": `${y}px`,
          "--reveal-x": `${x}px`,
          "--reveal-duration": `${duration}s`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </Tag>
  );
}

/** Caps stagger so long lists do not take seconds to finish appearing. */
export const stagger = (index: number, step = 0.05, max = 0.35) =>
  Math.min(index * step, max);
