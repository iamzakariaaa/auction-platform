interface SuccessMessageProps {
  message: string;
  className?: string;
}

function SuccessMessage({
  message,
  className = "",
}: SuccessMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`success-message ${className}`.trim()}
      role="status"
    >
      {message}
    </p>
  );
}

export default SuccessMessage;