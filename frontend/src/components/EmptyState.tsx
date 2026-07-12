interface EmptyStateProps {
  title?: string;
  message: string;
}

function EmptyState({
  title,
  message,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {title && <h2>{title}</h2>}

      <p>{message}</p>
    </div>
  );
}

export default EmptyState;