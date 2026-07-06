import apiClient from "./apiClient";
import type {
  AuthResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "../types/auth";

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/login",
    request,
  );

  return response.data;
}

export async function register(
  request: RegisterRequest,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    request,
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/api/auth/me");

  return response.data;
}

