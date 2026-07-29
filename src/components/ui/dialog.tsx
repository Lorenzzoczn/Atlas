"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

function Overlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/55 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  showClose = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2",
          "glass-strong rounded-panel shadow-lift",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-96",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-96",
          "duration-200",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("space-y-1.5 p-6 pb-2", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm leading-relaxed text-muted", className)}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ drawer */

const drawerSides = {
  right: [
    "inset-y-0 right-0 h-full w-[calc(100vw-2rem)] max-w-md border-l",
    "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  ],
  left: [
    "inset-y-0 left-0 h-full w-[calc(100vw-2rem)] max-w-md border-r",
    "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  ],
  bottom: [
    "inset-x-0 bottom-0 max-h-[85vh] rounded-t-panel border-t",
    "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  ],
} as const;

export function Drawer({
  side = "right",
  className,
  children,
  showClose = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: keyof typeof drawerSides;
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col border-border bg-background-elevated shadow-lift",
          "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
          drawerSides[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-3 hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
