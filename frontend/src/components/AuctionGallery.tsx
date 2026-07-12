import {
  resolveAuctionImageUrl,
} from "../api/auctionApi";

import type {
  AuctionImage,
} from "../types/auction";

interface AuctionGalleryProps {
  title: string;
  images: AuctionImage[];
  selectedImageId: string | null;
  onSelectImage: (
    imageId: string,
  ) => void;
}

function AuctionGallery({
  title,
  images,
  selectedImageId,
  onSelectImage,
}: AuctionGalleryProps) {
  const selectedImage =
    images.find(
      (image) =>
        image.id === selectedImageId,
    ) ?? images[0];

  if (!selectedImage) {
    return (
      <div className="auction-details-placeholder">
        No images available
      </div>
    );
  }

  return (
    <section className="auction-gallery">
      <div className="auction-gallery-main">
        <img
          src={resolveAuctionImageUrl(
            selectedImage.url,
          )}
          alt={title}
        />
      </div>

      {images.length > 1 && (
        <div className="auction-gallery-thumbnails">
          {images.map((image) => (
            <button
              className={
                image.id === selectedImage.id
                  ? "auction-gallery-thumbnail auction-gallery-thumbnail-selected"
                  : "auction-gallery-thumbnail"
              }
              type="button"
              key={image.id}
              onClick={() =>
                onSelectImage(image.id)
              }
            >
              <img
                src={resolveAuctionImageUrl(
                  image.url,
                )}
                alt=""
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default AuctionGallery;