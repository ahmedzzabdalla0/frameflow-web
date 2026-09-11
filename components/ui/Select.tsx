"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, className, id, children, ...props }, ref) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold tracking-wider text-muted uppercase">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-border-strong bg-surface-sunken px-2.5 text-sm text-foreground/90 transition-colors duration-200 outline-none focus:border-muted disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

Select.displayName = "Select";

export { Select };
export type { SelectProps };
