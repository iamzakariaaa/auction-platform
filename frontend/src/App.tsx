import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AuctionDetailsPage from "./pages/AuctionDetailsPage";
import AuctionsPage from "./pages/AuctionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

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