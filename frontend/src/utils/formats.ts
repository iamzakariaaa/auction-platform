const PLATFORM_TIME_ZONE =
  "Africa/Casablanca";

export function formatDateTime(
  value: string | Date,
): string {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-MA", {
    timeZone: PLATFORM_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });
}

export function formatMoney(
  value: number,
  currency = "MAD",
): string {
  return new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatRemainingTime(
  totalSeconds: number,
): string {
  if (totalSeconds <= 0) {
    return "Ended";
  }

  const days = Math.floor(
    totalSeconds / 86400,
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function toLocalDateTimeInput(
  value: string,
): string {
  const date = new Date(value);

  const timezoneOffsetMilliseconds =
    date.getTimezoneOffset() * 60_000;

  return new Date(
    date.getTime() - timezoneOffsetMilliseconds,
  )
    .toISOString()
    .slice(0, 16);
}