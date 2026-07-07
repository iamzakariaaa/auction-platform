import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { getMyBids } from "../api/bidApi";
import type { UserBidResponse } from "../types/bid";
import "./MyBidsPage.css";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString(
    "en-CA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function MyBidsPage() {
  const [bids, setBids] = useState<
  UserBidResponse[]
>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadBids() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getMyBids();

        setBids(response);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const responseMessage =
            error.response?.data?.message;

          setErrorMessage(
            typeof responseMessage === "string"
              ? responseMessage
              : "Unable to load your bids.",
          );
        } else {
          setErrorMessage(
            "An unexpected error occurred.",
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadBids();
  }, []);

  if (loading) {
    return (
      <section className="my-bids-page">
        <p>Loading your bids...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="my-bids-page">
        <div className="my-bids-error">
          <h1>My Bids</h1>
          <p role="alert">
            {errorMessage}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-bids-page">
      <header className="my-bids-header">
        <div>
          <p className="my-bids-eyebrow">
            Account activity
          </p>

          <h1>My Bids</h1>

          <p>
            Review all bids you have placed.
          </p>
        </div>

        <Link
          className="browse-auctions-link"
          to="/"
        >
          Browse auctions
        </Link>
      </header>

      {bids.length === 0 ? (
        <div className="empty-bids">
          <h2>No bids yet</h2>

          <p>
            You have not placed any bids.
            Browse the available auctions to
            get started.
          </p>

          <Link
            className="primary-link"
            to="/"
          >
            View auctions
          </Link>
        </div>
      ) : (
        <div className="bids-grid">
          {bids.map((bid) => (
            <article
                className="bid-card"
                key={bid.bidId}
                >
                <div className="bid-card-heading">
                    <div>
                    <p className="bid-label">
                        {bid.auctionTitle}
                    </p>

                    <h2>
                        {formatMoney(bid.bidAmount)}
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
                        {formatMoney(bid.bidAmount)}
                    </dd>
                    </div>

                    <div>
                    <dt>Current price</dt>
                    <dd>
                        {formatMoney(bid.currentPrice)}
                    </dd>
                    </div>

                    <div>
                    <dt>Auction status</dt>
                    <dd>{bid.auctionStatus}</dd>
                    </div>

                    <div>
                    <dt>Auction ends</dt>
                    <dd>
                        {formatDate(bid.auctionEndTime)}
                    </dd>
                    </div>

                    <div>
                    <dt>Bid placed</dt>
                    <dd>
                        {formatDate(bid.createdAt)}
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
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBidsPage;