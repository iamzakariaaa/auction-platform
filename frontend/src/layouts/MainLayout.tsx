import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./MainLayout.css";
import useAuth from "../hooks/useAuth";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const accountMenuRef =
    useRef<HTMLDivElement | null>(null);

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function handleLogout() {
    setAccountMenuOpen(false);
    logout();
    navigate("/");
  }

  function toggleAccountMenu() {
    setAccountMenuOpen((current) => !current);
  }

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "My Account";

  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          Auction Platform
        </Link>

        <nav className="main-navigation">
          <Link className="navlink" to="/">
            Auctions
          </Link>

          {!loading &&
          authenticated &&
          user ? (
            <div
              className="account-menu"
              ref={accountMenuRef}
            >
              <button
                className="account-menu-button"
                type="button"
                onClick={toggleAccountMenu}
                aria-expanded={
                  accountMenuOpen
                }
                aria-haspopup="menu"
              >
                <span className="account-menu-name">
                  {displayName}
                </span>

                <span
                  className={`account-menu-arrow ${
                    accountMenuOpen
                      ? "account-menu-arrow-open"
                      : ""
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {accountMenuOpen && (
                <div
                  className="account-dropdown"
                  role="menu"
                >
                  <div className="account-dropdown-header">
                    <strong>
                      {displayName}
                    </strong>

                    <span>{user.role}</span>
                  </div>

                  <Link
                    className="account-dropdown-link"
                    to="/my-bids"
                    role="menuitem"
                  >
                    My Bids
                  </Link>

                  <Link
                    className="account-dropdown-link"
                    to="/won-auctions"
                    role="menuitem"
                  >
                    Won Auctions
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      className="account-dropdown-link"
                      to="/admin"
                      role="menuitem"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="account-dropdown-divider" />

                  <button
                    className="account-logout-button"
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {!loading && !authenticated ? (
            <div className="guest-navigation">
              <Link
                className="navlink"
                to="/login"
              >
                Login
              </Link>

              <Link
                className="register-navlink"
                to="/register"
              >
                Register
              </Link>
            </div>
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