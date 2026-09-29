import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './css/auth-extra.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setMessage(data.message)
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="extra-auth-page">
      <div className="extra-auth-card">
        <div className="extra-auth-icon">
          <i className="bi bi-envelope-lock"></i>
        </div>
        <h1>Forgot Password?</h1>
        <p className="extra-auth-desc">
          Enter your email and we'll send you a reset link
        </p>

        {message && (
          <div className="extra-auth-alert success">
            <i className="bi bi-check-circle-fill"></i>
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="extra-auth-alert error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="extra-auth-field">
            <label>Email Address</label>
            <div className="extra-auth-input">
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="extra-auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="extra-auth-spinner"></span> Sending...
              </>
            ) : (
              <>
                Send Reset Link <i className="bi bi-arrow-right"></i>
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

export default ForgotPassword