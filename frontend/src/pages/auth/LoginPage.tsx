import {
  useEffect,
  useState,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  login,
} from "../../api/authApi";

import {
  getApiErrorMessage,
} from "../../api/getApiErrorMessage";

import useAuth from
  "../../hooks/useAuth";

import {
  loginSchema,
  type LoginFormValues,
} from "../../schemas/authSchemas";

import "./AuthPage.css";

interface LocationState {
  from?: string;
}

function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    authenticated,
    loading,
    startSession,
  } = useAuth();

  const [
    serverErrorMessage,
    setServerErrorMessage,
  ] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(
        loginSchema,
      ),

    defaultValues: {
      email: "",
      password: "",
    },

    mode: "onSubmit",
  });

  const locationState =
    location.state as
      | LocationState
      | null;

  const destination =
    getSafeDestination(
      locationState?.from,
    );

  useEffect(() => {
    if (
      !loading &&
      authenticated
    ) {
      navigate(
        destination,
        {
          replace: true,
        },
      );
    }
  }, [
    authenticated,
    destination,
    loading,
    navigate,
  ]);

  const onSubmit =
    handleSubmit(
      async (values) => {
        setServerErrorMessage("");

        try {
          const response =
            await login({
              email:
                values.email
                  .trim()
                  .toLowerCase(),

              password:
                values.password,
            });

          await startSession({
            accessToken:
              response.accessToken,

            expiresIn:
              response.expiresIn,

            user:
              response.user,
          });

          navigate(
            destination,
            {
              replace: true,
            },
          );
        } catch (error) {
          setServerErrorMessage(
            getApiErrorMessage(
              error,
              "Login failed. Please check your credentials.",
            ),
          );
        }
      },
    );

  return (
    <main className="auth-page">
      <section className="form-card">
        <div className="form-header">
          <p className="form-eyebrow">
            Welcome back
          </p>

          <h1>Login</h1>

          <p className="form-description">
            Sign in to place bids,
            follow auctions, and manage
            your account.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
        >
          <div className="form-field">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={
                errors.email
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.email
                  ? "login-email-error"
                  : undefined
              }
              disabled={
                isSubmitting
              }
              {...register(
                "email",
              )}
            />

            {errors.email && (
              <p
                id="login-email-error"
                className="error-message"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={
                errors.password
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.password
                  ? "login-password-error"
                  : undefined
              }
              disabled={
                isSubmitting
              }
              {...register(
                "password",
              )}
            />

            {errors.password && (
              <p
                id="login-password-error"
                className="error-message"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {serverErrorMessage && (
            <p
              className="error-message"
              role="alert"
            >
              {serverErrorMessage}
            </p>
          )}

          <button
            className="primary-form-button"
            type="submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="form-footer">
          Don&apos;t have an
          account?{" "}

          <Link
            to="/register"
            state={locationState}
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

function getSafeDestination(
  requestedDestination:
    string | undefined,
): string {
  if (
    !requestedDestination ||
    !requestedDestination.startsWith(
      "/",
    ) ||
    requestedDestination.startsWith(
      "//",
    )
  ) {
    return "/";
  }

  return requestedDestination;
}

export default LoginPage;