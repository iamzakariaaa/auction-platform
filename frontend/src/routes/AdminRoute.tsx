import type { ReactElement } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface AdminRouteProps {
  children: ReactElement;
}

function AdminRoute({
  children,
}: AdminRouteProps) {
  const location = useLocation();

  const {
    user,
    loading,
    authenticated,
  } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        Checking administrator access...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default AdminRoute;