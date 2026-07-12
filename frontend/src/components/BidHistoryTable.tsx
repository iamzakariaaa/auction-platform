import type {
  AuctionDetails,
} from "../types/auction";

import type {
  BidResponse,
} from "../types/bid";

import {
  formatDateTime,
  formatMoney,
} from "../utils/formats";

interface BidHistoryTableProps {
  auction: AuctionDetails;
  bids: BidResponse[];
}

function BidHistoryTable({
  auction,
  bids,
}: BidHistoryTableProps) {
  if (bids.length === 0) {
    return (
      <div className="admin-bids-empty">
        No bids have been placed.
      </div>
    );
  }

  return (
    <div className="admin-bids-table-wrapper">
      <table className="admin-bids-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Bidder</th>
            <th>Amount</th>
            <th>Placed</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          {bids.map((bid, index) => {
            const isHighest =
              index === 0;

            const isWinning =
              auction.status ===
                "ENDED" &&
              auction.winningBidId ===
                bid.id;

            return (
              <tr key={bid.id}>
                <td>#{index + 1}</td>

                <td>
                  {bid.bidderName}
                </td>

                <td>
                  {formatMoney(
                    bid.amount,
                  )}
                </td>

                <td>
                  {formatDateTime(
                    bid.createdAt,
                  )}
                </td>

                <td>
                  {isWinning ? (
                    <span className="bid-result bid-result-winner">
                      Winner
                    </span>
                  ) : isHighest &&
                    auction.status ===
                      "ACTIVE" ? (
                    <span className="bid-result bid-result-leading">
                      Leading
                    </span>
                  ) : (
                    <span className="bid-result bid-result-outbid">
                      Outbid
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BidHistoryTable;