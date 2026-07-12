import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  resolveAuctionImageUrl,
} from "../api/auctionApi";

import AuctionStatusBadge from
  "./AuctionStatusBadge";

import type {
  AuctionSummary,
} from "../types/auction";

import {
  formatDateTime,
  formatMoney,
} from "../utils/formats";

interface AdminAuctionCardProps {
  auction: AuctionSummary;
  editable: boolean;
  cancellable: boolean;
  deleting: boolean;
  cancelling: boolean;
  onDelete: (
    auction: AuctionSummary,
  ) => void;
  onCancel: (
    auction: AuctionSummary,
  ) => void;
}

function AdminAuctionCard({
  auction,
  editable,
  cancellable,
  deleting,
  cancelling,
  onDelete,
  onCancel,
}: AdminAuctionCardProps) {
  const navigate = useNavigate();

  const busy =
    deleting || cancelling;

  return (
    <article className="admin-auction-card">
      <div className="admin-auction-card-top">
        <div className="admin-auction-thumbnail">
          {auction.primaryImageUrl ? (
            <img
              src={resolveAuctionImageUrl(
                auction.primaryImageUrl,
              )}
              alt={auction.title}
            />
          ) : (
            <div className="admin-auction-thumbnail-placeholder">
              No image
            </div>
          )}
        </div>

        <div className="admin-auction-card-heading">
          <div>
            <AuctionStatusBadge
              status={auction.status}
            />

            <h3>{auction.title}</h3>
          </div>

          <strong>
            {formatMoney(
              auction.currentPrice,
            )}
          </strong>
        </div>
      </div>

      <dl className="admin-auction-details">
        <div>
          <dt>Starts</dt>

          <dd>
            {formatDateTime(
              auction.startTime,
            )}
          </dd>
        </div>

        <div>
          <dt>Ends</dt>

          <dd>
            {formatDateTime(
              auction.endTime,
            )}
          </dd>
        </div>
      </dl>

      <div className="admin-card-actions">
        <Link
          className="view-link"
          to={`/auctions/${auction.id}`}
        >
          View
        </Link>

        <Link
          className="view-link"
          to={`/admin/auctions/${auction.id}/bids`}
        >
          View Bids
        </Link>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/auctions/${auction.id}/images`,
            )
          }
          disabled={busy}
        >
          Manage Images
        </button>

        {editable && (
          <>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/auctions/${auction.id}/edit`,
                )
              }
              disabled={busy}
            >
              Edit
            </button>

            <button
              className="danger-button"
              type="button"
              onClick={() =>
                onDelete(auction)
              }
              disabled={busy}
            >
              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>
          </>
        )}

        {cancellable && (
          <button
            className="cancel-button"
            type="button"
            onClick={() =>
              onCancel(auction)
            }
            disabled={busy}
          >
            {cancelling
              ? "Cancelling..."
              : "Cancel Auction"}
          </button>
        )}
      </div>
    </article>
  );
}

export default AdminAuctionCard;