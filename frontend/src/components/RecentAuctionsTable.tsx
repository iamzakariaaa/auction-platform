import { Link } from "react-router-dom";

import {
  resolveAuctionImageUrl,
} from "../api/auctionApi";

import AuctionStatusBadge from
  "./AuctionStatusBadge";
import EmptyState from
  "./EmptyState";

import type {
  AuctionSummary,
} from "../types/auction";

import {
  formatDateTime,
  formatMoney,
} from "../utils/formats";

interface RecentAuctionsTableProps {
  auctions: AuctionSummary[];
}

function RecentAuctionsTable({
  auctions,
}: RecentAuctionsTableProps) {
  if (auctions.length === 0) {
    return (
      <EmptyState
        message="No auctions have been created yet."
      />
    );
  }

  return (
    <div className="dashboard-table-wrapper">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Auction</th>
            <th>Status</th>
            <th>Current price</th>
            <th>Starts</th>
            <th>Ends</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {auctions.map((auction) => (
            <tr key={auction.id}>
              <td>
                <div className="dashboard-auction-thumbnail">
                  {auction.primaryImageUrl ? (
                    <img
                      src={resolveAuctionImageUrl(
                        auction.primaryImageUrl,
                      )}
                      alt={auction.title}
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
              </td>

              <td>
                <strong>
                  {auction.title}
                </strong>
              </td>

              <td>
                <AuctionStatusBadge
                  status={auction.status}
                  className="dashboard-status"
                />
              </td>

              <td>
                {formatMoney(
                  auction.currentPrice,
                )}
              </td>

              <td>
                {formatDateTime(
                  auction.startTime,
                )}
              </td>

              <td>
                {formatDateTime(
                  auction.endTime,
                )}
              </td>

              <td>
                <div className="dashboard-table-actions">
                  <Link
                    to={`/auctions/${auction.id}`}
                  >
                    View
                  </Link>

                  <Link
                    to={`/admin/auctions/${auction.id}/bids`}
                  >
                    Bids
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentAuctionsTable;