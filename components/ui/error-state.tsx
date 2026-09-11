import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <p className="text-muted">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
