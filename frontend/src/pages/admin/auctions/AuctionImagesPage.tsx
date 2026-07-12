import {
  type ChangeEvent,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../../api/getApiErrorMessage";

import AuctionImageCard from
  "../../../components/AuctionImageCard";
import EmptyState from
  "../../../components/EmptyState";
import ErrorMessage from
  "../../../components/ErrorMessage";
import LoadingState from
  "../../../components/LoadingState";
import SuccessMessage from
  "../../../components/SuccessMessage";

import useDeleteAuctionImageMutation from
  "../../../hooks/mutations/useDeleteAuctionImageMutation";
import useSetPrimaryAuctionImageMutation from
  "../../../hooks/mutations/useSetPrimaryAuctionImageMutation";
import useUploadAuctionImagesMutation from
  "../../../hooks/mutations/useUploadAuctionImagesMutation";
import useAuctionImagesQuery from
  "../../../hooks/queries/useAuctionImagesQuery";

import "./AuctionImagesPage.css";

interface LocationState {
  message?: string;
}

function AuctionImagesPage() {
  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const location = useLocation();

  const locationState =
    location.state as
      | LocationState
      | null;

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    actionErrorMessage,
    setActionErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    locationState?.message ?? "",
  );

  const imagesQuery =
    useAuctionImagesQuery(
      auctionId,
    );

  const uploadMutation =
    useUploadAuctionImagesMutation();

  const setPrimaryMutation =
    useSetPrimaryAuctionImageMutation();

  const deleteMutation =
    useDeleteAuctionImageMutation();

  const images =
    imagesQuery.data ?? [];

  const queryErrorMessage =
    imagesQuery.isError
      ? getApiErrorMessage(
          imagesQuery.error,
          "Unable to load auction images.",
        )
      : "";

  const displayedErrorMessage =
    actionErrorMessage ||
    queryErrorMessage;

  async function handleUpload(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    event.target.value = "";

    if (
      !auctionId ||
      files.length === 0
    ) {
      return;
    }

    if (
      images.length +
        files.length >
      8
    ) {
      setActionErrorMessage(
        "An auction cannot contain more than 8 images.",
      );
      return;
    }

    setActionErrorMessage("");
    setSuccessMessage("");

    try {
      await uploadMutation.mutateAsync({
        auctionId,
        files,
      });

      setSuccessMessage(
        files.length === 1
          ? "Image uploaded successfully."
          : `${files.length} images uploaded successfully.`,
      );
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to upload one or more images.",
        ),
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  async function handleSetPrimary(
    imageId: string,
  ) {
    if (!auctionId) {
      return;
    }

    setActionErrorMessage("");
    setSuccessMessage("");

    try {
      await setPrimaryMutation.mutateAsync({
        auctionId,
        imageId,
      });

      setSuccessMessage(
        "Primary image updated.",
      );
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to set the primary image.",
        ),
      );
    }
  }

  async function handleDelete(
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

    setActionErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteMutation.mutateAsync({
        auctionId,
        imageId,
      });

      setSuccessMessage(
        "Image deleted successfully.",
      );
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to delete the image.",
        ),
      );
    }
  }

  if (!auctionId) {
    return (
      <main className="auction-images-page">
        <ErrorMessage
          message="The auction identifier is missing."
        />
      </main>
    );
  }

  return (
    <main className="auction-images-page">
      <header className="auction-images-header">
        <div>
          <p className="eyebrow">
            Admin
          </p>

          <h1>
            Manage Auction Images
          </h1>

          <p>
            Upload up to eight JPEG,
            PNG, or WebP images.
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

      <ErrorMessage
        message={
          displayedErrorMessage
        }
      />

      <SuccessMessage
        message={successMessage}
      />

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
            uploadMutation.isPending ||
            images.length >= 8
          }
        />

        <p>
          {images.length} of 8 images
          uploaded
        </p>

        {uploadMutation.isPending && (
          <LoadingState message="Uploading images..." />
        )}
      </section>

      {imagesQuery.isPending ? (
        <LoadingState message="Loading images..." />
      ) : imagesQuery.isError &&
        images.length === 0 ? (
        <EmptyState
          title="Images unavailable"
          message="The auction images could not be loaded."
        />
      ) : images.length === 0 ? (
        <EmptyState
          title="No images uploaded"
          message="Upload the first image for this auction."
        />
      ) : (
        <section className="auction-images-grid">
          {images.map((image) => {
            const settingPrimary =
              setPrimaryMutation.isPending &&
              setPrimaryMutation.variables
                ?.imageId === image.id;

            const deleting =
              deleteMutation.isPending &&
              deleteMutation.variables
                ?.imageId === image.id;

            return (
              <AuctionImageCard
                key={image.id}
                image={image}
                busy={
                  settingPrimary ||
                  deleting
                }
                onSetPrimary={(
                  selectedImageId,
                ) =>
                  void handleSetPrimary(
                    selectedImageId,
                  )
                }
                onDelete={(
                  selectedImageId,
                ) =>
                  void handleDelete(
                    selectedImageId,
                  )
                }
              />
            );
          })}
        </section>
      )}
    </main>
  );
}

export default AuctionImagesPage;