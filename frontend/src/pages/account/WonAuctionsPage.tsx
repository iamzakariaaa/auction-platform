import {
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../api/getApiErrorMessage";

import EmptyState from
  "../../components/EmptyState";
import ErrorMessage from
  "../../components/ErrorMessage";
import LoadingState from
  "../../components/LoadingState";
import Pagination from
  "../../components/Pagination";
import WonAuctionCard from
  "../../components/WonAuctionCard";

import useWonAuctionsQuery from
  "../../hooks/queries/useWonAuctionsQuery";

import "./WonAuctionsPage.css";

const PAGE_SIZE = 12;

function WonAuctionsPage() {
  const [page, setPage] =
    useState(0);

  const wonAuctionsQuery =
    useWonAuctionsQuery(
      page,
      PAGE_SIZE,
    );

  const auctions =
    wonAuctionsQuery.data?.content ??
    [];

  const totalPages =
    wonAuctionsQuery.data
      ?.totalPages ?? 0;

  if (wonAuctionsQuery.isPending) {
    return (
      <section className="won-auctions-page">
        <LoadingState message="Loading won auctions..." />
      </section>
    );
  }

  if (
    wonAuctionsQuery.isError &&
    auctions.length === 0
  ) {
    return (
      <section className="won-auctions-page">
        <div className="won-auctions-error">
          <h1>Won Auctions</h1>

          <ErrorMessage
            message={getApiErrorMessage(
              wonAuctionsQuery.error,
              "Unable to load your won auctions.",
            )}
          />
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

      {wonAuctionsQuery.isError && (
        <ErrorMessage
          message={getApiErrorMessage(
            wonAuctionsQuery.error,
            "Unable to refresh your won auctions.",
          )}
        />
      )}

      {auctions.length === 0 ? (
        <div className="won-auctions-empty">
          <EmptyState
            title="No won auctions yet"
            message="Auctions you win will appear here after they end."
          />

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
            {auctions.map(
              (auction) => (
                <WonAuctionCard
                  key={
                    auction.auctionId
                  }
                  auction={auction}
                />
              ),
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            loading={
              wonAuctionsQuery.isFetching
            }
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}

export default WonAuctionsPage;