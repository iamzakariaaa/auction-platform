import {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { getAuctions } from "../api/auctionApi";
import type {
  AuctionSummary,
} from "../types/auction";
import "./AdminDashboardPage.css";

interface DashboardCounts {
  total: number;
  scheduled: number;
  active: number;
  ended: number;
  cancelled: number;
}

const INITIAL_COUNTS: DashboardCounts = {
  total: 0,
  scheduled: 0,
  active: 0,
  ended: 0,
  cancelled: 0,
};

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

function AdminDashboardPage() {
  const [counts, setCounts] =
    useState<DashboardCounts>(INITIAL_COUNTS);

  const [recentAuctions, setRecentAuctions] =
    useState<AuctionSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          allResponse,
          scheduledResponse,
          activeResponse,
          endedResponse,
          cancelledResponse,
          recentResponse,
        ] = await Promise.all([
          getAuctions({
            page: 0,
            size: 1,
          }),
          getAuctions({
            page: 0,
            size: 1,
            status: "SCHEDULED",
          }),
          getAuctions({
            page: 0,
            size: 1,
            status: "ACTIVE",
          }),
          getAuctions({
            page: 0,
            size: 1,
            status: "ENDED",
          }),
          getAuctions({
            page: 0,
            size: 1,
            status: "CANCELLED",
          }),
          getAuctions({
            page: 0,
            size: 5,
          }),
        ]);

        setCounts({
          total: allResponse.totalElements,
          scheduled:
            scheduledResponse.totalElements,
          active: activeResponse.totalElements,
          ended: endedResponse.totalElements,
          cancelled:
            cancelledResponse.totalElements,
        });

        setRecentAuctions(
          recentResponse.content,
        );
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
          <strong>{counts.total}</strong>

          <Link to="/admin/auctions">
            View all
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Scheduled</span>
          <strong>{counts.scheduled}</strong>

          <Link to="/admin/auctions">
            View scheduled
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Active</span>
          <strong>{counts.active}</strong>

          <Link to="/admin/auctions">
            View active
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Ended</span>
          <strong>{counts.ended}</strong>

          <Link to="/admin/auctions">
            View ended
          </Link>
        </article>

        <article className="dashboard-stat-card">
          <span>Cancelled</span>
          <strong>{counts.cancelled}</strong>

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

        {recentAuctions.length === 0 ? (
          <div className="dashboard-empty">
            No auctions have been created yet.
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Auction</th>
                  <th>Status</th>
                  <th>Current price</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {recentAuctions.map((auction) => (
                  <tr key={auction.id}>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminDashboardPage;