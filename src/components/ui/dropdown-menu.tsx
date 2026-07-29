"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;

const surface = [
  "z-50 min-w-48 overflow-hidden rounded-xl border border-border p-1.5",
  "bg-surface/95 backdrop-blur-xl shadow-lift",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
  "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
];

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={cn(surface, className)}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

const itemBase = [
  "relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2",
  "text-[13px] text-muted outline-none transition-colors",
  "focus:bg-surface-3 focus:text-foreground data-[highlighted]:bg-surface-3 data-[highlighted]:text-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle",
];

export function DropdownMenuItem({
  className,
  danger,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item> & { danger?: boolean }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        itemBase,
        danger &&
          "text-danger focus:bg-danger/12 focus:text-danger data-[highlighted]:bg-danger/12 data-[highlighted]:text-danger [&_svg]:text-danger",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownPrimitive.CheckboxItem>) {
  return (
    <DropdownPrimitive.CheckboxItem
      className={cn(itemBase, "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2.5 grid size-4 place-items-center">
        <DropdownPrimitive.ItemIndicator>
          <Check className="size-3.5 !text-primary" />
        </DropdownPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownPrimitive.CheckboxItem>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Label>) {
  return (
    <DropdownPrimitive.Label
      className={cn(
        "px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Separator>) {
  return (
    <DropdownPrimitive.Separator
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  );
}

export function DropdownMenuShortcut({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto font-mono text-[10.5px] text-subtle", className)}
      {...props}
    />
  );
}
