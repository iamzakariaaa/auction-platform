import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { getWonAuctions } from "../api/auctionApi";
import type {
  WonAuction,
} from "../types/auction";
import "./WonAuctionsPage.css";

function formatMoney(
  amount: number | null,
): string {
  if (amount === null) {
    return "Not available";
  }

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

function WonAuctionsPage() {
  const [auctions, setAuctions] = useState<
    WonAuction[]
  >([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadWonAuctions() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response =
          await getWonAuctions(page, 12);

        setAuctions(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const responseMessage =
            error.response?.data?.message;

          setErrorMessage(
            typeof responseMessage === "string"
              ? responseMessage
              : "Unable to load your won auctions.",
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

    void loadWonAuctions();
  }, [page]);

  if (loading) {
    return (
      <section className="won-auctions-page">
        <p>Loading won auctions...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="won-auctions-page">
        <div className="won-auctions-error">
          <h1>Won Auctions</h1>

          <p role="alert">
            {errorMessage}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="won-auctions-page">
      <header className="won-auctions-header">
        <div>
          <p className="won-auctions-eyebrow">
            Your victories
          </p>

          <h1>Won Auctions</h1>

          <p>
            Review auctions you have won.
          </p>
        </div>

        <Link
          className="browse-auctions-link"
          to="/"
        >
          Browse auctions
        </Link>
      </header>

      {auctions.length === 0 ? (
        <div className="won-auctions-empty">
          <h2>No won auctions yet</h2>

          <p>
            Auctions you win will appear here
            after they end.
          </p>

          <Link
            className="won-auctions-primary-link"
            to="/"
          >
            View active auctions
          </Link>
        </div>
      ) : (
        <>
          <div className="won-auctions-grid">
            {auctions.map((auction) => (
              <article
                className="won-auction-card"
                key={auction.auctionId}
              >
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
                      {formatMoney(
                        auction.winningAmount,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Ended</dt>
                    <dd>
                      {formatDate(
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
            ))}
          </div>

          {totalPages > 1 && (
            <div className="won-pagination">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 0),
                  )
                }
                disabled={page === 0}
              >
                Previous
              </button>

              <span>
                Page {page + 1} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      current + 1,
                      totalPages - 1,
                    ),
                  )
                }
                disabled={
                  page >= totalPages - 1
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default WonAuctionsPage;