import { Link } from "react-router-dom";

import {
  resolveAuctionImageUrl,
} from "../api/auctionApi";

import type {
  AuctionSummary,
} from "../types/auction";

import {
  formatMoney,
} from "../utils/formats";

interface AuctionCardProps {
  auction: AuctionSummary;
}

function AuctionCard({
  auction,
}: AuctionCardProps) {
  return (
    <article className="auction-card">
      <div className="auction-card-image-wrapper">
        {auction.primaryImageUrl ? (
          <img
            className="auction-card-image"
            src={resolveAuctionImageUrl(
              auction.primaryImageUrl,
            )}
            alt={auction.title}
            loading="lazy"
          />
        ) : (
          <div className="auction-card-placeholder">
            No image
          </div>
        )}
      </div>

      <span
        className={`auction-card-status auction-card-status-${auction.status.toLowerCase()}`}
      >
        {auction.status}
      </span>

      <h2>{auction.title}</h2>

      <p className="auction-card-price-label">
        Current price
      </p>

      <strong className="auction-card-price">
        {formatMoney(
          auction.currentPrice,
        )}
      </strong>

      <div className="auction-card-actions">
        <Link
          to={`/auctions/${auction.id}`}
        >
          View auction
        </Link>
      </div>
    </article>
  );
}

export default AuctionCard;