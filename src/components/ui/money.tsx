"use client";

import { cn } from "@/lib/utils";
import { useUi } from "@/store/ui-store";
import { currency, currencyCompact } from "@/utils/format";

/**
 * Currency display that honours the workspace privacy toggle — values become
 * blurred blocks instead of disappearing, so layout never shifts.
 */
export function Money({
  value,
  compact,
  className,
}: {
  value: number;
  compact?: boolean;
  className?: string;
}) {
  const { privacyMode } = useUi();
  const text = compact ? currencyCompact(value) : currency(value);

  if (privacyMode) {
    return (
      <span
        className={cn("select-none blur-[6px] saturate-0", className)}
        aria-label="Valor oculto"
      >
        {text}
      </span>
    );
  }

  return <span className={cn("tabular-nums", className)}>{text}</span>;
}
