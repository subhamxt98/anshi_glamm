// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import About from "./pages/about";
import Contact from "./pages/contact";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import Profile from "./components/common/Profile";
import MyOrders from "./pages/MyOrders";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ✅ Admin Imports
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";

import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();

  // ✅ Check karein ki user Admin route par hai ya nahi
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* ✅ Agar Admin route NAHI hai, tabhi Navbar dikhao */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ===== Protected User Routes ===== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* ===== Admin Routes ===== */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminPanel />} />

        {/* ===== 404 Fallback ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ Agar Admin route NAHI hai, tabhi Footer dikhao */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;