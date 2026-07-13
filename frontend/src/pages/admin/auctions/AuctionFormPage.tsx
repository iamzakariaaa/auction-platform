import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  useForm,
} from "react-hook-form";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  resolveAuctionImageUrl,
} from "../../../api/auctionApi";

import {
  getApiErrorMessage,
} from "../../../api/getApiErrorMessage";

import ErrorMessage from
  "../../../components/ErrorMessage";

import LoadingState from
  "../../../components/LoadingState";

import useCreateAuctionMutation from
  "../../../hooks/mutations/useCreateAuctionMutation";

import useDeleteAuctionImageMutation from
  "../../../hooks/mutations/useDeleteAuctionImageMutation";

import useSetPrimaryAuctionImageMutation from
  "../../../hooks/mutations/useSetPrimaryAuctionImageMutation";

import useUpdateAuctionMutation from
  "../../../hooks/mutations/useUpdateAuctionMutation";

import useUploadAuctionImagesMutation from
  "../../../hooks/mutations/useUploadAuctionImagesMutation";

import useAuctionDetailsQuery from
  "../../../hooks/queries/useAuctionDetailsQuery";

import useAuctionImagesQuery from
  "../../../hooks/queries/useAuctionImagesQuery";

import {
  createAuctionFormSchema,
  type AuctionFormInput,
  type AuctionFormValues,
} from "../../../schemas/auctionFormSchema";

import type {
  AuctionFormRequest,
} from "../../../types/auction";

import {
  toLocalDateTimeInput,
} from "../../../utils/formats";

import "./AuctionFormPage.css";

const EMPTY_FORM:
  AuctionFormInput = {
    title: "",
    description: "",
    startingPrice: "",
    minimumBidIncrement: "",
    startTime: "",
    endTime: "",
  };

