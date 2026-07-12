interface ErrorMessageProps {
  message: string;
  className?: string;
}

function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`error-message ${className}`.trim()}
      role="alert"
    >
      {message}
    </p>
  );
}

export default ErrorMessage;