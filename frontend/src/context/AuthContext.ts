import {
  createContext,
} from "react";

import type {
  User,
} from "../types/auth";

export interface StartSessionOptions {
  accessToken: string;
  expiresIn?: number;
  user?: User;
}

export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  authenticated: boolean;

  startSession: (
    options: StartSessionOptions,
  ) => Promise<void>;

  logout: () => void;

  refreshUser: () => Promise<void>;
}

export const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);