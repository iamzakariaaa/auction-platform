import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
} from "../api/authApi";

import {
  AUTH_SESSION_EXPIRED_EVENT,
} from "../auth/authEvents";

import {
  clearStoredSession,
  getAccessToken,
  storeAccessToken,
} from "../auth/tokenStorage";

import {
  queryClient,
} from "../query/queryClient";

import {
  AuthContext,
  type AuthContextValue,
  type StartSessionOptions,
} from "./AuthContext";

import type {
  User,
} from "../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    accessToken,
    setAccessToken,
  ] = useState<string | null>(
    () => getAccessToken(),
  );

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const clearSession =
    useCallback(() => {
      clearStoredSession();

      setAccessToken(null);
      setUser(null);

      queryClient.clear();
    }, []);

  const logout =
    useCallback(() => {
      clearSession();
    }, [clearSession]);

  const refreshUser =
    useCallback(async () => {
      const storedToken =
        getAccessToken();

      if (!storedToken) {
        setAccessToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setAccessToken(
        storedToken,
      );

      try {
        const currentUser =
          await getCurrentUser();

        setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }, [clearSession]);

  const startSession =
    useCallback(
      async ({
        accessToken:
          newAccessToken,
        expiresIn,
        user: sessionUser,
      }: StartSessionOptions) => {
        queryClient.clear();

        storeAccessToken(
          newAccessToken,
          expiresIn,
        );

        setAccessToken(
          newAccessToken,
        );

        try {
          const currentUser =
            sessionUser ??
            await getCurrentUser();

          setUser(currentUser);
        } catch (error) {
          clearSession();
          throw error;
        }
      },
      [clearSession],
    );

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    function handleSessionExpired() {
      clearSession();
    }

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleSessionExpired,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, [clearSession]);

  const authenticated =
    accessToken !== null &&
    user !== null;

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        accessToken,
        loading,
        authenticated,
        startSession,
        logout,
        refreshUser,
      }),
      [
        user,
        accessToken,
        loading,
        authenticated,
        startSession,
        logout,
        refreshUser,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}