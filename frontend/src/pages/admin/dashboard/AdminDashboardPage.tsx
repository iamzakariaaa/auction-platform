import {
  Link,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../../api/getApiErrorMessage";

import DashboardStatCard from
  "../../../components/DashboardStatCard";
import ErrorMessage from
  "../../../components/ErrorMessage";
import LoadingState from
  "../../../components/LoadingState";
import RecentAuctionsTable from
  "../../../components/RecentAuctionsTable";

import useAdminDashboardQuery from
  "../../../hooks/queries/useAdminDashboardQuery";

import "./AdminDashboardPage.css";

function AdminDashboardPage() {
  const dashboardQuery =
    useAdminDashboardQuery();

  const dashboard =
    dashboardQuery.data;

  if (dashboardQuery.isPending) {
    return (
      <section className="admin-dashboard-page">
        <LoadingState message="Loading dashboard..." />
      </section>
    );
  }

  if (
    dashboardQuery.isError ||
    !dashboard
  ) {
    return (
      <section className="admin-dashboard-page">
        <ErrorMessage
          message={
            dashboardQuery.isError
              ? getApiErrorMessage(
                  dashboardQuery.error,
                  "Unable to load the admin dashboard.",
                )
              : "Dashboard could not be loaded."
          }
          className="dashboard-error"
        />
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

      <section
        className="dashboard-stat-grid"
        aria-label="Auction statistics"
      >
        <DashboardStatCard
          label="Total auctions"
          value={dashboard.totalAuctions}
          linkLabel="View all"
          to="/admin/auctions"
        />

        <DashboardStatCard
          label="Scheduled"
          value={dashboard.scheduledAuctions}
          linkLabel="View scheduled"
          to="/admin/auctions"
        />

        <DashboardStatCard
          label="Active"
          value={dashboard.activeAuctions}
          linkLabel="View active"
          to="/admin/auctions"
        />

        <DashboardStatCard
          label="Ended"
          value={dashboard.endedAuctions}
          linkLabel="View ended"
          to="/admin/auctions"
        />

        <DashboardStatCard
          label="Cancelled"
          value={dashboard.cancelledAuctions}
          linkLabel="View cancelled"
          to="/admin/auctions"
        />
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

        <RecentAuctionsTable
          auctions={
            dashboard.recentAuctions
          }
        />
      </section>
    </section>
  );
}

export default AdminDashboardPage;