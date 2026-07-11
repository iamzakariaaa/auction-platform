import {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  getAdminDashboard,
  resolveAuctionImageUrl,
} from "../api/auctionApi";
import type {
  AdminDashboardResponse,
} from "../types/auction";
import "./AdminDashboardPage.css";

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

function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState<AdminDashboardResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response =
          await getAdminDashboard();

        setDashboard(response);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load the admin dashboard.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (loading) {
    return (
      <section className="admin-dashboard-page">
        <p className="dashboard-loading">
          Loading dashboard...
        </p>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="admin-dashboard-page">
        <p
          className="dashboard-error"
          role="alert"
        >
          {errorMessage ||
            "Dashboard could not be loaded."}
        </p>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            Administration
          </p>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor auction activity and manage
            the marketplace.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link
            className="dashboard-secondary-link"
            to="/admin/auctions"
          >
            Manage Auctions
          </Link>

          <Link
            className="dashboard-primary-link"
            to="/admin/auctions/new"
          >
            Create Auction
          </Link>
        </div>
      </header>

      {errorMessage && (
        <p
          className="dashboard-error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <section
        className="dashboard-stat-grid"
        aria-label="Auction statistics"
      >
        <article className="dashboard-stat-card">
          <span>Total auctions</span>

          <strong>
            {dashboard.totalAuctions}
          </strong>

          <Link to="/admin/auctions">
            View all
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Scheduled</span>

          <strong>
            {dashboard.scheduledAuctions}
          </strong>

          <Link to="/admin/auctions">
            View scheduled
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Active</span>

          <strong>
            {dashboard.activeAuctions}
          </strong>

          <Link to="/admin/auctions">
            View active
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Ended</span>

          <strong>
            {dashboard.endedAuctions}
          </strong>

          <Link to="/admin/auctions">
            View ended
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Cancelled</span>

          <strong>
            {dashboard.cancelledAuctions}
          </strong>

          <Link to="/admin/auctions">
            View cancelled
          </Link>
        </article>
      </section>

      <section className="dashboard-recent-card">
        <div className="dashboard-section-heading">
          <div>
            <h2>Recent Auctions</h2>

            <p>
              The latest auctions added to the
              platform.
            </p>
          </div>

          <Link to="/admin/auctions">
            View all auctions
          </Link>
        </div>

        {dashboard.recentAuctions.length ===
        0 ? (
          <div className="dashboard-empty">
            No auctions have been created yet.
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Auction</th>
                  <th>Status</th>
                  <th>Current price</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentAuctions.map(
                  (auction) => (
                    <tr key={auction.id}>
                      <td>
                        <div className="dashboard-auction-thumbnail">
                          {auction.primaryImageUrl ? (
                            <img
                              src={resolveAuctionImageUrl(
                                auction.primaryImageUrl,
                              )}
                              alt={auction.title}
                            />
                          ) : (
                            <span>No image</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>
                          {auction.title}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`dashboard-status dashboard-status-${auction.status.toLowerCase()}`}
                        >
                          {auction.status}
                        </span>
                      </td>

                      <td>
                        {formatMoney(
                          auction.currentPrice,
                        )}
                      </td>

                      <td>
                        {formatDate(
                          auction.startTime,
                        )}
                      </td>

                      <td>
                        {formatDate(
                          auction.endTime,
                        )}
                      </td>

                      <td>
                        <div className="dashboard-table-actions">
                          <Link
                            to={`/auctions/${auction.id}`}
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/auctions/${auction.id}/bids`}
                          >
                            Bids
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminDashboardPage;