import {
  type SyntheticEvent,
} from "react";

import type {
  AuctionSort,
} from "../api/auctionApi";

import type {
  AuctionStatus,
} from "../types/auction";

export interface AuctionFiltersState {
  search: string;
  status: AuctionStatus | "ALL";
  minimumPrice: string;
  maximumPrice: string;
  sort: AuctionSort;
}

interface AuctionFiltersProps {
  filters: AuctionFiltersState;
  loading: boolean;
  onChange: (
    filters: AuctionFiltersState,
  ) => void;
  onSubmit: () => void;
  onClear: () => void;
}

function AuctionFilters({
  filters,
  loading,
  onChange,
  onSubmit,
  onClear,
}: AuctionFiltersProps) {
  function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    onSubmit();
  }

  function updateFilter<
    Key extends keyof AuctionFiltersState,
  >(
    key: Key,
    value: AuctionFiltersState[Key],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
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
          value={filters.search}
          onChange={(event) =>
            updateFilter(
              "search",
              event.target.value,
            )
          }
        />
      </div>

      <div>
        <label htmlFor="auction-status">
          Status
        </label>

        <select
          id="auction-status"
          value={filters.status}
          onChange={(event) =>
            updateFilter(
              "status",
              event.target.value as
                | AuctionStatus
                | "ALL",
            )
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
          value={filters.minimumPrice}
          onChange={(event) =>
            updateFilter(
              "minimumPrice",
              event.target.value,
            )
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
          value={filters.maximumPrice}
          onChange={(event) =>
            updateFilter(
              "maximumPrice",
              event.target.value,
            )
          }
        />
      </div>

      <div>
        <label htmlFor="auction-sort">
          Sort by
        </label>

        <select
          id="auction-sort"
          value={filters.sort}
          onChange={(event) =>
            updateFilter(
              "sort",
              event.target
                .value as AuctionSort,
            )
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
          onClick={onClear}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </form>
  );
}

export default AuctionFilters; 