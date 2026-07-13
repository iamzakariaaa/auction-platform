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
  register as registerUser,
} from "../../api/authApi";

import {
  getApiErrorMessage,
} from "../../api/getApiErrorMessage";

import useAuth from
  "../../hooks/useAuth";

import {
  registerSchema,
  type RegisterFormValues,
} from "../../schemas/authSchemas";

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
  } =
    useForm<RegisterFormValues>({
      resolver:
        zodResolver(
          registerSchema,
        ),

      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
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
            await registerUser({
              firstName:
                values.firstName.trim(),

              lastName:
                values.lastName.trim(),

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
              "Registration failed. Please check your information.",
            ),
          );
        }
      },
    );

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
          onSubmit={onSubmit}
          noValidate
        >
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">
                First name
              </label>

              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                aria-invalid={
                  errors.firstName
                    ? "true"
                    : "false"
                }
                aria-describedby={
                  errors.firstName
                    ? "first-name-error"
                    : undefined
                }
                disabled={
                  isSubmitting
                }
                {...register(
                  "firstName",
                )}
              />

              {errors.firstName && (
                <p
                  id="first-name-error"
                  className="error-message"
                  role="alert"
                >
                  {
                    errors.firstName
                      .message
                  }
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="lastName">
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                aria-invalid={
                  errors.lastName
                    ? "true"
                    : "false"
                }
                aria-describedby={
                  errors.lastName
                    ? "last-name-error"
                    : undefined
                }
                disabled={
                  isSubmitting
                }
                {...register(
                  "lastName",
                )}
              />

              {errors.lastName && (
                <p
                  id="last-name-error"
                  className="error-message"
                  role="alert"
                >
                  {
                    errors.lastName
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
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
                  ? "register-email-error"
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
                id="register-email-error"
                className="error-message"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={
                errors.password
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.password
                  ? "register-password-error"
                  : "register-password-help"
              }
              disabled={
                isSubmitting
              }
              {...register(
                "password",
              )}
            />

            <p
              id="register-password-help"
              className="field-help"
            >
              Use at least 8
              characters.
            </p>

            {errors.password && (
              <p
                id="register-password-error"
                className="error-message"
                role="alert"
              >
                {
                  errors.password
                    .message
                }
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter the password again"
              aria-invalid={
                errors.confirmPassword
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.confirmPassword
                  ? "confirm-password-error"
                  : undefined
              }
              disabled={
                isSubmitting
              }
              {...register(
                "confirmPassword",
              )}
            />

            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                className="error-message"
                role="alert"
              >
                {
                  errors
                    .confirmPassword
                    .message
                }
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