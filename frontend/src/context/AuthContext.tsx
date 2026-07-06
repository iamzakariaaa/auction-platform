import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCurrentUser } from "../api/authApi";
import type { User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  authenticated: boolean;
  startSession: (
    accessToken: string,
    user?: User,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [accessToken, setAccessToken] =
    useState<string | null>(() =>
      localStorage.getItem("accessToken"),
    );

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");

    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshUser =
    useCallback(async () => {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        setUser(currentUser);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(currentUser),
        );
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }, [logout]);

  const startSession =
    useCallback(
      async (
        token: string,
        sessionUser?: User,
      ) => {
        localStorage.setItem(
          "accessToken",
          token,
        );

        setAccessToken(token);

        if (sessionUser) {
          setUser(sessionUser);

          localStorage.setItem(
            "currentUser",
            JSON.stringify(sessionUser),
          );

          return;
        }

        const currentUser =
          await getCurrentUser();

        setUser(currentUser);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(currentUser),
        );
      },
      [],
    );

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      authenticated:
        accessToken !== null && user !== null,
      startSession,
      logout,
      refreshUser,
    }),
    [
      user,
      accessToken,
      loading,
      startSession,
      logout,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}