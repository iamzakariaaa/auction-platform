import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../../api/getApiErrorMessage";

import {
  resolveAuctionImageUrl,
} from "../../../api/auctionApi";

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

import type {
  AuctionFormRequest,
} from "../../../types/auction";

import {
  toLocalDateTimeInput,
} from "../../../utils/formats";

import "./AuctionFormPage.css";

interface AuctionFormState {
  title: string;
  description: string;
  startingPrice: string;
  minimumBidIncrement: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: AuctionFormState = {
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

  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const editing =
    auctionId !== undefined;

  const initializedAuctionIdRef =
    useRef<string | null>(null);

  const [form, setForm] =
    useState<AuctionFormState>(
      EMPTY_FORM,
    );

  const [
    validationError,
    setValidationError,
  ] = useState("");

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
      initializedAuctionIdRef.current ===
      auctionId
    ) {
      return;
    }

    setForm({
      title: auction.title,

      description:
        auction.description,

      startingPrice:
        auction.startingPrice.toString(),

      minimumBidIncrement:
        auction.minimumBidIncrement.toString(),

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
    validationError ||
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

  function updateField(
    field: keyof AuctionFormState,
    value: string,
  ) {
    setValidationError("");
    clearMutationErrors();

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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
      setValidationError(
        "An auction cannot contain more than 8 images.",
      );
      return;
    }

    setValidationError("");
    clearMutationErrors();

    try {
      await uploadMutation.mutateAsync({
        auctionId,
        files: selectedFiles,
      });
    } catch {
      // The mutation error is displayed
      // through uploadMutation.error.
    }
  }

  async function handleSetPrimary(
    imageId: string,
  ) {
    if (!auctionId) {
      return;
    }

    setValidationError("");
    clearMutationErrors();

    try {
      await setPrimaryMutation.mutateAsync({
        auctionId,
        imageId,
      });
    } catch {
      // The mutation error is displayed
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

    setValidationError("");
    clearMutationErrors();

    try {
      await deleteImageMutation.mutateAsync({
        auctionId,
        imageId,
      });
    } catch {
      // The mutation error is displayed
      // through deleteImageMutation.error.
    }
  }

  async function handleSubmit(
    event:
      SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setValidationError("");
    clearMutationErrors();

    const title =
      form.title.trim();

    const description =
      form.description.trim();

    const startingPrice =
      Number(
        form.startingPrice,
      );

    const minimumBidIncrement =
      Number(
        form.minimumBidIncrement,
      );

    if (
      !title ||
      !description ||
      !form.startTime ||
      !form.endTime
    ) {
      setValidationError(
        "Please complete all fields.",
      );
      return;
    }

    if (
      !Number.isFinite(
        startingPrice,
      ) ||
      startingPrice <= 0
    ) {
      setValidationError(
        "Starting price must be greater than zero.",
      );
      return;
    }

    if (
      !Number.isFinite(
        minimumBidIncrement,
      ) ||
      minimumBidIncrement <= 0
    ) {
      setValidationError(
        "Minimum bid increment must be greater than zero.",
      );
      return;
    }

    const startDate =
      new Date(
        form.startTime,
      );

    const endDate =
      new Date(
        form.endTime,
      );

    if (
      Number.isNaN(
        startDate.getTime(),
      ) ||
      Number.isNaN(
        endDate.getTime(),
      )
    ) {
      setValidationError(
        "Please enter valid auction dates.",
      );
      return;
    }

    if (endDate <= startDate) {
      setValidationError(
        "End time must be after start time.",
      );
      return;
    }

    if (
      !editing &&
      endDate.getTime() <= Date.now()
    ) {
      setValidationError(
        "The auction end time must be in the future.",
      );
      return;
    }

    const request:
      AuctionFormRequest = {
        title,
        description,
        startingPrice,
        minimumBidIncrement,

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
        await updateMutation.mutateAsync({
          auctionId,
          request,
        });

        navigate(
          "/admin/auctions",
        );

        return;
      }

      const createdAuction =
        await createMutation.mutateAsync(
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
      // The relevant mutation error is
      // displayed through the mutation state.
    }
  }

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
          onSubmit={
            handleSubmit
          }
        >
          <div className="auction-form-field auction-form-full">
            <label htmlFor="auction-title">
              Title
            </label>

            <input
              id="auction-title"
              name="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              maxLength={200}
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field auction-form-full">
            <label htmlFor="auction-description">
              Description
            </label>

            <textarea
              id="auction-description"
              name="description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              rows={6}
              maxLength={5000}
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="starting-price">
              Starting price
            </label>

            <input
              id="starting-price"
              name="startingPrice"
              type="number"
              min="0.01"
              step="0.01"
              value={
                form.startingPrice
              }
              onChange={(event) =>
                updateField(
                  "startingPrice",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="minimum-increment">
              Minimum increment
            </label>

            <input
              id="minimum-increment"
              name="minimumBidIncrement"
              type="number"
              min="0.01"
              step="0.01"
              value={
                form.minimumBidIncrement
              }
              onChange={(event) =>
                updateField(
                  "minimumBidIncrement",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="start-time">
              Start time
            </label>

            <input
              id="start-time"
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={(event) =>
                updateField(
                  "startTime",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="end-time">
              End time
            </label>

            <input
              id="end-time"
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={(event) =>
                updateField(
                  "endTime",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
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