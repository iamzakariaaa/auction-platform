import {
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createAuction,
  deleteAuctionImage,
  getAuctionDetails,
  getAuctionImages,
  resolveAuctionImageUrl,
  setPrimaryAuctionImage,
  updateAuction,
  uploadAuctionImage,
} from "../api/auctionApi";
import type {
  AuctionFormRequest,
  AuctionImage,
} from "../types/auction";
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

function toLocalDateTimeInput(
  value: string,
): string {
  const date = new Date(value);

  const timezoneOffsetMilliseconds =
    date.getTimezoneOffset() * 60_000;

  return new Date(
    date.getTime() - timezoneOffsetMilliseconds,
  )
    .toISOString()
    .slice(0, 16);
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      error.response?.data?.message;

    if (typeof responseMessage === "string") {
      return responseMessage;
    }

    if (typeof error.response?.data === "string") {
      return error.response.data;
    }
  }

  return fallback;
}

function AuctionFormPage() {
  const navigate = useNavigate();

  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const editing = auctionId !== undefined;

  const [form, setForm] =
    useState<AuctionFormState>(EMPTY_FORM);
  
  const [images, setImages] =
  useState<AuctionImage[]>([]);

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [changingImageId, setChangingImageId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!auctionId) {
      setLoading(false);
      return;
    }

    const selectedAuctionId = auctionId;

    async function loadAuction() {
      try {
        setLoading(true);
        setErrorMessage("");

        const auction =
          await getAuctionDetails(
            selectedAuctionId,
          );

        const editable =
          auction.status === "DRAFT" ||
          (
            auction.status === "SCHEDULED" &&
            new Date(
              auction.startTime,
            ).getTime() > Date.now()
          );

        if (!editable) {
          setErrorMessage(
            "This auction can no longer be edited.",
          );
          return;
        }

        setForm({
          title: auction.title,
          description: auction.description,
          startingPrice:
            auction.startingPrice.toString(),
          minimumBidIncrement:
            auction.minimumBidIncrement.toString(),
          startTime: toLocalDateTimeInput(
            auction.startTime,
          ),
          endTime: toLocalDateTimeInput(
            auction.endTime,
          ),
        });

        const auctionImages =
      await getAuctionImages(
        selectedAuctionId,
      );

    setImages(auctionImages);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load this auction.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuction();
  }, [auctionId]);

  function updateField(
    field: keyof AuctionFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

async function handleImageSelection(
  event: React.ChangeEvent<HTMLInputElement>,
) {
  if (!auctionId) {
    return;
  }

  const selectedFiles =
    Array.from(event.target.files ?? []);

  event.target.value = "";

  if (selectedFiles.length === 0) {
    return;
  }

  if (
    images.length + selectedFiles.length >
    8
  ) {
    setErrorMessage(
      "An auction cannot contain more than 8 images.",
    );
    return;
  }

  try {
    setUploadingImages(true);
    setErrorMessage("");

    for (const file of selectedFiles) {
      const uploaded =
        await uploadAuctionImage(
          auctionId,
          file,
        );

      setImages((current) => [
        ...current,
        uploaded,
      ]);
    }
  } catch (error) {
    setErrorMessage(
      getErrorMessage(
        error,
        "Unable to upload the image.",
      ),
    );
  } finally {
    setUploadingImages(false);
  }
}

async function handleSetPrimary(
  imageId: string,
) {
  if (!auctionId) {
    return;
  }

  try {
    setChangingImageId(imageId);
    setErrorMessage("");

    await setPrimaryAuctionImage(
      auctionId,
      imageId,
    );

    setImages((current) =>
      current.map((image) => ({
        ...image,
        primaryImage:
          image.id === imageId,
      })),
    );
  } catch (error) {
    setErrorMessage(
      getErrorMessage(
        error,
        "Unable to select the primary image.",
      ),
    );
  } finally {
    setChangingImageId(null);
  }
}

  async function handleDeleteImage(
    imageId: string,
  ) {
    if (!auctionId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this auction image?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingImageId(imageId);
      setErrorMessage("");

      await deleteAuctionImage(
        auctionId,
        imageId,
      );

      const remaining =
        await getAuctionImages(auctionId);

      setImages(remaining);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to delete the image.",
        ),
      );
    } finally {
      setChangingImageId(null);
    }
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    const title = form.title.trim();
    const description =
      form.description.trim();

    const startingPrice =
      Number(form.startingPrice);

    const minimumBidIncrement =
      Number(form.minimumBidIncrement);

    if (
      !title ||
      !description ||
      !form.startTime ||
      !form.endTime
    ) {
      setErrorMessage(
        "Please complete all fields.",
      );
      return;
    }

    if (
      !Number.isFinite(startingPrice) ||
      startingPrice <= 0
    ) {
      setErrorMessage(
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
      setErrorMessage(
        "Minimum bid increment must be greater than zero.",
      );
      return;
    }

    const startDate =
      new Date(form.startTime);

    const endDate =
      new Date(form.endTime);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setErrorMessage(
        "Please enter valid auction dates.",
      );
      return;
    }

    if (endDate <= startDate) {
      setErrorMessage(
        "End time must be after start time.",
      );
      return;
    }

    if (
      !editing &&
      endDate.getTime() <= Date.now()
    ) {
      setErrorMessage(
        "The auction end time must be in the future.",
      );
      return;
    }

    const request: AuctionFormRequest = {
      title,
      description,
      startingPrice,
      minimumBidIncrement,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    try {
      setSaving(true);

      if (auctionId) {
      await updateAuction(
        auctionId,
        request,
      );

      navigate("/admin/auctions", {
        replace: true,
      });
    } else {
      const createdAuction =
        await createAuction(request);

      navigate(
        `/admin/auctions/${createdAuction.id}/edit`,
        {
          replace: true,
          state: {
            message:
              "Auction created. You can now upload images.",
          },
        },
      );
    }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          editing
            ? "Unable to update the auction."
            : "Unable to create the auction.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="auction-form-page">
        <p>Loading auction...</p>
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
          onSubmit={handleSubmit}
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
              value={form.startingPrice}
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

          {errorMessage && (
            <p
              className="admin-message admin-error auction-form-full"
              role="alert"
            >
              {errorMessage}
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
        {editing && auctionId && (
          <section className="auction-image-manager">
            <div className="auction-image-manager-header">
              <div>
                <h2>Auction Images</h2>

                <p>
                  Upload up to 8 JPEG, PNG, or WebP
                  images. Maximum 5 MB each.
                </p>
              </div>

              <label className="auction-image-upload-button">
                {uploadingImages
                  ? "Uploading..."
                  : "Upload Images"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={
                    uploadingImages ||
                    images.length >= 8
                  }
                  onChange={(event) =>
                    void handleImageSelection(event)
                  }
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="auction-images-empty">
                No images have been uploaded.
              </div>
            ) : (
              <div className="auction-image-grid">
                {images.map((image) => (
                  <article
                    className="auction-image-card"
                    key={image.id}
                  >
                    <img
                      src={resolveAuctionImageUrl(
                        image.url,
                      )}
                      alt={image.originalFilename}
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
                            changingImageId !== null
                          }
                          onClick={() =>
                            void handleSetPrimary(
                              image.id,
                            )
                          }
                        >
                          Set Primary
                        </button>
                      )}

                      <button
                        className="auction-image-delete"
                        type="button"
                        disabled={
                          changingImageId !== null
                        }
                        onClick={() =>
                          void handleDeleteImage(
                            image.id,
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </section>
  );
}

export default AuctionFormPage;