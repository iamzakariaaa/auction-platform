import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteAuctionImage,
  getAuctionImages,
  resolveAuctionImageUrl,
  setPrimaryAuctionImage,
  uploadAuctionImage,
} from "../api/auctionApi";
import type { AuctionImage } from "../types/auction";
import "./AuctionImagesPage.css";

export default function AuctionImagesPage() {
  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<
    AuctionImage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] =
    useState(false);

  const [busyImageId, setBusyImageId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!auctionId) {
      setErrorMessage(
        "The auction identifier is missing.",
      );
      setLoading(false);
      return;
    }

    void loadImages();
  }, [auctionId]);

  async function loadImages() {
    if (!auctionId) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await getAuctionImages(auctionId);

      setImages(response);
    } catch {
      setErrorMessage(
        "Unable to load auction images.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (!auctionId || files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setErrorMessage("");

      for (const file of files) {
        await uploadAuctionImage(
          auctionId,
          file,
        );
      }

      await loadImages();
    } catch {
      setErrorMessage(
        "Unable to upload one or more images.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSetPrimary(
    imageId: string,
  ) {
    if (!auctionId) {
      return;
    }

    try {
      setBusyImageId(imageId);
      setErrorMessage("");

      await setPrimaryAuctionImage(
        auctionId,
        imageId,
      );

      await loadImages();
    } catch {
      setErrorMessage(
        "Unable to set the primary image.",
      );
    } finally {
      setBusyImageId(null);
    }
  }

  async function handleDelete(
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
      setBusyImageId(imageId);
      setErrorMessage("");

      await deleteAuctionImage(
        auctionId,
        imageId,
      );

      await loadImages();
    } catch {
      setErrorMessage(
        "Unable to delete the image.",
      );
    } finally {
      setBusyImageId(null);
    }
  }

  return (
    <main className="auction-images-page">
      <header className="auction-images-header">
        <div>
          <p className="eyebrow">
            Admin
          </p>

          <h1>Manage Auction Images</h1>

          <p>
            Upload up to eight JPEG, PNG, or
            WebP images.
          </p>
        </div>

        <div className="auction-images-header-actions">
          <Link
            className="secondary-button"
            to={`/admin/auctions/${auctionId}/edit`}
          >
            Edit Auction Details
          </Link>

          <Link
            className="secondary-button"
            to="/admin/auctions"
          >
            Back to Auctions
          </Link>
        </div>
      </header>

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <section className="auction-images-upload">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) =>
            void handleUpload(event)
          }
          disabled={
            uploading || images.length >= 8
          }
        />

        <p>
          {images.length} of 8 images uploaded
        </p>

        {uploading && (
          <p>Uploading images...</p>
        )}
      </section>

      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <section className="auction-images-empty">
          <h2>No images uploaded</h2>

          <p>
            Upload the first image for this
            auction.
          </p>
        </section>
      ) : (
        <section className="auction-images-grid">
          {images.map((image) => {
            const busy =
              busyImageId === image.id;

            return (
              <article
                className="auction-image-card"
                key={image.id}
              >
                <div className="auction-image-preview">
                  <img
                    src={resolveAuctionImageUrl(
                      image.url,
                    )}
                    alt={
                      image.originalFilename
                    }
                  />

                  {image.primaryImage && (
                    <span className="primary-image-badge">
                      Primary
                    </span>
                  )}
                </div>

                <div className="auction-image-details">
                  <strong>
                    {image.originalFilename}
                  </strong>

                  <span>
                    {Math.round(
                      image.fileSize / 1024,
                    )}{" "}
                    KB
                  </span>
                </div>

                <div className="auction-image-actions">
                  {!image.primaryImage && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void handleSetPrimary(
                          image.id,
                        )
                      }
                    >
                      {busy
                        ? "Updating..."
                        : "Set as Primary"}
                    </button>
                  )}

                  <button
                    className="danger-button"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void handleDelete(
                        image.id,
                      )
                    }
                  >
                    {busy
                      ? "Working..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}