import Image from "next/image";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)} role="status" aria-label={label ?? "Loading"}>
      <div className="relative size-16">
        <div className="absolute inset-[-30%] rounded-full bg-primary/15 blur-xl motion-safe:animate-[ls-glow_2.4s_ease-in-out_infinite]" />
        <svg className="absolute inset-0 size-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="27" stroke="white" strokeOpacity="0.08" strokeWidth="2" />
        </svg>
        <svg
          className="absolute inset-0 size-full motion-safe:animate-[ls-spin_1.1s_cubic-bezier(0.65,0,0.35,1)_infinite]"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle
            cx="32"
            cy="32"
            r="27"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="42 128"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/icon.svg"
            alt=""
            width={20}
            height={20}
            priority
            className="h-5 motion-safe:animate-[ls-breathe_2.4s_ease-in-out_infinite]"
          />
        </div>
      </div>
      {label && <p className="text-sm font-medium tracking-[0.01em] text-foreground/50">{label}</p>}
    </div>
  );
}
