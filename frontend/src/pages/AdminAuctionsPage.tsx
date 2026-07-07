import {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  cancelAuction,
  deleteAuction,
  getAuctions,
} from "../api/auctionApi";
import type {
  AuctionStatus,
  AuctionSummary,
} from "../types/auction";
import "./AdminAuctionsPage.css";

const PAGE_SIZE = 12;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-MA", {
    style: "currency",
    currency: "MAD",
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-MA", {
    timeZone: "Africa/Casablanca",
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      error.response?.data?.message;

    if (typeof responseMessage === "string") {
      return responseMessage;
    }

    if (typeof error.response?.data === "string") {
      return error.response.data;
    }
  }

  return fallback;
}

function AdminAuctionsPage() {
  const navigate = useNavigate();

  const [auctions, setAuctions] =
    useState<AuctionSummary[]>([]);

  const [statusFilter, setStatusFilter] =
    useState<AuctionStatus | "ALL">("ALL");

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [
    deletingAuctionId,
    setDeletingAuctionId,
  ] = useState<string | null>(null);

  const [
    cancellingAuctionId,
    setCancellingAuctionId,
  ] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function loadAuctions(
    requestedPage = page,
  ) {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getAuctions({
        page: requestedPage,
        size: PAGE_SIZE,
        status:
          statusFilter === "ALL"
            ? undefined
            : statusFilter,
      });

      setAuctions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(response.number);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to load auctions.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAuctions(page);
  }, [page, statusFilter]);

  function handleStatusChange(
    value: AuctionStatus | "ALL",
  ) {
    setStatusFilter(value);
    setPage(0);
    setSuccessMessage("");
  }

  function isEditable(
    auction: AuctionSummary,
  ): boolean {
    if (auction.status === "DRAFT") {
      return true;
    }

    return (
      auction.status === "SCHEDULED" &&
      new Date(auction.startTime).getTime() >
        Date.now()
    );
  }

  function isCancellable(
    auction: AuctionSummary,
  ): boolean {
    const cancellableStatus =
      auction.status === "SCHEDULED" ||
      auction.status === "ACTIVE";

    const hasNotEnded =
      new Date(auction.endTime).getTime() >
      Date.now();

    return cancellableStatus && hasNotEnded;
  }

  async function handleCancel(
    auction: AuctionSummary,
  ) {
    const confirmed = window.confirm(
      `Cancel "${auction.title}"?\n\nExisting bids will remain, but no additional bids will be accepted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingAuctionId(auction.id);
      setErrorMessage("");
      setSuccessMessage("");

      await cancelAuction(auction.id);

      setSuccessMessage(
        `"${auction.title}" was cancelled.`,
      );

      await loadAuctions(page);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to cancel this auction.",
        ),
      );
    } finally {
      setCancellingAuctionId(null);
    }
  }

  async function handleDelete(
    auction: AuctionSummary,
  ) {
    const confirmed = window.confirm(
      `Delete "${auction.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAuctionId(auction.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAuction(auction.id);

      setSuccessMessage(
        `"${auction.title}" was deleted.`,
      );

      if (
        auctions.length === 1 &&
        page > 0
      ) {
        setPage((current) => current - 1);
      } else {
        await loadAuctions(page);
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Unable to delete this auction.",
        ),
      );
    } finally {
      setDeletingAuctionId(null);
    }
  }

  return (
    <section className="admin-auctions-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            Administration
          </p>

          <h1>Manage Auctions</h1>

          <p>
            Review, edit, and manage platform
            auctions.
          </p>
        </div>

        <Link
          className="primary-button create-auction-link"
          to="/admin/auctions/new"
        >
          Create Auction
        </Link>
      </header>

      {errorMessage && (
        <p
          className="admin-message admin-error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          className="admin-message admin-success"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <section className="admin-auction-list">
        <div className="admin-list-heading">
          <div>
            <h2>All auctions</h2>

            <p>
              {totalElements} auction
              {totalElements === 1 ? "" : "s"}
            </p>
          </div>

          <label className="status-filter">
            Status

            <select
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(
                  event.target.value as
                    | AuctionStatus
                    | "ALL",
                )
              }
              disabled={loading}
            >
              <option value="ALL">All</option>
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

        {loading ? (
          <p>Loading auctions...</p>
        ) : auctions.length === 0 ? (
          <div className="admin-empty-state">
            No auctions match this filter.
          </div>
        ) : (
          <div className="admin-auction-grid">
            {auctions.map((auction) => {
              const editable =
                isEditable(auction);

              const cancellable =
                isCancellable(auction);

              return (
                <article
                  className="admin-auction-card"
                  key={auction.id}
                >
                  <div className="admin-auction-card-heading">
                    <div>
                      <span
                        className={`auction-status auction-status-${auction.status.toLowerCase()}`}
                      >
                        {auction.status}
                      </span>

                      <h3>{auction.title}</h3>
                    </div>

                    <strong>
                      {formatMoney(
                        auction.currentPrice,
                      )}
                    </strong>
                  </div>

                  <dl className="admin-auction-details">
                    <div>
                      <dt>Starts</dt>

                      <dd>
                        {formatDate(
                          auction.startTime,
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Ends</dt>

                      <dd>
                        {formatDate(
                          auction.endTime,
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="admin-card-actions">
                    <Link
                      className="view-link"
                      to={`/auctions/${auction.id}`}
                    >
                      View
                    </Link>
                    <Link
                        className="view-link"
                        to={`/admin/auctions/${auction.id}/bids`}
                        >
                        View Bids
                        </Link>

                    {editable && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/auctions/${auction.id}/edit`,
                            )
                          }
                          disabled={
                            deletingAuctionId ===
                              auction.id ||
                            cancellingAuctionId ===
                              auction.id
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="danger-button"
                          type="button"
                          onClick={() =>
                            void handleDelete(
                              auction,
                            )
                          }
                          disabled={
                            deletingAuctionId ===
                              auction.id ||
                            cancellingAuctionId ===
                              auction.id
                          }
                        >
                          {deletingAuctionId ===
                          auction.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    )}

                    {cancellable && (
                      <button
                        className="cancel-button"
                        type="button"
                        onClick={() =>
                          void handleCancel(
                            auction,
                          )
                        }
                        disabled={
                          cancellingAuctionId ===
                            auction.id ||
                          deletingAuctionId ===
                            auction.id
                        }
                      >
                        {cancellingAuctionId ===
                        auction.id
                          ? "Cancelling..."
                          : "Cancel Auction"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="admin-pagination"
            aria-label="Auction pages"
          >
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 0),
                )
              }
              disabled={loading || page === 0}
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
                loading ||
                page >= totalPages - 1
              }
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </section>
  );
}

export default AdminAuctionsPage;