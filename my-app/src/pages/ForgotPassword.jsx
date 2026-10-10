import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './css/auth-extra.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ForgotPassword = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=reset, 4=done
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // ---------- STEP 1: Email verify + OTP send ----------
  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessage('OTP sent to your email ✅')
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---------- STEP 2: OTP verify ----------
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessage('OTP verified ✅ Set your new password')
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---------- STEP 3: Reset password ----------
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 👇 YAHI FIX HAI — backend `password` expect kar raha hai
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: otp.trim(),
          password: newPassword, // 👈 key `password`, value `newPassword`
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessage('Password reset successful 🎉')
      setStep(4)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ---------- Icons per step ----------
  const icons = {
    1: 'bi-envelope-lock',
    2: 'bi-shield-lock',
    3: 'bi-key',
    4: 'bi-check-circle',
  }
  const titles = {
    1: 'Forgot Password?',
    2: 'Enter OTP',
    3: 'Set New Password',
    4: 'All Done!',
  }
  const descs = {
    1: "Enter your registered email and we'll send an OTP",
    2: `We sent a 6-digit OTP to ${email}`,
    3: 'Choose a strong new password',
    4: 'Redirecting to login...',
  }

  return (
    <div className="extra-auth-page">
      <div className="extra-auth-card">
        {/* Progress dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: step >= n ? '#c9a227' : '#ddd',
                transition: '0.3s',
              }}
            />
          ))}
        </div>

        <div className="extra-auth-icon">
          <i className={`bi ${icons[step]}`}></i>
        </div>
        <h1>{titles[step]}</h1>
        <p className="extra-auth-desc">{descs[step]}</p>

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

        {/* ---------- STEP 1: EMAIL ---------- */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
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
                  <span className="extra-auth-spinner"></span> Checking...
                </>
              ) : (
                <>
                  Send OTP <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        )}

        {/* ---------- STEP 2: OTP ---------- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="extra-auth-field">
              <label>OTP Code</label>
              <div className="extra-auth-input">
                <i className="bi bi-shield-lock"></i>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="● ● ● ● ● ●"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  style={{
                    letterSpacing: '8px',
                    fontSize: '20px',
                    textAlign: 'center',
                  }}
                  required
                />
              </div>
            </div>

            <button className="extra-auth-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="extra-auth-spinner"></span> Verifying...
                </>
              ) : (
                <>
                  Verify OTP <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                marginTop: 10,
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#c9a227',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Didn't get OTP? Resend
            </button>
          </form>
        )}

        {/* ---------- STEP 3: NEW PASSWORD ---------- */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="extra-auth-field">
              <label>New Password</label>
              <div className="extra-auth-input">
                <i className="bi bi-lock"></i>
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="extra-auth-field">
              <label>Confirm Password</label>
              <div className="extra-auth-input">
                <i className="bi bi-lock-fill"></i>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
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
        )}

        {/* ---------- STEP 4: DONE ---------- */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, color: '#28a745', margin: '10px 0' }}>
              ✓
            </div>
            <p style={{ color: '#666' }}>Password changed successfully.</p>
          </div>
        )}

        {step !== 4 && (
          <Link to="/login" className="extra-auth-back">
            <i className="bi bi-arrow-left"></i> Back to Login
          </Link>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword