import {
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";

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

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

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

  async function handleSubmit(
    event: SyntheticEvent<
      HTMLFormElement,
      SubmitEvent
    >,
  ) {
    event.preventDefault();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedEmail ||
      !password
    ) {
      setErrorMessage(
        "Please enter your email and password.",
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response =
        await login({
          email:
            normalizedEmail,
          password,
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
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Login failed. Please check your credentials.",
        ),
      );
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
            Sign in to place bids,
            follow auctions, and manage
            your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >
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
                setEmail(
                  event.target.value,
                )
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
                setPassword(
                  event.target.value,
                )
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