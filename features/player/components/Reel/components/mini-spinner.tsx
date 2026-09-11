import { Loader2 } from "lucide-react";

interface MiniSpinnerProps {
  className?: string;
}

export default function MiniSpinner({ className = "" }: MiniSpinnerProps) {
  return (
    <Loader2
      className={`size-3 shrink-0 animate-spin ${className}`}
      aria-hidden="true"
    />
  );
}
