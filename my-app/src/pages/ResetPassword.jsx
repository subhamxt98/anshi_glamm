import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './css/auth-extra.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="extra-auth-page">
        <div className="extra-auth-card">
          <div className="extra-auth-icon success">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h1>Password Reset!</h1>
          <p className="extra-auth-desc">
            Redirecting to login...
          </p>
          <Link to="/login" className="extra-auth-btn" style={{ display: 'inline-flex', marginTop: 16 }}>
            Go to Login <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="extra-auth-page">
      <div className="extra-auth-card">
        <div className="extra-auth-icon">
          <i className="bi bi-shield-lock"></i>
        </div>
        <h1>Reset Password</h1>
        <p className="extra-auth-desc">Enter your new password below</p>

        {error && (
          <div className="extra-auth-alert error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="extra-auth-field">
            <label>New Password</label>
            <div className="extra-auth-input">
              <i className="bi bi-lock"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="extra-auth-eye"
                onClick={() => setShowPassword((p) => !p)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="extra-auth-field">
            <label>Confirm Password</label>
            <div className="extra-auth-input">
              <i className="bi bi-shield-check"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="extra-auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="extra-auth-spinner"></span> Resetting...
              </>
            ) : (
              <>
                Reset Password <i className="bi bi-check-lg"></i>
              </>
            )}
          </button>
        </form>

        <Link to="/login" className="extra-auth-back">
          <i className="bi bi-arrow-left"></i> Back to Login
        </Link>
      </div>
    </div>
  )
}

export default ResetPassword