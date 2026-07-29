"use client";

import { motion, type Transition } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * ATLAS MARK
 *
 * An apex "A" drawn as an ascending data path — two strokes rising to a node —
 * held inside an open orbital ring. The ring reads as coverage and scale, the
 * apex node as the intelligence layer, the rising strokes as growth.
 *
 * Geometry lives in a 40×40 box so every size renders on whole pixels.
 */

const RING_RADIUS = 17;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const draw: Transition = { duration: 1.1, ease: [0.22, 1, 0.36, 1] };

export type MarkVariant = "color" | "mono" | "inverted";

export function AtlasMark({
  size = 32,
  variant = "color",
  animated = true,
  className,
}: {
  size?: number;
  variant?: MarkVariant;
  animated?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradientId = `atlas-grad-${uid}`;
  const glowId = `atlas-glow-${uid}`;

  const strokeColor =
    variant === "color"
      ? `url(#${gradientId})`
      : variant === "inverted"
        ? "#ffffff"
        : "currentColor";

  const MotionPath = animated ? motion.path : "path";
  const MotionCircle = animated ? motion.circle : "circle";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Atlas Commerce AI"
      className={cn("shrink-0 overflow-visible", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="34" x2="34" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--atlas-indigo-600)" />
          <stop offset="52%" stopColor="var(--atlas-indigo-400)" />
          <stop offset="100%" stopColor="var(--atlas-cyan-400)" />
        </linearGradient>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* orbital ring — open on the lower right so the apex reads first */}
      <MotionCircle
        cx="20"
        cy="20"
        r={RING_RADIUS}
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray={`${RING_LENGTH * 0.62} ${RING_LENGTH * 0.38}`}
        opacity={variant === "mono" ? 0.35 : 0.55}
        style={{ transformOrigin: "20px 20px" }}
        {...(animated
          ? {
              initial: { rotate: -120, opacity: 0 },
              animate: { rotate: 240, opacity: variant === "mono" ? 0.35 : 0.55 },
              transition: {
                rotate: { duration: 22, ease: "linear", repeat: Infinity },
                opacity: { duration: 0.7 },
              },
            }
          : {})}
      />

      {/* left ascent */}
      <MotionPath
        d="M11.5 29.5 L20 11"
        stroke={strokeColor}
        strokeWidth="3.1"
        strokeLinecap="round"
        {...(animated
          ? {
              initial: { pathLength: 0, opacity: 0 },
              animate: { pathLength: 1, opacity: 1 },
              transition: { ...draw, delay: 0.08 },
            }
          : {})}
      />

      {/* right descent, drawn as a distinct weight so the mark is not a plain letter */}
      <MotionPath
        d="M20 11 L28.5 29.5"
        stroke={strokeColor}
        strokeWidth="3.1"
        strokeLinecap="round"
        opacity={0.45}
        {...(animated
          ? {
              initial: { pathLength: 0, opacity: 0 },
              animate: { pathLength: 1, opacity: 0.45 },
              transition: { ...draw, delay: 0.2 },
            }
          : {})}
      />

      {/* data crossbar */}
      <MotionPath
        d="M15.4 23.2 L24.6 23.2"
        stroke={strokeColor}
        strokeWidth="2.6"
        strokeLinecap="round"
        {...(animated
          ? {
              initial: { pathLength: 0, opacity: 0 },
              animate: { pathLength: 1, opacity: 1 },
              transition: { duration: 0.5, delay: 0.66, ease: "easeOut" },
            }
          : {})}
      />

      {/* apex intelligence node */}
      <MotionCircle
        cx="20"
        cy="10.6"
        r="3.1"
        fill={variant === "mono" ? "currentColor" : `url(#${gradientId})`}
        filter={variant === "color" ? `url(#${glowId})` : undefined}
        style={{ transformOrigin: "20px 10.6px" }}
        {...(animated
          ? {
              initial: { scale: 0, opacity: 0 },
              animate: { scale: [0, 1.18, 1], opacity: 1 },
              transition: { duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] },
            }
          : {})}
      />
    </svg>
  );
}

/**
 * Wordmark. "Atlas" carries the weight; the descriptor sits quieter beside it.
 */
export function AtlasWordmark({
  className,
  showDescriptor = true,
  variant = "color",
}: {
  className?: string;
  showDescriptor?: boolean;
  variant?: MarkVariant;
}) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-display text-[17px] font-semibold tracking-[-0.03em]",
          variant === "color" ? "text-foreground" : "text-current",
        )}
      >
        Atlas
        <span
          className={cn(
            "ml-1 font-medium",
            variant === "color" ? "text-brand-gradient" : "opacity-70",
          )}
        >
          Commerce
        </span>
      </span>
      {showDescriptor && (
        <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.28em] text-subtle">
          Intelligence
        </span>
      )}
    </span>
  );
}

export function AtlasLogo({
  size = 34,
  showDescriptor = true,
  variant = "color",
  animated = true,
  className,
}: {
  size?: number;
  showDescriptor?: boolean;
  variant?: MarkVariant;
  animated?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <AtlasMark size={size} variant={variant} animated={animated} />
      <AtlasWordmark showDescriptor={showDescriptor} variant={variant} />
    </span>
  );
}

export function AtlasLogoVertical({
  size = 56,
  variant = "color",
  className,
}: {
  size?: number;
  variant?: MarkVariant;
  className?: string;
}) {
  return (
    <span className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <AtlasMark size={size} variant={variant} />
      <span className="flex flex-col items-center leading-none">
        <span className="font-display text-lg font-semibold tracking-[-0.03em]">
          Atlas <span className="text-brand-gradient">Commerce</span>
        </span>
        <span className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.3em] text-subtle">
          Intelligence
        </span>
      </span>
    </span>
  );
}

/**
 * Pure-CSS rendition of the mark — no SVG, no JS. Used for the boot screen and
 * anywhere the logo must paint before hydration.
 */
export function AtlasMarkCss({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, var(--primary) 130deg, var(--accent) 210deg, transparent 260deg)",
          mask: "radial-gradient(circle, transparent 60%, #000 62%)",
          WebkitMask: "radial-gradient(circle, transparent 60%, #000 62%)",
          animation: "orbit 8s linear infinite",
        }}
      />
      <span
        className="absolute"
        style={{
          width: size * 0.08,
          height: size * 0.46,
          borderRadius: 999,
          background: "linear-gradient(180deg, var(--accent), var(--primary))",
          transform: `translateX(${-size * 0.105}px) rotate(-24deg)`,
        }}
      />
      <span
        className="absolute"
        style={{
          width: size * 0.08,
          height: size * 0.46,
          borderRadius: 999,
          background: "linear-gradient(180deg, var(--accent), var(--primary))",
          opacity: 0.45,
          transform: `translateX(${size * 0.105}px) rotate(24deg)`,
        }}
      />
      <span
        className="absolute"
        style={{
          width: size * 0.23,
          height: size * 0.065,
          borderRadius: 999,
          background: "var(--primary)",
          transform: `translateY(${size * 0.08}px)`,
        }}
      />
      <span
        className="absolute"
        style={{
          width: size * 0.155,
          height: size * 0.155,
          borderRadius: 999,
          background: "linear-gradient(140deg, var(--atlas-indigo-400), var(--accent))",
          boxShadow: "0 0 12px color-mix(in oklab, var(--primary) 70%, transparent)",
          transform: `translateY(${-size * 0.235}px)`,
        }}
      />
    </span>
  );
}
