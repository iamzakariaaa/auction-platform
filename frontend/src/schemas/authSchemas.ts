import {
  z,
} from "zod";

const emailSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "Email is required.",
    )
    .pipe(
      z.email({
        error:
          "Enter a valid email address.",
      }),
    )
    .transform((email) =>
      email.toLowerCase(),
    );

export const loginSchema =
  z.object({
    email: emailSchema,

    password: z
      .string()
      .min(
        1,
        "Password is required.",
      ),
  });

export type LoginFormValues =
  z.input<
    typeof loginSchema
  >;

export type LoginFormOutput =
  z.output<
    typeof loginSchema
  >;

export const registerSchema =
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(
          1,
          "First name is required.",
        )
        .max(
          100,
          "First name cannot exceed 100 characters.",
        ),

      lastName: z
        .string()
        .trim()
        .min(
          1,
          "Last name is required.",
        )
        .max(
          100,
          "Last name cannot exceed 100 characters.",
        ),

      email: emailSchema,

      password: z
        .string()
        .min(
          8,
          "Password must contain at least 8 characters.",
        )
        .max(
          100,
          "Password cannot exceed 100 characters.",
        ),

      confirmPassword: z
        .string()
        .min(
          1,
          "Please confirm your password.",
        ),
    })
    .refine(
      (values) =>
        values.password ===
        values.confirmPassword,
      {
        message:
          "Passwords do not match.",
        path: [
          "confirmPassword",
        ],
      },
    );

export type RegisterFormValues =
  z.input<
    typeof registerSchema
  >;

export type RegisterFormOutput =
  z.output<
    typeof registerSchema
  >;