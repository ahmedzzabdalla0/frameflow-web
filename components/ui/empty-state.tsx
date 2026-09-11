interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "Nothing here yet" }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center p-10">
      <p className="text-center text-muted">{message}</p>
    </div>
  );
}
