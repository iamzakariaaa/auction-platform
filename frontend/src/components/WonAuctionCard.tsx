import { Link } from "react-router-dom";

import type {
  WonAuction,
} from "../types/auction";

import {
  formatDateTime,
  formatMoney,
} from "../utils/formats";

interface WonAuctionCardProps {
  auction: WonAuction;
}

function WonAuctionCard({
  auction,
}: WonAuctionCardProps) {
  return (
    <article className="won-auction-card">
      <div className="won-auction-heading">
        <div>
          <p className="won-auction-label">
            Winning auction
          </p>

          <h2>{auction.title}</h2>
        </div>

        <span className="won-badge">
          Won
        </span>
      </div>

      <dl className="won-auction-details">
        <div>
          <dt>Winning amount</dt>

          <dd>
            {auction.winningAmount ===
            null
              ? "Not available"
              : formatMoney(
                  auction.winningAmount,
                )}
          </dd>
        </div>

        <div>
          <dt>Ended</dt>

          <dd>
            {formatDateTime(
              auction.endedAt,
            )}
          </dd>
        </div>

        <div>
          <dt>Winning bid</dt>

          <dd>
            {auction.winningBidId
              ? auction.winningBidId.slice(
                  0,
                  8,
                )
              : "Not available"}
          </dd>
        </div>
      </dl>

      <Link
        className="won-auction-link"
        to={`/auctions/${auction.auctionId}`}
      >
        View auction
      </Link>
    </article>
  );
}

export default WonAuctionCard;