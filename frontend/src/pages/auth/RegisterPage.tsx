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
  register,
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

function RegisterPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    authenticated,
    loading,
    startSession,
  } = useAuth();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

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

    setErrorMessage("");

    const normalizedFirstName =
      firstName.trim();

    const normalizedLastName =
      lastName.trim();

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage(
        "Please complete all fields.",
      );

      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters.",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "Passwords do not match.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const response =
        await register({
          firstName:
            normalizedFirstName,

          lastName:
            normalizedLastName,

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
          "Registration failed. Please check your information.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="form-card register-card">
        <div className="form-header">
          <p className="form-eyebrow">
            Join the marketplace
          </p>

          <h1>
            Create an account
          </h1>

          <p className="form-description">
            Register to participate
            in auctions, place bids,
            and track your activity.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">
                First name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value,
                  )
                }
                disabled={submitting}
                maxLength={100}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value,
                  )
                }
                disabled={submitting}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
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
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              disabled={submitting}
              minLength={8}
              required
            />

            <p className="field-help">
              Use at least 8
              characters.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter the password again"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              disabled={submitting}
              minLength={8}
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
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="form-footer">
          Already have an
          account?{" "}

          <Link
            to="/login"
            state={locationState}
          >
            Login
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

export default RegisterPage;