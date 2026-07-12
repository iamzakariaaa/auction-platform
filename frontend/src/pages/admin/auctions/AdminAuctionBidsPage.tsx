import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../../api/getApiErrorMessage";

import BidHistoryTable from
  "../../../components/BidHistoryTable";
import ErrorMessage from
  "../../../components/ErrorMessage";
import LoadingState from
  "../../../components/LoadingState";

import useAuctionBidsQuery from
  "../../../hooks/queries/useAuctionBidsQuery";
import useAuctionDetailsQuery from
  "../../../hooks/queries/useAuctionDetailsQuery";

import {
  formatMoney,
} from "../../../utils/formats";

import "./AdminAuctionBidsPage.css";

const BID_LIMIT = 100;

function AdminAuctionBidsPage() {
  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const auctionQuery =
    useAuctionDetailsQuery(
      auctionId,
    );

  const bidsQuery =
    useAuctionBidsQuery(
      auctionId,
      BID_LIMIT,
    );

  const auction =
    auctionQuery.data;

  const bids =
    bidsQuery.data ?? [];

  const highestBid =
    bids[0] ?? null;

  const loading =
    auctionQuery.isPending ||
    bidsQuery.isPending;

  const queryError =
    auctionQuery.isError
      ? getApiErrorMessage(
          auctionQuery.error,
          "Unable to load the auction.",
        )
      : bidsQuery.isError
        ? getApiErrorMessage(
            bidsQuery.error,
            "Unable to load auction bids.",
          )
        : "";

  if (!auctionId) {
    return (
      <section className="admin-bids-page">
        <div className="admin-bids-error">
          <h1>Bid History</h1>

          <ErrorMessage
            message="Auction ID is missing."
          />

          <Link to="/admin/auctions">
            Back to auctions
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="admin-bids-page">
        <LoadingState message="Loading bid history..." />
      </section>
    );
  }

  if (
    queryError ||
    !auction
  ) {
    return (
      <section className="admin-bids-page">
        <div className="admin-bids-error">
          <h1>Bid History</h1>

          <ErrorMessage
            message={
              queryError ||
              "Auction could not be loaded."
            }
          />

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

          <h1>
            {auction.title}
          </h1>

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

      {(auctionQuery.isFetching ||
        bidsQuery.isFetching) && (
        <p className="loading-state">
          Refreshing bid history...
        </p>
      )}

      <section className="admin-bids-summary">
        <article>
          <span>Status</span>

          <strong>
            {auction.status}
          </strong>
        </article>

        <article>
          <span>Total bids</span>

          <strong>
            {auction.bidCount}
          </strong>
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

        <BidHistoryTable
          auction={auction}
          bids={bids}
        />
      </section>
    </section>
  );
}

export default AdminAuctionBidsPage;