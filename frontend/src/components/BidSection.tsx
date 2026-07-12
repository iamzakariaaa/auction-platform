import {
  type SyntheticEvent,
} from "react";
import { Link } from "react-router-dom";

import ErrorMessage from
  "./ErrorMessage";
import SuccessMessage from
  "./SuccessMessage";

import {
  formatMoney,
} from "../utils/formats";

interface BidSectionProps {
  authenticated: boolean;
  canBid: boolean;
  bidAmount: string;
  minimumNextBid: number;
  submittingBid: boolean;
  errorMessage: string;
  successMessage: string;
  onBidAmountChange: (
    value: string,
  ) => void;
  onSubmit: (
    event: SyntheticEvent<
      HTMLFormElement,
      SubmitEvent
    >,
  ) => void;
}

function BidSection({
  authenticated,
  canBid,
  bidAmount,
  minimumNextBid,
  submittingBid,
  errorMessage,
  successMessage,
  onBidAmountChange,
  onSubmit,
}: BidSectionProps) {
  return (
    <section className="bid-section">
      <h2>Place a bid</h2>

      {!authenticated ? (
        <p>
          <Link to="/login">
            Log in
          </Link>{" "}
          to place a bid.
        </p>
      ) : !canBid ? (
        <p>
          Bidding is not currently
          available.
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <label htmlFor="bidAmount">
            Bid amount
          </label>

          <input
            id="bidAmount"
            type="number"
            min={minimumNextBid}
            step="0.01"
            value={bidAmount}
            onChange={(event) =>
              onBidAmountChange(
                event.target.value,
              )
            }
            placeholder={minimumNextBid.toFixed(
              2,
            )}
            required
          />

          <p className="minimum-bid">
            Minimum next bid:{" "}
            {formatMoney(minimumNextBid)}
          </p>

          <button
            type="submit"
            disabled={submittingBid}
          >
            {submittingBid
              ? "Placing bid..."
              : "Place bid"}
          </button>
        </form>
      )}

      <ErrorMessage
        message={errorMessage}
      />

      <SuccessMessage
        message={successMessage}
      />
    </section>
  );
}

export default BidSection;