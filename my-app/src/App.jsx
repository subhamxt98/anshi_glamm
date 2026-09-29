// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import About from "./pages/about";
import Contact from "./pages/contact";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import Profile from "./components/common/Profile";
import MyOrders from "./pages/MyOrders";
import ForgotPassword from "./pages/ForgotPassword";      // ✅ ADD
import ResetPassword from "./pages/ResetPassword";         // ✅ ADD
import { useAuth } from "./context/AuthContext";

// ===== Protected Route Wrapper =====
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />

        {/* ===== Forgot / Reset Password ===== */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ===== Protected Routes ===== */}
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

        {/* ===== 404 Fallback ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;