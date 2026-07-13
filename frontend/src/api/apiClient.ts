import axios from "axios";

import {
  dispatchSessionExpired,
} from "../auth/authEvents";

import {
  clearStoredSession,
  getAccessToken,
} from "../auth/tokenStorage";

const apiClient = axios.create({
  baseURL:
    import.meta.env
      .VITE_API_BASE_URL,

  headers: {
    "Content-Type":
      "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      getAccessToken();

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    if (
      config.data instanceof FormData
    ) {
      delete config.headers[
        "Content-Type"
      ];
    } else {
      config.headers[
        "Content-Type"
      ] = "application/json";
    }

    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,

  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isSessionEntryRequest(
        error.config?.url,
      )
    ) {
      clearStoredSession();
      dispatchSessionExpired();
    }

    return Promise.reject(error);
  },
);

function isSessionEntryRequest(
  requestUrl: string | undefined,
): boolean {
  if (!requestUrl) {
    return false;
  }

  return (
    requestUrl.includes(
      "/api/auth/login",
    ) ||
    requestUrl.includes(
      "/api/auth/register",
    )
  );
}

export default apiClient;