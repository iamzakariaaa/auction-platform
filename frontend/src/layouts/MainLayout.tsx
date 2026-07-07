import {
  Link,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "./MainLayout.css";

function MainLayout() {
  const navigate = useNavigate();

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          Auction Platform
        </Link>

        <nav>
          <Link className="navlink" to="/">
            Auctions
          </Link>

          {!loading && authenticated && user ? (
            <>
              <Link
                className="navlink"
                to="/my-bids"
              >
                My Bids
              </Link>
              <Link
                className="navlink"
                to="/won-auctions"
              >
                Won Auctions
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  className="navlink"
                  to="/admin/auctions"
                >
                  Admin
                </Link>
              )}
              <span className="nav-user">
                {user.firstName} {user.lastName}
              </span>

              <button
                className="link-button"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : null}

          {!loading && !authenticated ? (
            <>
              <Link
                className="navlink"
                to="/login"
              >
                Login
              </Link>

              <Link
                className="navlink"
                to="/register"
              >
                Register
              </Link>
            </>
          ) : null}
        </nav>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;