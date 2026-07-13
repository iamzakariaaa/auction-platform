const ACCESS_TOKEN_KEY =
  "accessToken";

const ACCESS_TOKEN_EXPIRY_KEY =
  "accessTokenExpiresAt";

interface JwtPayload {
  exp?: number;
}

export function getAccessToken():
  string | null {
  const accessToken =
    localStorage.getItem(
      ACCESS_TOKEN_KEY,
    );

  if (!accessToken) {
    return null;
  }

  if (tokenHasExpired(accessToken)) {
    clearStoredSession();
    return null;
  }

  return accessToken;
}

export function storeAccessToken(
  accessToken: string,
  expiresInSeconds?: number,
) {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  const expiresAt =
    calculateExpiryTime(
      accessToken,
      expiresInSeconds,
    );

  if (expiresAt === null) {
    localStorage.removeItem(
      ACCESS_TOKEN_EXPIRY_KEY,
    );

    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_EXPIRY_KEY,
    expiresAt.toString(),
  );
}

export function clearStoredSession() {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  localStorage.removeItem(
    ACCESS_TOKEN_EXPIRY_KEY,
  );

  localStorage.removeItem(
    "currentUser",
  );
}

function tokenHasExpired(
  accessToken: string,
): boolean {
  const storedExpiry =
    readStoredExpiry();

  const tokenExpiry =
    readJwtExpiry(accessToken);

  const expiresAt =
    storedExpiry ??
    tokenExpiry;

  if (expiresAt === null) {
    return false;
  }

  return Date.now() >= expiresAt;
}

function calculateExpiryTime(
  accessToken: string,
  expiresInSeconds?: number,
): number | null {
  if (
    expiresInSeconds !== undefined &&
    Number.isFinite(
      expiresInSeconds,
    ) &&
    expiresInSeconds > 0
  ) {
    return (
      Date.now() +
      expiresInSeconds * 1000
    );
  }

  return readJwtExpiry(
    accessToken,
  );
}

function readStoredExpiry():
  number | null {
  const storedValue =
    localStorage.getItem(
      ACCESS_TOKEN_EXPIRY_KEY,
    );

  if (!storedValue) {
    return null;
  }

  const parsedValue =
    Number(storedValue);

  return Number.isFinite(
    parsedValue,
  )
    ? parsedValue
    : null;
}

function readJwtExpiry(
  accessToken: string,
): number | null {
  try {
    const tokenParts =
      accessToken.split(".");

    if (tokenParts.length !== 3) {
      return null;
    }

    const encodedPayload =
      tokenParts[1];

    const normalizedPayload =
      encodedPayload
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(
          Math.ceil(
            encodedPayload.length /
              4,
          ) * 4,
          "=",
        );

    const payload =
      JSON.parse(
        atob(normalizedPayload),
      ) as JwtPayload;

    if (
      typeof payload.exp !==
      "number"
    ) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}