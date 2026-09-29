const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const router = express.Router()
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const { protect } = require('../middleware/authMiddleware')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({ name, email, password })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ===== GET PROFILE =====
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error('Get profile error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ===== UPDATE PROFILE =====
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { name, email } = req.body

    if (email && email !== user.email) {
      const exists = await User.findOne({ email })
      if (exists) {
        return res.status(400).json({ message: 'Email already in use' })
      }
      user.email = email
    }

    if (name) user.name = name

    const updated = await user.save()

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      token: generateToken(updated._id),
    })
  } catch (err) {
    console.error('Update profile error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ===== CHANGE PASSWORD =====
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields required' })
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('Change password error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
// ===== FORGOT PASSWORD — Email bhejega =====
// ============================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

    // ===== Agar user exist karta hai — real reset link =====
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')

      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
      await user.save({ validateBeforeSave: false })

      const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`

      const html = `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#FFFFFF;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#FF3F6C;font-size:24px;letter-spacing:2px;margin:0;">ANSHIÉ's GLAM</h1>
            <p style="color:#7E808C;font-size:12px;margin:4px 0 0;">Premium Cosmetics</p>
          </div>

          <h2 style="color:#282C3F;font-size:20px;">Reset your password</h2>
          <p style="color:#535766;font-size:14px;line-height:1.6;">
            Hi ${user.name},<br/><br/>
            We received a request to reset your password. Click the button below. This link expires in <strong>15 minutes</strong>.
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF3F6C,#E6355F);color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
              Reset Password
            </a>
          </div>

          <p style="color:#7E808C;font-size:12px;line-height:1.6;">
            Or copy this link:<br/>
            <a href="${resetUrl}" style="color:#FF3F6C;word-break:break-all;">${resetUrl}</a>
          </p>

          <hr style="border:none;border-top:1px solid #EBEBEE;margin:24px 0;"/>

          <p style="color:#7E808C;font-size:11px;text-align:center;">
            Agar aapne request nahi ki, to ignore karein.<br/>
            © ${new Date().getFullYear()} ANSHIÉ's GLAM
          </p>
        </div>
      `

      await sendEmail({
        to: user.email,
        subject: "Password Reset — ANSHIÉ's GLAM",
        html,
      })

      console.log(`✅ Reset email sent to: ${user.email}`)

      return res.json({
        message: 'Reset link sent! Check your email inbox (and spam folder).',
      })
    }

    // ===== Agar user exist NAHI karta — test email bhejo =====
    // ⚠️ DEV MODE: Production me ye block hata do
    console.log(`⚠️ User not found: ${email} — sending test email`)

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#FFFFFF;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#FF3F6C;font-size:24px;letter-spacing:2px;margin:0;">ANSHIÉ's GLAM</h1>
          <p style="color:#7E808C;font-size:12px;margin:4px 0 0;">Premium Cosmetics</p>
        </div>

        <h2 style="color:#282C3F;font-size:20px;">Password Reset (TEST)</h2>
        <p style="color:#535766;font-size:14px;line-height:1.6;">
          Hi,<br/><br/>
          Aapne password reset request kiya tha <strong>${email}</strong> ke liye,
          lekin ye email hamare database me registered nahi hai.
        </p>

        <p style="color:#535766;font-size:14px;line-height:1.6;">
          <strong>Test successful!</strong> Email system kaam kar raha hai. ✅
        </p>

        <p style="color:#535766;font-size:14px;line-height:1.6;">
          Real reset link ke liye, pehle is email se account banao:
        </p>

        <div style="text-align:center;margin:24px 0;">
          <a href="${FRONTEND_URL}/login"
             style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF3F6C,#E6355F);color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
            Sign Up
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #EBEBEE;margin:24px 0;"/>
        <p style="color:#7E808C;font-size:11px;text-align:center;">
          © ${new Date().getFullYear()} ANSHIÉ's GLAM
        </p>
      </div>
    `

    await sendEmail({
      to: email,
      subject: "Test — ANSHIÉ's GLAM Email Working ✅",
      html,
    })

    console.log(`✅ Test email sent to: ${email}`)

    res.json({
      message:
        'Email sent! Note: Ye email registered nahi hai — pehle Sign Up karo, phir Forgot Password.',
    })
  } catch (err) {
    console.error('Forgot password error:', err.message)
    console.error('Full error:', err)

    res.status(500).json({
      message: err.message || 'Email could not be sent',
    })
  }
})

// ============================================================
// ===== RESET PASSWORD — Naya password set =====
// ============================================================
router.put('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' })
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password')

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.json({
      message: 'Password reset successfully. Please login.',
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Reset password error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router