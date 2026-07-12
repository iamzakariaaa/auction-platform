import axios from "axios";

interface ApiErrorBody {
  message?: unknown;
  code?: unknown;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const responseData =
    error.response?.data as
      | ApiErrorBody
      | string
      | undefined;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData.message === "string"
  ) {
    return responseData.message;
  }

  if (
    typeof error.message === "string" &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return fallback;
}