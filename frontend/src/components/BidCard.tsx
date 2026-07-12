import { Link } from "react-router-dom";

import type {
  UserBidResponse,
} from "../types/bid";

import {
  formatDateTime,
  formatMoney,
} from "../utils/formats";

interface BidCardProps {
  bid: UserBidResponse;
}

function BidCard({
  bid,
}: BidCardProps) {
  return (
    <article className="bid-card">
      <div className="bid-card-heading">
        <div>
          <p className="bid-label">
            {bid.auctionTitle}
          </p>

          <h2>
            {formatMoney(
              bid.bidAmount,
            )}
          </h2>
        </div>

        <span
          className={
            bid.leading
              ? "bid-status bid-status-leading"
              : "bid-status bid-status-outbid"
          }
        >
          {bid.leading
            ? "Leading"
            : "Outbid"}
        </span>
      </div>

      <dl className="bid-details">
        <div>
          <dt>Your bid</dt>

          <dd>
            {formatMoney(
              bid.bidAmount,
            )}
          </dd>
        </div>

        <div>
          <dt>Current price</dt>

          <dd>
            {formatMoney(
              bid.currentPrice,
            )}
          </dd>
        </div>

        <div>
          <dt>Auction status</dt>

          <dd>
            {bid.auctionStatus}
          </dd>
        </div>

        <div>
          <dt>Auction ends</dt>

          <dd>
            {formatDateTime(
              bid.auctionEndTime,
            )}
          </dd>
        </div>

        <div>
          <dt>Bid placed</dt>

          <dd>
            {formatDateTime(
              bid.createdAt,
            )}
          </dd>
        </div>
      </dl>

      <Link
        className="auction-details-link"
        to={`/auctions/${bid.auctionId}`}
      >
        View auction
      </Link>
    </article>
  );
}

export default BidCard;