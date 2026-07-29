"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Horizontally scrollable shell — the page body never scrolls sideways. */
export function TableWrap({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-full overflow-x-auto overscroll-x-contain", className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("w-full border-collapse text-left text-[13px]", className)}
      {...props}
    />
  );
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-border bg-surface-2/40 [&_th]:whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TR({
  className,
  interactive,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={cn(
        "transition-colors duration-150",
        interactive && "cursor-pointer hover:bg-surface-2/60",
        className,
      )}
      {...props}
    />
  );
}

export type SortDirection = "asc" | "desc" | null;

export function TH({
  className,
  children,
  sortable,
  direction,
  onSort,
  align = "left",
  ...props
}: Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
  sortable?: boolean;
  direction?: SortDirection;
  onSort?: () => void;
  align?: "left" | "right" | "center";
}) {
  const alignment =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-subtle",
        alignment,
        className,
      )}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
            direction && "text-foreground",
            align === "right" && "flex-row-reverse",
          )}
        >
          {children}
          {direction === "asc" ? (
            <ChevronUp className="size-3" />
          ) : direction === "desc" ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronsUpDown className="size-3 opacity-45" />
          )}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TD({
  className,
  align = "left",
  ...props
}: Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: "left" | "right" | "center";
}) {
  const alignment =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={cn("px-4 py-3.5 align-middle", alignment, className)} {...props} />
  );
}

/** Numeric cells use tabular figures so columns line up. */
export function TDNum({
  className,
  ...props
}: Omit<TdHTMLAttributes<HTMLTableCellElement>, "align">) {
  return (
    <TD
      align="right"
      className={cn("font-mono text-[12.5px] tabular-nums", className)}
      {...props}
    />
  );
}
