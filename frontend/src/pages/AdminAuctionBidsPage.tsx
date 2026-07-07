import {
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getAuctionDetails,
} from "../api/auctionApi";
import {
  getAuctionBids,
} from "../api/bidApi";
import type {
  AuctionDetails,
} from "../types/auction";
import type {
  BidResponse,
} from "../types/bid";
import "./AdminAuctionBidsPage.css";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString(
    "en-MA",
    {
      timeZone: "Africa/Casablanca",
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false,
    },
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function AdminAuctionBidsPage() {
  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const [auction, setAuction] =
    useState<AuctionDetails | null>(null);

  const [bids, setBids] =
    useState<BidResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!auctionId) {
      setErrorMessage(
        "Auction ID is missing.",
      );
      setLoading(false);
      return;
    }

    const selectedAuctionId = auctionId;

    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          auctionResponse,
          bidsResponse,
        ] = await Promise.all([
          getAuctionDetails(
            selectedAuctionId,
          ),
          getAuctionBids(
            selectedAuctionId,
            100,
          ),
        ]);

        setAuction(auctionResponse);
        setBids(bidsResponse);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load auction bids.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [auctionId]);

  const highestBid = useMemo(() => {
    if (bids.length === 0) {
      return null;
    }

    return bids[0];
  }, [bids]);

  if (loading) {
    return (
      <section className="admin-bids-page">
        <p>Loading bid history...</p>
      </section>
    );
  }

  if (errorMessage || !auction) {
    return (
      <section className="admin-bids-page">
        <div className="admin-bids-error">
          <h1>Bid History</h1>

          <p role="alert">
            {errorMessage ||
              "Auction could not be loaded."}
          </p>

          <Link to="/admin/auctions">
            Back to auctions
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-bids-page">
      <header className="admin-bids-header">
        <div>
          <p className="admin-bids-eyebrow">
            Administration
          </p>

          <h1>{auction.title}</h1>

          <p>
            Review bidding activity for this
            auction.
          </p>
        </div>

        <Link
          className="admin-bids-back-link"
          to="/admin/auctions"
        >
          Back to Auctions
        </Link>
      </header>

      <section className="admin-bids-summary">
        <article>
          <span>Status</span>
          <strong>{auction.status}</strong>
        </article>

        <article>
          <span>Total bids</span>
          <strong>{auction.bidCount}</strong>
        </article>

        <article>
          <span>Current price</span>
          <strong>
            {formatMoney(
              auction.currentPrice,
            )}
          </strong>
        </article>

        <article>
          <span>Highest bidder</span>
          <strong>
            {highestBid?.bidderName ??
              "No bids"}
          </strong>
        </article>
      </section>

      <section className="admin-bids-table-card">
        <div className="admin-bids-table-heading">
          <div>
            <h2>Bid History</h2>

            <p>
              Bids are ordered from highest to
              lowest.
            </p>
          </div>

          <Link
            className="admin-view-auction-link"
            to={`/auctions/${auction.id}`}
          >
            View Auction
          </Link>
        </div>

        {bids.length === 0 ? (
          <div className="admin-bids-empty">
            No bids have been placed.
          </div>
        ) : (
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
                        {formatDate(
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
        )}
      </section>
    </section>
  );
}

export default AdminAuctionBidsPage;