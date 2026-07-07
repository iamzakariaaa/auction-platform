import type { ReactElement } from "react";
import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactElement;
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

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

  return children;
}

export default ProtectedRoute;