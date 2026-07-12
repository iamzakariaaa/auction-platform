interface LoadingStateProps {
  message?: string;
}

function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <p className="loading-state">
      {message}
    </p>
  );
}

export default LoadingState;