import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AuctionDetailsPage from "./pages/AuctionDetailsPage";
import AuctionsPage from "./pages/AuctionsPage";
import LoginPage from "./pages/LoginPage";
import MyBidsPage from "./pages/MyBidsPage";
import RegisterPage from "./pages/RegisterPage";
import WonAuctionsPage from "./pages/WonAuctionsPage";

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