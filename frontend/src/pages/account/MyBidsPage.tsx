import {
  Link,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../api/getApiErrorMessage";

import BidCard from
  "../../components/BidCard";
import EmptyState from
  "../../components/EmptyState";
import ErrorMessage from
  "../../components/ErrorMessage";
import LoadingState from
  "../../components/LoadingState";

import useMyBidsQuery from
  "../../hooks/queries/useMyBidsQuery";

import "./MyBidsPage.css";

function MyBidsPage() {
  const bidsQuery =
    useMyBidsQuery();

  const bids =
    bidsQuery.data ?? [];

  if (bidsQuery.isPending) {
    return (
      <section className="my-bids-page">
        <LoadingState message="Loading your bids..." />
      </section>
    );
  }

  if (bidsQuery.isError) {
    return (
      <section className="my-bids-page">
        <div className="my-bids-error">
          <h1>My Bids</h1>

          <ErrorMessage
            message={getApiErrorMessage(
              bidsQuery.error,
              "Unable to load your bids.",
            )}
          />
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
            Review all bids you have
            placed.
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
          <EmptyState
            title="No bids yet"
            message="You have not placed any bids. Browse the available auctions to get started."
          />

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
            <BidCard
              key={bid.bidId}
              bid={bid}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBidsPage;