import {
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../../api/getApiErrorMessage";

import AdminAuctionCard from
  "../../../components/AdminAuctionCard";
import EmptyState from
  "../../../components/EmptyState";
import ErrorMessage from
  "../../../components/ErrorMessage";
import LoadingState from
  "../../../components/LoadingState";
import Pagination from
  "../../../components/Pagination";
import SuccessMessage from
  "../../../components/SuccessMessage";

import useCancelAuctionMutation from
  "../../../hooks/mutations/useCancelAuctionMutation";
import useDeleteAuctionMutation from
  "../../../hooks/mutations/useDeleteAuctionMutation";
import useAdminAuctionsQuery from
  "../../../hooks/queries/useAdminAuctionsQuery";

import type {
  AuctionStatus,
  AuctionSummary,
} from "../../../types/auction";

import "./AdminAuctionsPage.css";

const PAGE_SIZE = 12;

function AdminAuctionsPage() {
  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    AuctionStatus | "ALL"
  >("ALL");

  const [page, setPage] =
    useState(0);

  const [
    actionErrorMessage,
    setActionErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const auctionsQuery =
    useAdminAuctionsQuery({
      page,
      size: PAGE_SIZE,
      status: statusFilter,
    });

  const cancelMutation =
    useCancelAuctionMutation();

  const deleteMutation =
    useDeleteAuctionMutation();

  const auctions =
    auctionsQuery.data?.content ??
    [];

  const totalPages =
    auctionsQuery.data?.totalPages ??
    0;

  const totalElements =
    auctionsQuery.data
      ?.totalElements ?? 0;

  const queryErrorMessage =
    auctionsQuery.isError
      ? getApiErrorMessage(
          auctionsQuery.error,
          "Unable to load auctions.",
        )
      : "";

  const displayedErrorMessage =
    actionErrorMessage ||
    queryErrorMessage;

  function handleStatusChange(
    value:
      | AuctionStatus
      | "ALL",
  ) {
    setStatusFilter(value);
    setPage(0);
    setActionErrorMessage("");
    setSuccessMessage("");
  }

  function isEditable(
    auction: AuctionSummary,
  ): boolean {
    if (
      auction.status === "DRAFT"
    ) {
      return true;
    }

    return (
      auction.status ===
        "SCHEDULED" &&
      new Date(
        auction.startTime,
      ).getTime() > Date.now()
    );
  }

  function isCancellable(
    auction: AuctionSummary,
  ): boolean {
    const cancellableStatus =
      auction.status ===
        "SCHEDULED" ||
      auction.status ===
        "ACTIVE";

    const hasNotEnded =
      new Date(
        auction.endTime,
      ).getTime() > Date.now();

    return (
      cancellableStatus &&
      hasNotEnded
    );
  }

  async function handleCancel(
    auction: AuctionSummary,
  ) {
    const confirmed =
      window.confirm(
        `Cancel "${auction.title}"?\n\nExisting bids will remain, but no additional bids will be accepted.`,
      );

    if (!confirmed) {
      return;
    }

    setActionErrorMessage("");
    setSuccessMessage("");

    try {
      await cancelMutation.mutateAsync(
        auction.id,
      );

      setSuccessMessage(
        `"${auction.title}" was cancelled.`,
      );
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to cancel this auction.",
        ),
      );
    }
  }

  async function handleDelete(
    auction: AuctionSummary,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${auction.title}"? This cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setActionErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteMutation.mutateAsync(
        auction.id,
      );

      setSuccessMessage(
        `"${auction.title}" was deleted.`,
      );

      if (
        auctions.length === 1 &&
        page > 0
      ) {
        setPage(
          (current) =>
            current - 1,
        );
      }
    } catch (error) {
      setActionErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to delete this auction.",
        ),
      );
    }
  }

  return (
    <section className="admin-auctions-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            Administration
          </p>

          <h1>
            Manage Auctions
          </h1>

          <p>
            Review, edit, and manage
            platform auctions.
          </p>
        </div>

        <Link
          className="primary-button create-auction-link"
          to="/admin/auctions/new"
        >
          Create Auction
        </Link>
      </header>

      <ErrorMessage
        message={
          displayedErrorMessage
        }
        className="admin-message admin-error"
      />

      <SuccessMessage
        message={successMessage}
        className="admin-message admin-success"
      />

      <section className="admin-auction-list">
        <div className="admin-list-heading">
          <div>
            <h2>All auctions</h2>

            <p>
              {totalElements} auction
              {totalElements === 1
                ? ""
                : "s"}
            </p>
          </div>

          <label className="status-filter">
            Status

            <select
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(
                  event.target
                    .value as
                    | AuctionStatus
                    | "ALL",
                )
              }
              disabled={
                auctionsQuery.isFetching
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
          </label>
        </div>

        {auctionsQuery.isPending ? (
          <LoadingState message="Loading auctions..." />
        ) : auctionsQuery.isError &&
          auctions.length === 0 ? (
          <EmptyState
            title="Auctions unavailable"
            message="The auction list could not be loaded."
          />
        ) : auctions.length === 0 ? (
          <EmptyState
            message="No auctions match this filter."
          />
        ) : (
          <div className="admin-auction-grid">
            {auctions.map(
              (auction) => {
                const deleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables ===
                    auction.id;

                const cancelling =
                  cancelMutation.isPending &&
                  cancelMutation.variables ===
                    auction.id;

                return (
                  <AdminAuctionCard
                    key={auction.id}
                    auction={auction}
                    editable={isEditable(
                      auction,
                    )}
                    cancellable={isCancellable(
                      auction,
                    )}
                    deleting={deleting}
                    cancelling={
                      cancelling
                    }
                    onDelete={(
                      selectedAuction,
                    ) =>
                      void handleDelete(
                        selectedAuction,
                      )
                    }
                    onCancel={(
                      selectedAuction,
                    ) =>
                      void handleCancel(
                        selectedAuction,
                      )
                    }
                  />
                );
              },
            )}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          loading={
            auctionsQuery.isFetching
          }
          onPageChange={setPage}
        />
      </section>
    </section>
  );
}

export default AdminAuctionsPage;