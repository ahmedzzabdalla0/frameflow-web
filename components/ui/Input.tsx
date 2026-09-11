"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className, id, ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wider text-muted uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "h-9 w-full rounded-lg border border-border-strong bg-surface-sunken px-3 text-sm text-foreground/90 placeholder-subtle transition-colors duration-200 outline-none focus:border-muted disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

export { Input };
export type { InputProps };