function AuctionFormPage() {
  const navigate =
    useNavigate();

  const { auctionId } =
    useParams<{
      auctionId: string;
    }>();

  const editing =
    auctionId !== undefined;

  const initializedAuctionIdRef =
    useRef<string | null>(
      null,
    );

  const formSchema =
    useMemo(
      () =>
        createAuctionFormSchema(
          editing,
        ),
      [editing],
    );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    AuctionFormInput,
    unknown,
    AuctionFormValues
  >({
    resolver:
      zodResolver(
        formSchema,
      ),

    defaultValues:
      EMPTY_FORM,

    mode: "onSubmit",
  });

  const auctionQuery =
    useAuctionDetailsQuery(
      editing
        ? auctionId
        : undefined,
    );

  const imagesQuery =
    useAuctionImagesQuery(
      editing
        ? auctionId
        : undefined,
    );

  const createMutation =
    useCreateAuctionMutation();

  const updateMutation =
    useUpdateAuctionMutation();

  const uploadMutation =
    useUploadAuctionImagesMutation();

  const setPrimaryMutation =
    useSetPrimaryAuctionImageMutation();

  const deleteImageMutation =
    useDeleteAuctionImageMutation();

  const auction =
    auctionQuery.data;

  const images =
    imagesQuery.data ?? [];

  useEffect(() => {
    if (
      !editing ||
      !auctionId ||
      !auction
    ) {
      return;
    }

    if (
      initializedAuctionIdRef
        .current === auctionId
    ) {
      return;
    }

    reset({
      title:
        auction.title,

      description:
        auction.description,

      startingPrice:
        auction.startingPrice
          .toString(),

      minimumBidIncrement:
        auction
          .minimumBidIncrement
          .toString(),

      startTime:
        toLocalDateTimeInput(
          auction.startTime,
        ),

      endTime:
        toLocalDateTimeInput(
          auction.endTime,
        ),
    });

    initializedAuctionIdRef.current =
      auctionId;
  }, [
    auction,
    auctionId,
    editing,
    reset,
  ]);

  const auctionIsEditable =
    !auction ||
    auction.status === "DRAFT" ||
    (
      auction.status ===
        "SCHEDULED" &&
      new Date(
        auction.startTime,
      ).getTime() > Date.now()
    );

  const saving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const uploadError =
    uploadMutation.isError
      ? getApiErrorMessage(
          uploadMutation.error,
          "Unable to upload one or more images.",
        )
      : "";

  const setPrimaryError =
    setPrimaryMutation.isError
      ? getApiErrorMessage(
          setPrimaryMutation.error,
          "Unable to select the primary image.",
        )
      : "";

  const deleteImageError =
    deleteImageMutation.isError
      ? getApiErrorMessage(
          deleteImageMutation.error,
          "Unable to delete the image.",
        )
      : "";

  const saveError =
    createMutation.isError
      ? getApiErrorMessage(
          createMutation.error,
          "Unable to create the auction.",
        )
      : updateMutation.isError
        ? getApiErrorMessage(
            updateMutation.error,
            "Unable to update the auction.",
          )
        : "";

  const auctionLoadError =
    auctionQuery.isError
      ? getApiErrorMessage(
          auctionQuery.error,
          "Unable to load this auction.",
        )
      : "";

  const imageLoadError =
    imagesQuery.isError
      ? getApiErrorMessage(
          imagesQuery.error,
          "Unable to load auction images.",
        )
      : "";

  const displayedError =
    errors.root?.message ||
    auctionLoadError ||
    imageLoadError ||
    uploadError ||
    setPrimaryError ||
    deleteImageError ||
    saveError;

  function clearMutationErrors() {
    createMutation.reset();
    updateMutation.reset();
    uploadMutation.reset();
    setPrimaryMutation.reset();
    deleteImageMutation.reset();
  }

  async function handleImageSelection(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ?? [],
      );

    event.target.value = "";

    if (
      !auctionId ||
      selectedFiles.length === 0
    ) {
      return;
    }

    if (
      images.length +
        selectedFiles.length >
      8
    ) {
      setError(
        "root",
        {
          type: "manual",
          message:
            "An auction cannot contain more than 8 images.",
        },
      );

      return;
    }

    clearErrors("root");
    clearMutationErrors();

    try {
      await uploadMutation.mutateAsync({
        auctionId,
        files:
          selectedFiles,
      });
    } catch {
      // Mutation error is displayed
      // through uploadMutation.error.
    }
  }

  async function handleSetPrimary(
    imageId: string,
  ) {
    if (!auctionId) {
      return;
    }

    clearErrors("root");
    clearMutationErrors();

    try {
      await setPrimaryMutation.mutateAsync({
        auctionId,
        imageId,
      });
    } catch {
      // Mutation error is displayed
      // through setPrimaryMutation.error.
    }
  }

  async function handleDeleteImage(
    imageId: string,
  ) {
    if (!auctionId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this auction image?",
      );

    if (!confirmed) {
      return;
    }

    clearErrors("root");
    clearMutationErrors();

    try {
      await deleteImageMutation.mutateAsync({
        auctionId,
        imageId,
      });
    } catch {
      // Mutation error is displayed
      // through deleteImageMutation.error.
    }
  }

  const onSubmit =
    handleSubmit(
      async (
        values:
          AuctionFormValues,
      ) => {
        clearErrors("root");
        clearMutationErrors();

        const startDate =
          new Date(
            values.startTime,
          );

        const endDate =
          new Date(
            values.endTime,
          );

        const request:
          AuctionFormRequest = {
            title:
              values.title,

            description:
              values.description,

            startingPrice:
              Number(
                values.startingPrice,
              ),

            minimumBidIncrement:
              Number(
                values
                  .minimumBidIncrement,
              ),

            startTime:
              startDate.toISOString(),

            endTime:
              endDate.toISOString(),
          };

        try {
          if (
            editing &&
            auctionId
          ) {
            await updateMutation
              .mutateAsync({
                auctionId,
                request,
              });

            navigate(
              "/admin/auctions",
            );

            return;
          }

          const createdAuction =
            await createMutation
              .mutateAsync(
                request,
              );

          navigate(
            `/admin/auctions/${createdAuction.id}/images`,
            {
              state: {
                message:
                  "Auction created. You can now upload its images.",
              },
            },
          );
        } catch {
          // Mutation error is displayed
          // through the mutation state.
        }
      },
    );

  if (
    editing &&
    auctionQuery.isPending
  ) {
    return (
      <section className="auction-form-page">
        <LoadingState message="Loading auction..." />
      </section>
    );
  }

  if (
    editing &&
    (
      auctionQuery.isError ||
      !auction
    )
  ) {
    return (
      <section className="auction-form-page">
        <ErrorMessage
          message={
            auctionLoadError ||
            "Auction could not be loaded."
          }
          className="admin-message admin-error"
        />

        <Link
          className="secondary-button"
          to="/admin/auctions"
        >
          Back to Auctions
        </Link>
      </section>
    );
  }

  if (
    editing &&
    !auctionIsEditable
  ) {
    return (
      <section className="auction-form-page">
        <ErrorMessage
          message="This auction can no longer be edited."
          className="admin-message admin-error"
        />

        <Link
          className="secondary-button"
          to="/admin/auctions"
        >
          Back to Auctions
        </Link>
      </section>
    );
  }

  return (
    <section className="auction-form-page">
      <header className="auction-form-page-header">
        <div>
          <p className="admin-eyebrow">
            Administration
          </p>

          <h1>
            {editing
              ? "Edit Auction"
              : "Create Auction"}
          </h1>

          <p>
            Times are entered using your
            computer&apos;s local timezone.
          </p>
        </div>

        <Link
          className="secondary-button"
          to="/admin/auctions"
        >
          Back to Auctions
        </Link>
      </header>

      <section className="auction-editor">
        <form
          className="auction-form"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="auction-form-field auction-form-full">
            <label htmlFor="auction-title">
              Title
            </label>

            <input
              id="auction-title"
              type="text"
              maxLength={200}
              disabled={saving}
              aria-invalid={
                errors.title
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.title
                  ? "auction-title-error"
                  : undefined
              }
              {...register(
                "title",
              )}
            />

            {errors.title && (
              <p
                id="auction-title-error"
                className="error-message"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="auction-form-field auction-form-full">
            <label htmlFor="auction-description">
              Description
            </label>

            <textarea
              id="auction-description"
              rows={6}
              maxLength={5000}
              disabled={saving}
              aria-invalid={
                errors.description
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.description
                  ? "auction-description-error"
                  : undefined
              }
              {...register(
                "description",
              )}
            />

            {errors.description && (
              <p
                id="auction-description-error"
                className="error-message"
                role="alert"
              >
                {
                  errors.description
                    .message
                }
              </p>
            )}
          </div>

          <div className="auction-form-field">
            <label htmlFor="starting-price">
              Starting price
            </label>

            <input
              id="starting-price"
              type="number"
              min="0.01"
              step="0.01"
              disabled={saving}
              aria-invalid={
                errors.startingPrice
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.startingPrice
                  ? "starting-price-error"
                  : undefined
              }
              {...register(
                "startingPrice",
              )}
            />

            {errors.startingPrice && (
              <p
                id="starting-price-error"
                className="error-message"
                role="alert"
              >
                {
                  errors.startingPrice
                    .message
                }
              </p>
            )}
          </div>

          <div className="auction-form-field">
            <label htmlFor="minimum-increment">
              Minimum increment
            </label>

            <input
              id="minimum-increment"
              type="number"
              min="0.01"
              step="0.01"
              disabled={saving}
              aria-invalid={
                errors
                  .minimumBidIncrement
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors
                  .minimumBidIncrement
                  ? "minimum-increment-error"
                  : undefined
              }
              {...register(
                "minimumBidIncrement",
              )}
            />

            {errors.minimumBidIncrement && (
              <p
                id="minimum-increment-error"
                className="error-message"
                role="alert"
              >
                {
                  errors
                    .minimumBidIncrement
                    .message
                }
              </p>
            )}
          </div>

          <div className="auction-form-field">
            <label htmlFor="start-time">
              Start time
            </label>

            <input
              id="start-time"
              type="datetime-local"
              disabled={saving}
              aria-invalid={
                errors.startTime
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.startTime
                  ? "start-time-error"
                  : undefined
              }
              {...register(
                "startTime",
              )}
            />

            {errors.startTime && (
              <p
                id="start-time-error"
                className="error-message"
                role="alert"
              >
                {
                  errors.startTime
                    .message
                }
              </p>
            )}
          </div>

          <div className="auction-form-field">
            <label htmlFor="end-time">
              End time
            </label>

            <input
              id="end-time"
              type="datetime-local"
              disabled={saving}
              aria-invalid={
                errors.endTime
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.endTime
                  ? "end-time-error"
                  : undefined
              }
              {...register(
                "endTime",
              )}
            />

            {errors.endTime && (
              <p
                id="end-time-error"
                className="error-message"
                role="alert"
              >
                {errors.endTime.message}
              </p>
            )}
          </div>

          {displayedError && (
            <p
              className="admin-message admin-error auction-form-full"
              role="alert"
            >
              {displayedError}
            </p>
          )}

          <div className="auction-form-actions auction-form-full">
            <Link
              className="secondary-button"
              to="/admin/auctions"
            >
              Cancel
            </Link>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create Auction"}
            </button>
          </div>
        </form>

        {editing &&
          auctionId && (
          <section className="auction-image-manager">
            <div className="auction-image-manager-header">
              <div>
                <h2>
                  Auction Images
                </h2>

                <p>
                  Upload up to 8 JPEG,
                  PNG, or WebP images.
                  Maximum 5 MB each.
                </p>
              </div>

              <label className="auction-image-upload-button">
                {uploadMutation.isPending
                  ? "Uploading..."
                  : "Upload Images"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={
                    uploadMutation.isPending ||
                    images.length >= 8
                  }
                  onChange={(event) =>
                    void handleImageSelection(
                      event,
                    )
                  }
                />
              </label>
            </div>

            {imagesQuery.isPending ? (
              <LoadingState message="Loading images..." />
            ) : images.length === 0 ? (
              <div className="auction-images-empty">
                No images have been uploaded.
              </div>
            ) : (
              <div className="auction-image-grid">
                {images.map(
                  (image) => {
                    const settingPrimary =
                      setPrimaryMutation.isPending &&
                      setPrimaryMutation.variables
                        ?.imageId ===
                        image.id;

                    const deleting =
                      deleteImageMutation.isPending &&
                      deleteImageMutation.variables
                        ?.imageId ===
                        image.id;

                    const imageBusy =
                      settingPrimary ||
                      deleting;

                    return (
                      <article
                        className="auction-image-card"
                        key={image.id}
                      >
                        <img
                          src={resolveAuctionImageUrl(
                            image.url,
                          )}
                          alt={
                            image.originalFilename
                          }
                        />

                        <div className="auction-image-card-footer">
                          {image.primaryImage ? (
                            <span className="auction-primary-badge">
                              Primary
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                imageBusy
                              }
                              onClick={() =>
                                void handleSetPrimary(
                                  image.id,
                                )
                              }
                            >
                              {settingPrimary
                                ? "Updating..."
                                : "Set Primary"}
                            </button>
                          )}

                          <button
                            className="auction-image-delete"
                            type="button"
                            disabled={
                              imageBusy
                            }
                            onClick={() =>
                              void handleDeleteImage(
                                image.id,
                              )
                            }
                          >
                            {deleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            )}
          </section>
        )}
      </section>
    </section>
  );
}

export default AuctionFormPage;