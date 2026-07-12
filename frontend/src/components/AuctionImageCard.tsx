import {
  resolveAuctionImageUrl,
} from "../api/auctionApi";

import type {
  AuctionImage,
} from "../types/auction";

interface AuctionImageCardProps {
  image: AuctionImage;
  busy: boolean;
  onSetPrimary: (
    imageId: string,
  ) => void;
  onDelete: (
    imageId: string,
  ) => void;
}

function AuctionImageCard({
  image,
  busy,
  onSetPrimary,
  onDelete,
}: AuctionImageCardProps) {
  return (
    <article className="auction-image-card">
      <div className="auction-image-preview">
        <img
          src={resolveAuctionImageUrl(
            image.url,
          )}
          alt={image.originalFilename}
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
              onSetPrimary(image.id)
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
            onDelete(image.id)
          }
        >
          {busy
            ? "Working..."
            : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default AuctionImageCard;