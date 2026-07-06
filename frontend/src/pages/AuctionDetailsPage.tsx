import {
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { getAuctionDetails } from "../api/auctionApi";
import { placeBid } from "../api/bidApi";
import type { AuctionDetails } from "../types/auction";
import type { BidPlacedMessage } from "../types/bid";
import "./AuctionDetailsPage.css";

function AuctionDetailsPage() {
  const { auctionId } = useParams();

  const [auction, setAuction] =
    useState<AuctionDetails | null>(null);

  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingBid, setSubmittingBid] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [bidMessage, setBidMessage] =
    useState("");

  const accessToken =
    localStorage.getItem("accessToken");

  useEffect(() => {
    async function loadAuction() {
      if (!auctionId) {
        setErrorMessage("Auction ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response =
          await getAuctionDetails(auctionId);

        setAuction(response);
      } catch {
        setErrorMessage(
          "Unable to load the auction.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuction();
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) {
      return;
    }

    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,

      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe(
          `/topic/auctions/${auctionId}/bids`,
          (message) => {
            const bidUpdate =
              JSON.parse(
                message.body,
              ) as BidPlacedMessage;

            setAuction((currentAuction) => {
              if (!currentAuction) {
                return currentAuction;
              }

              return {
                ...currentAuction,
                currentPrice: bidUpdate.amount,
                highestBid: bidUpdate.amount,
                bidCount: bidUpdate.bidCount,
                leadingBidderName:
                  bidUpdate.bidderName,
              };
            });

            setBidMessage(
              `New bid: $${bidUpdate.amount.toFixed(2)} by ${bidUpdate.bidderName}`,
            );
          },
        );
      },

      onStompError: () => {
        console.error(
          "The WebSocket broker reported an error.",
        );
      },

      onWebSocketError: () => {
        console.error(
          "The WebSocket connection failed.",
        );
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [auctionId]);

  async function handleBidSubmit(
    event: SyntheticEvent<
      HTMLFormElement,
      SubmitEvent
    >,
  ) {
    event.preventDefault();

    if (!auctionId || !auction) {
      return;
    }

    const amount = Number(bidAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage(
        "Enter a valid bid amount.",
      );
      return;
    }

    setSubmittingBid(true);
    setErrorMessage("");
    setBidMessage("");

    try {
      const response = await placeBid(
        auctionId,
        { amount },
      );

      setAuction((currentAuction) => {
        if (!currentAuction) {
          return currentAuction;
        }

        return {
          ...currentAuction,
          currentPrice: response.amount,
          highestBid: response.amount,
          bidCount: currentAuction.bidCount + 1,
          leadingBidderName:
            response.bidderName,
        };
      });

      setBidAmount("");
      setBidMessage(
        `Your bid of $${response.amount.toFixed(2)} was accepted.`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            "Unable to place the bid.",
        );
      } else {
        setErrorMessage(
          "An unexpected error occurred.",
        );
      }
    } finally {
      setSubmittingBid(false);
    }
  }

  if (loading) {
    return <p>Loading auction...</p>;
  }

  if (errorMessage && !auction) {
    return (
      <p className="error-message">
        {errorMessage}
      </p>
    );
  }

  if (!auction) {
    return (
      <p className="error-message">
        Auction not found.
      </p>
    );
  }

  const minimumNextBid =
    auction.bidCount === 0
      ? auction.startingPrice
      : auction.currentPrice +
        auction.minimumBidIncrement;

  const canBid =
    accessToken !== null &&
    auction.status === "ACTIVE" &&
    auction.timeRemainingSeconds > 0;

  return (
    <article className="auction-details">
      <h1>{auction.title}</h1>

      <p>{auction.description}</p>

      <dl>
        <dt>Status</dt>
        <dd>{auction.status}</dd>

        <dt>Starting price</dt>
        <dd>
          ${auction.startingPrice.toFixed(2)}
        </dd>

        <dt>Current price</dt>
        <dd>
          ${auction.currentPrice.toFixed(2)}
        </dd>

        <dt>Minimum increment</dt>
        <dd>
          $
          {auction.minimumBidIncrement.toFixed(
            2,
          )}
        </dd>

        <dt>Bid count</dt>
        <dd>{auction.bidCount}</dd>

        <dt>Leading bidder</dt>
        <dd>
          {auction.leadingBidderName ??
            "No bids yet"}
        </dd>

        <dt>Time remaining</dt>
        <dd>
          {formatRemainingTime(
            auction.timeRemainingSeconds,
          )}
        </dd>

        {auction.status === "ENDED" && (
          <>
            <dt>Winner</dt>
            <dd>
              {auction.winnerName ??
                "No winning bidder"}
            </dd>
          </>
        )}
      </dl>

      <section className="bid-section">
        <h2>Place a bid</h2>

        {!accessToken ? (
          <p>
            <Link to="/login">Log in</Link> to
            place a bid.
          </p>
        ) : !canBid ? (
          <p>
            Bidding is not currently available.
          </p>
        ) : (
          <form onSubmit={handleBidSubmit}>
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
                setBidAmount(
                  event.target.value,
                )
              }
              placeholder={minimumNextBid.toFixed(
                2,
              )}
              required
            />

            <p className="minimum-bid">
              Minimum next bid: $
              {minimumNextBid.toFixed(2)}
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

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        {bidMessage && (
          <p className="success-message">
            {bidMessage}
          </p>
        )}
      </section>
    </article>
  );
}

function formatRemainingTime(
  totalSeconds: number,
): string {
  if (totalSeconds <= 0) {
    return "Ended";
  }

  const days = Math.floor(
    totalSeconds / 86400,
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

export default AuctionDetailsPage;