import {
  useState,
} from "react";

import { getApiErrorMessage } from
  "../../api/getApiErrorMessage";

import AuctionCard from
  "../../components/AuctionCard";
import AuctionFilters from
  "../../components/AuctionFilters";

import type {
  AuctionFiltersState,
} from "../../components/AuctionFilters";

import EmptyState from
  "../../components/EmptyState";
import ErrorMessage from
  "../../components/ErrorMessage";
import LoadingState from
  "../../components/LoadingState";
import Pagination from
  "../../components/Pagination";

import useAuctionsQuery from
  "../../hooks/queries/useAuctionsQuery";

import "./AuctionsPage.css";

const PAGE_SIZE = 12;

const INITIAL_FILTERS:
  AuctionFiltersState = {
    search: "",
    status: "ALL",
    minimumPrice: "",
    maximumPrice: "",
    sort: "NEWEST",
  };

function AuctionsPage() {
  const [
    formFilters,
    setFormFilters,
  ] = useState<AuctionFiltersState>(
    INITIAL_FILTERS,
  );

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState<AuctionFiltersState>(
    INITIAL_FILTERS,
  );

  const [page, setPage] =
    useState(0);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  const auctionsQuery =
    useAuctionsQuery({
      page,
      size: PAGE_SIZE,

      search:
        appliedFilters.search,

      status:
        appliedFilters.status,

      minimumPrice:
        parseOptionalNumber(
          appliedFilters.minimumPrice,
        ),

      maximumPrice:
        parseOptionalNumber(
          appliedFilters.maximumPrice,
        ),

      sort:
        appliedFilters.sort,
    });

  const auctions =
    auctionsQuery.data?.content ??
    [];

  const totalPages =
    auctionsQuery.data?.totalPages ??
    0;

  const totalElements =
    auctionsQuery.data
      ?.totalElements ?? 0;

  const queryError =
    auctionsQuery.isError
      ? getApiErrorMessage(
          auctionsQuery.error,
          "Unable to load auctions.",
        )
      : "";

  const displayedError =
    validationError ||
    queryError;

  function handleApplyFilters() {
    const minimum =
      parseOptionalNumber(
        formFilters.minimumPrice,
      );

    const maximum =
      parseOptionalNumber(
        formFilters.maximumPrice,
      );

    if (
      minimum !== undefined &&
      maximum !== undefined &&
      minimum > maximum
    ) {
      setValidationError(
        "Minimum price cannot be greater than maximum price.",
      );
      return;
    }

    setValidationError("");
    setPage(0);

    setAppliedFilters({
      ...formFilters,

      search:
        formFilters.search.trim(),
    });
  }

  function handleClearFilters() {
    setFormFilters(
      INITIAL_FILTERS,
    );

    setAppliedFilters(
      INITIAL_FILTERS,
    );

    setValidationError("");
    setPage(0);
  }

  const filtersAreActive =
    appliedFilters.search !== "" ||
    appliedFilters.status !==
      "ALL" ||
    appliedFilters.minimumPrice !==
      "" ||
    appliedFilters.maximumPrice !==
      "" ||
    appliedFilters.sort !==
      "NEWEST";

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
          {totalElements === 1
            ? ""
            : "s"}
        </span>
      </header>

      <AuctionFilters
        filters={formFilters}
        loading={
          auctionsQuery.isFetching
        }
        onChange={setFormFilters}
        onSubmit={
          handleApplyFilters
        }
        onClear={
          handleClearFilters
        }
      />

      <ErrorMessage
        message={displayedError}
      />

      {auctionsQuery.isPending ? (
        <LoadingState message="Loading auctions..." />
      ) : auctionsQuery.isError &&
        auctions.length === 0 ? (
        <EmptyState
          title="Auctions unavailable"
          message="The auction list could not be loaded."
        />
      ) : auctions.length === 0 ? (
        <div className="auctions-empty-state">
          <EmptyState
            title="No auctions found"
            message="Try changing your search or filter options."
          />

          {filtersAreActive && (
            <button
              type="button"
              onClick={
                handleClearFilters
              }
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="auction-grid">
            {auctions.map(
              (auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                />
              ),
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            loading={
              auctionsQuery.isFetching
            }
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}

function parseOptionalNumber(
  value: string,
): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export default AuctionsPage;