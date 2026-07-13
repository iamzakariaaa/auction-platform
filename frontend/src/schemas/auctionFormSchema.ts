import {
  z,
} from "zod";

export function createAuctionFormSchema(
  editing: boolean,
) {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(
          1,
          "Title is required.",
        )
        .max(
          200,
          "Title cannot exceed 200 characters.",
        ),

      description: z
        .string()
        .trim()
        .min(
          1,
          "Description is required.",
        )
        .max(
          5000,
          "Description cannot exceed 5000 characters.",
        ),

      startingPrice: z
        .string()
        .trim()
        .min(
          1,
          "Starting price is required.",
        )
        .refine(
          (value) => {
            const amount =
              Number(value);

            return (
              Number.isFinite(amount) &&
              amount > 0
            );
          },
          {
            message:
              "Starting price must be greater than zero.",
          },
        ),

      minimumBidIncrement: z
        .string()
        .trim()
        .min(
          1,
          "Minimum increment is required.",
        )
        .refine(
          (value) => {
            const amount =
              Number(value);

            return (
              Number.isFinite(amount) &&
              amount > 0
            );
          },
          {
            message:
              "Minimum bid increment must be greater than zero.",
          },
        ),

      startTime: z
        .string()
        .min(
          1,
          "Start time is required.",
        ),

      endTime: z
        .string()
        .min(
          1,
          "End time is required.",
        ),
    })
    .superRefine(
      (values, context) => {
        const startDate =
          new Date(
            values.startTime,
          );

        const endDate =
          new Date(
            values.endTime,
          );

        const startIsValid =
          !Number.isNaN(
            startDate.getTime(),
          );

        const endIsValid =
          !Number.isNaN(
            endDate.getTime(),
          );

        if (!startIsValid) {
          context.addIssue({
            code: "custom",
            path: [
              "startTime",
            ],
            message:
              "Enter a valid start time.",
          });
        }

        if (!endIsValid) {
          context.addIssue({
            code: "custom",
            path: [
              "endTime",
            ],
            message:
              "Enter a valid end time.",
          });
        }

        if (
          !startIsValid ||
          !endIsValid
        ) {
          return;
        }

        if (endDate <= startDate) {
          context.addIssue({
            code: "custom",
            path: [
              "endTime",
            ],
            message:
              "End time must be after start time.",
          });
        }

        if (
          !editing &&
          endDate.getTime() <=
            Date.now()
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "endTime",
            ],
            message:
              "The auction end time must be in the future.",
          });
        }
      },
    );
}

export type AuctionFormInput =
  z.input<
    ReturnType<
      typeof createAuctionFormSchema
    >
  >;

export type AuctionFormValues =
  z.output<
    ReturnType<
      typeof createAuctionFormSchema
    >
  >;