// src/components/common/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./css/profile.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Profile = () => {
  const { user, logout, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync form jab user change ho
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // ===== UPDATE PROFILE =====
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      // Context update — navbar bhi turant badal jayega
      updateUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        token: data.token,
      });

      setAlert({ type: "success", message: "Profile updated successfully!" });
      setIsEditing(false);
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // ===== CHANGE PASSWORD =====
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match!" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setAlert({
        type: "error",
        message: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password change failed");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setAlert({ type: "success", message: "Password changed successfully!" });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-page">
      <div className="container">

        {/* HEADER */}
        <div className="profile-header">
          <span className="profile-label">My Account</span>
          <h1 className="profile-title">
            Welcome back,{" "}
            <span className="italic">{user?.name?.split(" ")[0] || "User"}</span>
          </h1>
          <p className="profile-desc">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="row g-4">

          {/* LEFT: AVATAR CARD */}
          <div className="col-lg-4">
            <div className="profile-avatar-card">
              <div className="profile-avatar">{userInitial}</div>
              <h3 className="profile-name">{user?.name || "User"}</h3>
              <p className="profile-email">
                {user?.email || "user@example.com"}
              </p>

              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-num">0</span>
                  <span className="profile-stat-lbl">Orders</span>
                </div>
                <div className="profile-stat-divider"></div>
                <div className="profile-stat">
                  <span className="profile-stat-num">0</span>
                  <span className="profile-stat-lbl">Wishlist</span>
                </div>
                <div className="profile-stat-divider"></div>
                <div className="profile-stat">
                  <span className="profile-stat-num">0</span>
                  <span className="profile-stat-lbl">Reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TABS */}
          <div className="col-lg-8">
            <div className="profile-tabs-card">

              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("profile");
                    setAlert(null);
                    setIsEditing(false);
                  }}
                >
                  <i className="bi bi-person"></i>
                  <span>Profile</span>
                </button>
                <button
                  className={`profile-tab ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("password");
                    setAlert(null);
                  }}
                >
                  <i className="bi bi-shield-lock"></i>
                  <span>Password</span>
                </button>
                <button
                  className={`profile-tab ${activeTab === "actions" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("actions");
                    setAlert(null);
                  }}
                >
                  <i className="bi bi-lightning-charge"></i>
                  <span>Actions</span>
                </button>
              </div>

              {/* ===== PROFILE TAB ===== */}
              {activeTab === "profile" && (
                <form className="profile-form" onSubmit={handleSave}>
                  <h3 className="profile-form-title">Personal Information</h3>
                  <p className="profile-form-desc">
                    Update your name and email below
                  </p>

                  {alert && (
                    <div className={`profile-alert ${alert.type}`}>
                      <i
                        className={`bi ${
                          alert.type === "success"
                            ? "bi-check-circle"
                            : "bi-exclamation-circle"
                        }`}
                      ></i>
                      <span>{alert.message}</span>
                    </div>
                  )}

                  <div className="profile-field">
                    <label>Full Name</label>
                    <div className="profile-input">
                      <i className="bi bi-person"></i>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Email Address</label>
                    <div className="profile-input">
                      <i className="bi bi-envelope"></i>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: "flex", gap: "0.6rem" }}>
                      <button
                        type="submit"
                        className="profile-submit-btn"
                        disabled={isLoading}
                        style={{ flex: 1 }}
                      >
                        {isLoading ? (
                          <>
                            <span className="profile-spinner"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="profile-submit-btn"
                        style={{ background: "#6B7280", flex: 0.5 }}
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user?.name || "",
                            email: user?.email || "",
                          });
                          setAlert(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="profile-submit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="bi bi-pencil"></i>
                      Edit Profile
                    </button>
                  )}
                </form>
              )}

              {/* ===== PASSWORD TAB ===== */}
              {activeTab === "password" && (
                <form className="profile-form" onSubmit={handlePasswordSave}>
                  <h3 className="profile-form-title">Change Password</h3>
                  <p className="profile-form-desc">
                    Keep your account secure with a strong password
                  </p>

                  {alert && (
                    <div className={`profile-alert ${alert.type}`}>
                      <i
                        className={`bi ${
                          alert.type === "success"
                            ? "bi-check-circle"
                            : "bi-exclamation-circle"
                        }`}
                      ></i>
                      <span>{alert.message}</span>
                    </div>
                  )}

                  <div className="profile-field">
                    <label>Current Password</label>
                    <div className="profile-input">
                      <i className="bi bi-lock"></i>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>New Password</label>
                    <div className="profile-input">
                      <i className="bi bi-shield-lock"></i>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="profile-field">
                    <label>Confirm New Password</label>
                    <div className="profile-input">
                      <i className="bi bi-shield-check"></i>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="profile-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="profile-spinner"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check"></i>
                        Update Password
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ===== ACTIONS TAB ===== */}
              {activeTab === "actions" && (
                <div className="profile-form">
                  <h3 className="profile-form-title">Quick Actions</h3>
                  <p className="profile-form-desc">
                    Jump to your orders, cart, or logout
                  </p>

                  <div className="profile-field">
                    <button
                      type="button"
                      className="profile-submit-btn"
                      style={{ background: "#282C3F" }}
                      onClick={() => navigate("/my-orders")}
                    >
                      <i className="bi bi-box-seam"></i>
                      My Orders
                    </button>
                  </div>

                  <div className="profile-field">
                    <button
                      type="button"
                      className="profile-submit-btn"
                      style={{ background: "#282C3F" }}
                      onClick={() => navigate("/cart")}
                    >
                      <i className="bi bi-bag-heart"></i>
                      My Cart
                    </button>
                  </div>

                  <div className="profile-field">
                    <button
                      type="button"
                      className="profile-submit-btn"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Logout
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;