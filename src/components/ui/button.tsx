"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium select-none",
    "transition-[background,border-color,color,box-shadow,transform] duration-200 ease-out",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:shrink-0 [&_svg]:size-4",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "shadow-[0_1px_0_0_rgb(255_255_255/0.18)_inset,0_6px_20px_-8px_var(--primary)]",
          "hover:bg-primary-strong hover:shadow-[0_1px_0_0_rgb(255_255_255/0.2)_inset,0_10px_28px_-8px_var(--primary)]",
        ],
        secondary:
          "bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-strong",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-border-strong",
        ghost: "text-muted hover:bg-surface-2 hover:text-foreground",
        subtle:
          "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/16 hover:border-primary/40",
        danger:
          "bg-danger/12 text-danger border border-danger/30 hover:bg-danger/20 hover:border-danger/50",
        glass:
          "glass text-foreground hover:bg-surface-2/80 hover:border-border-strong",
      },
      size: {
        xs: "h-7 rounded-lg px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-8.5 rounded-lg px-3 text-[13px]",
        md: "h-10 rounded-xl px-4 text-sm",
        lg: "h-11.5 rounded-xl px-5 text-[15px]",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-8 rounded-lg [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
