import {
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  getAuctions,
  type AuctionSort,
} from "../api/auctionApi";
import type {
  AuctionStatus,
  AuctionSummary,
} from "../types/auction";
import "./AuctionsPage.css";

const PAGE_SIZE = 12;

interface AuctionFilters {
  search: string;
  status: AuctionStatus | "ALL";
  minimumPrice: string;
  maximumPrice: string;
  sort: AuctionSort;
}

const INITIAL_FILTERS: AuctionFilters = {
  search: "",
  status: "ALL",
  minimumPrice: "",
  maximumPrice: "",
  sort: "NEWEST",
};

function AuctionsPage() {
  const [auctions, setAuctions] =
    useState<AuctionSummary[]>([]);

  const [formFilters, setFormFilters] =
    useState<AuctionFilters>(
      INITIAL_FILTERS,
    );

  const [appliedFilters, setAppliedFilters] =
    useState<AuctionFilters>(
      INITIAL_FILTERS,
    );

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadAuctions() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await getAuctions({
          page,
          size: PAGE_SIZE,
          search: appliedFilters.search,

          status:
            appliedFilters.status === "ALL"
              ? undefined
              : appliedFilters.status,

          minimumPrice:
            appliedFilters.minimumPrice === ""
              ? undefined
              : Number(
                  appliedFilters.minimumPrice,
                ),

          maximumPrice:
            appliedFilters.maximumPrice === ""
              ? undefined
              : Number(
                  appliedFilters.maximumPrice,
                ),

          sort: appliedFilters.sort,
        });

        setAuctions(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(
          response.totalElements,
        );
      } catch {
        setErrorMessage(
          "Unable to load auctions.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuctions();
  }, [page, appliedFilters]);

  function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const minimum =
      formFilters.minimumPrice === ""
        ? undefined
        : Number(formFilters.minimumPrice);

    const maximum =
      formFilters.maximumPrice === ""
        ? undefined
        : Number(formFilters.maximumPrice);

    if (
      minimum !== undefined &&
      maximum !== undefined &&
      minimum > maximum
    ) {
      setErrorMessage(
        "Minimum price cannot be greater than maximum price.",
      );

      return;
    }

    setErrorMessage("");
    setPage(0);
    setAppliedFilters(formFilters);
  }

  function handleClearFilters() {
    setFormFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setErrorMessage("");
    setPage(0);
  }

  const filtersAreActive =
    appliedFilters.search !== "" ||
    appliedFilters.status !== "ALL" ||
    appliedFilters.minimumPrice !== "" ||
    appliedFilters.maximumPrice !== "" ||
    appliedFilters.sort !== "NEWEST";

  return (
    <section className="auctions-page">
      <header className="auctions-header">
        <div>
          <h1>Auctions</h1>

          <p>
            Browse and discover available
            auctions.
          </p>
        </div>

        <span className="auction-result-count">
          {totalElements} auction
          {totalElements === 1 ? "" : "s"}
        </span>
      </header>

      <form
        className="auction-filters"
        onSubmit={handleSubmit}
      >
        <div className="auction-search-field">
          <label htmlFor="auction-search">
            Search
          </label>

          <input
            id="auction-search"
            type="search"
            placeholder="Search by auction title"
            value={formFilters.search}
            onChange={(event) =>
              setFormFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label htmlFor="auction-status">
            Status
          </label>

          <select
            id="auction-status"
            value={formFilters.status}
            onChange={(event) =>
              setFormFilters((current) => ({
                ...current,
                status:
                  event.target.value as
                    | AuctionStatus
                    | "ALL",
              }))
            }
          >
            <option value="ALL">
              All
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="SCHEDULED">
              Scheduled
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="ENDED">
              Ended
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="minimum-price">
            Minimum price
          </label>

          <input
            id="minimum-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={formFilters.minimumPrice}
            onChange={(event) =>
              setFormFilters((current) => ({
                ...current,
                minimumPrice:
                  event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label htmlFor="maximum-price">
            Maximum price
          </label>

          <input
            id="maximum-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Any"
            value={formFilters.maximumPrice}
            onChange={(event) =>
              setFormFilters((current) => ({
                ...current,
                maximumPrice:
                  event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label htmlFor="auction-sort">
            Sort by
          </label>

          <select
            id="auction-sort"
            value={formFilters.sort}
            onChange={(event) =>
              setFormFilters((current) => ({
                ...current,
                sort:
                  event.target
                    .value as AuctionSort,
              }))
            }
          >
            <option value="NEWEST">
              Newest
            </option>

            <option value="ENDING_SOON">
              Ending soon
            </option>

            <option value="PRICE_LOW_TO_HIGH">
              Price: low to high
            </option>

            <option value="PRICE_HIGH_TO_LOW">
              Price: high to low
            </option>
          </select>
        </div>

        <div className="auction-filter-actions">
          <button
            className="auction-search-button"
            type="submit"
            disabled={loading}
          >
            Search
          </button>

          <button
            className="auction-clear-button"
            type="button"
            onClick={handleClearFilters}
            disabled={
              loading && !filtersAreActive
            }
          >
            Clear
          </button>
        </div>
      </form>

      {errorMessage && (
        <p
          className="error-message"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {loading ? (
        <p className="auctions-loading">
          Loading auctions...
        </p>
      ) : auctions.length === 0 ? (
        <div className="auctions-empty-state">
          <h2>No auctions found</h2>

          <p>
            Try changing your search or filter
            options.
          </p>

          {filtersAreActive && (
            <button
              type="button"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="auction-grid">
            {auctions.map((auction) => (
              <article
                className="auction-card"
                key={auction.id}
              >
                <span
                  className={`auction-card-status auction-card-status-${auction.status.toLowerCase()}`}
                >
                  {auction.status}
                </span>

                <h2>{auction.title}</h2>

                <p className="auction-card-price-label">
                  Current price
                </p>

                <strong className="auction-card-price">
                  {auction.currentPrice} MAD
                </strong>

                <div className="auction-card-actions">
                  <Link
                    to={`/auctions/${auction.id}`}
                  >
                    View auction
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="auction-pagination"
              aria-label="Auction pages"
            >
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 0),
                  )
                }
                disabled={
                  loading || page === 0
                }
              >
                Previous
              </button>

              <span>
                Page {page + 1} of{" "}
                {totalPages}
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
                  loading ||
                  page >= totalPages - 1
                }
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

export default AuctionsPage;