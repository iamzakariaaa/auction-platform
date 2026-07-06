import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

import { login } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

interface LocationState {
  from?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    authenticated,
    startSession,
  } = useAuth();

  const [email, setEmail] =
    useState("");
  const [password, setPassword] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const locationState =
    location.state as LocationState | null;

  const destination =
    locationState?.from ?? "/";

  useEffect(() => {
    if (authenticated) {
      navigate("/", {
        replace: true,
      });
    }
  }, [authenticated, navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage(
        "Please enter your email and password.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await login({
        email: normalizedEmail,
        password,
      });

      await startSession(
        response.accessToken,
        response.user,
      );

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseMessage =
          error.response?.data?.message;

        setErrorMessage(
          typeof responseMessage === "string"
            ? responseMessage
            : "Login failed. Please check your credentials.",
        );
      } else {
        setErrorMessage(
          "An unexpected error occurred.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="form-card">
        <div className="form-header">
          <p className="form-eyebrow">
            Welcome back
          </p>

          <h1>Login</h1>

          <p className="form-description">
            Sign in to place bids, follow auctions,
            and manage your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={submitting}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={submitting}
              required
            />
          </div>

          {errorMessage && (
            <p
              className="error-message"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            className="primary-form-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="form-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;