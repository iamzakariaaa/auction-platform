import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AuctionsPage from "./pages/public/AuctionsPage";
import MyBidsPage from "./pages/account/MyBidsPage";
import WonAuctionsPage from "./pages/account/WonAuctionsPage";
import AdminRoute from "./routes/AdminRoute";
import AdminDashboardPage from "./pages/admin/dashboard/AdminDashboardPage";
import AuctionDetailsPage from "./pages/public/AuctionDetailsPage";
import AdminAuctionsPage from "./pages/admin/auctions/AdminAuctionsPage";
import AuctionFormPage from "./pages/admin/auctions/AuctionFormPage";
import AuctionImagesPage from "./pages/admin/auctions/AuctionImagesPage";
import AdminAuctionBidsPage from "./pages/admin/auctions/AdminAuctionBidsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<AuctionsPage />}
            />

            <Route
              path="/auctions/:auctionId"
              element={<AuctionDetailsPage />}
            />

            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <MyBidsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/won-auctions"
              element={
                <ProtectedRoute>
                  <WonAuctionsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/auctions"
            element={
              <AdminRoute>
                <AdminAuctionsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auctions/new"
            element={
              <AdminRoute>
                <AuctionFormPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auctions/:auctionId/edit"
            element={
              <AdminRoute>
                <AuctionFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/auctions/:auctionId/images"
            element={
              <AdminRoute>
                <AuctionImagesPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/auctions/:auctionId/bids"
            element={
              <AdminRoute>
                <AdminAuctionBidsPage />
              </AdminRoute>
            }
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;