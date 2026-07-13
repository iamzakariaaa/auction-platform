import type {
  ReactElement,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";
import useAuth from "../hooks/useAuth";


interface ProtectedRouteProps {
  children: ReactElement;
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location =
    useLocation();

  const {
    authenticated,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        Checking your session...
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

  return children;
}

export default ProtectedRoute;