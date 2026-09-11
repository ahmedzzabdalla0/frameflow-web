"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold text-foreground transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "glass-pill hover:bg-primary-hover focus-visible:ring-primary/50",
        secondary:
          "text-muted-foreground glass-pill hover:bg-surface-hover hover:text-foreground focus-visible:ring-white/20",
        ghost:
          "border border-transparent bg-transparent text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:ring-white/20",
        danger:
          "text-negative glass-pill hover:bg-negative hover:text-white focus-visible:ring-negative/50",
        icon: "text-foreground glass-pill hover:bg-glass-strong focus-visible:ring-white/20",
      },
      size: {
        sm: "h-7 gap-1.5 px-2.5 text-xs",
        md: "h-9 gap-2 px-4 text-sm",
        lg: "h-11 gap-2 px-5 text-sm",
      },
      active: {
        true: "",
        false: "",
      },
      tone: {
        neutral: "",
        primary: "",
        positive: "",
        negative: "",
        accent: "",
      },
    },
    compoundVariants: [
      { variant: "icon", size: "sm", class: "size-7 rounded-full px-0" },
      { variant: "icon", size: "md", class: "size-9 rounded-full px-0" },
      { variant: "icon", size: "lg", class: "size-11 rounded-full px-0" },

      {
        active: true,
        tone: "neutral",
        class:
          "bg-glass-strong! text-foreground! hover:bg-glass-strong! focus-visible:ring-white/30",
      },
      {
        active: true,
        tone: "primary",
        class:
          "bg-primary! text-primary-foreground! hover:bg-primary-hover! focus-visible:ring-primary/50",
      },
      {
        active: true,
        tone: "positive",
        class:
          "bg-positive! text-white! hover:bg-positive/90! focus-visible:ring-positive/50",
      },
      {
        active: true,
        tone: "negative",
        class:
          "bg-negative! text-white! hover:bg-negative/90! focus-visible:ring-negative/50",
      },
      {
        active: true,
        tone: "accent",
        class:
          "bg-accent! text-background! hover:bg-accent/90! focus-visible:ring-accent/50",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      active: false,
      tone: "neutral",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      active,
      tone,
      loading = false,
      asChild = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        aria-pressed={active ?? undefined}
        className={cn(
          buttonVariants({ variant, size, active, tone }),
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
