import type {
  ReactElement,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";
import useAuth from "../hooks/useAuth";


interface AdminRouteProps {
  children: ReactElement;
}

function AdminRoute({
  children,
}: AdminRouteProps) {
  const location =
    useLocation();

  const {
    user,
    loading,
    authenticated,
  } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        Checking administrator
        access...
      </div>
    );
  }

  if (!authenticated) {
    const requestedLocation =
      location.pathname +
      location.search +
      location.hash;

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            requestedLocation,
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