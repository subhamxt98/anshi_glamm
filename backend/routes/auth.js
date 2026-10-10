// backend/routes/auth.js
const express = require('express')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')   // 👈 ADD
const router = express.Router()
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const { protect } = require('../middleware/authMiddleware')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)   // 👈 ADD

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// ===== Helper: 6-digit OTP =====
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// ===== Helper: OTP email HTML =====
const otpEmailTemplate = (name, otp) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#FFFFFF;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#FF3F6C;font-size:24px;letter-spacing:2px;margin:0;">ANSHIÉ's GLAM</h1>
      <p style="color:#7E808C;font-size:12px;margin:4px 0 0;">Premium Cosmetics</p>
    </div>

    <h2 style="color:#282C3F;font-size:20px;">Password Reset OTP</h2>
    <p style="color:#535766;font-size:14px;line-height:1.6;">
      Hi ${name || 'there'},<br/><br/>
      Aapne password reset request kiya hai. Neeche diya gaya OTP use karein.
      Ye OTP <strong>10 minutes</strong> ke liye valid hai.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;padding:18px 40px;background:#FFF5F7;border:2px dashed #FF3F6C;border-radius:12px;">
        <span style="font-size:36px;letter-spacing:12px;font-weight:800;color:#FF3F6C;">
          ${otp}
        </span>
      </div>
    </div>

    <p style="color:#7E808C;font-size:12px;line-height:1.6;text-align:center;">
      Kisi ke saath share na karein. Agar aapne request nahi ki, ignore karein.
    </p>

    <hr style="border:none;border-top:1px solid #EBEBEE;margin:24px 0;"/>
    <p style="color:#7E808C;font-size:11px;text-align:center;">
      © ${new Date().getFullYear()} ANSHIÉ's GLAM
    </p>
  </div>
`

// ============================================================
// REGISTER
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' })
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
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

// ============================================================
// LOGIN
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    )

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
// GOOGLE LOGIN / SIGNUP   👈 NEW
// ============================================================
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ message: 'Google credential required' })
    }

    // 1. Google ID token verify karo
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    const { email, name, picture, sub: googleId } = payload

    if (!email) {
      return res.status(400).json({ message: 'Google email not found' })
    }

    const cleanEmail = email.toLowerCase().trim()

    // 2. DB me user hai?
    let user = await User.findOne({ email: cleanEmail })

    if (user) {
      // Existing user — Google info update karo
      let changed = false
      if (!user.googleId) {
        user.googleId = googleId
        changed = true
      }
      if (!user.avatar) {
        user.avatar = picture
        changed = true
      }
      if (changed) await user.save({ validateBeforeSave: false })
    } else {
      // Naya user banao
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId,
        avatar: picture,
      })
    }

    // 3. JWT do
    const token = generateToken(user._id)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token,
    })
  } catch (err) {
    console.error('Google login error:', err.message)
    res.status(401).json({ message: 'Google login failed. Try again.' })
  }
})

// ============================================================
// GET PROFILE
// ============================================================
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error('Get profile error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
// UPDATE PROFILE
// ============================================================
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { name, email } = req.body

    if (email && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim() })
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
      avatar: updated.avatar,
      token: generateToken(updated._id),
    })
  } catch (err) {
    console.error('Update profile error:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ============================================================
// CHANGE PASSWORD
// ============================================================
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

    if (!user.password) {
      return res
        .status(400)
        .json({ message: 'Google account — password set nahi hai' })
    }

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
// STEP 1 — FORGOT PASSWORD → 6-digit OTP email
// ============================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: cleanEmail })

    if (!user) {
      return res.status(404).json({
        message: 'This email is not registered with us. Please sign up first.',
      })
    }

    const otp = generateOtp()
    user.resetPasswordOtp = otp
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000

    user.markModified('resetPasswordOtp')
    user.markModified('resetPasswordOtpExpire')

    await user.save({ validateBeforeSave: false })

    console.log('━━━ FORGOT-PASSWORD DEBUG ━━━')
    console.log('📧 Email :', cleanEmail, '| 🧾 OTP :', otp)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset OTP — ANSHIÉ's GLAM",
        html: otpEmailTemplate(user.name, otp),
      })
      console.log(`✅ OTP email sent to: ${user.email}`)
    } catch (mailErr) {
      console.error('❌ Mail error:', mailErr.message)
      user.resetPasswordOtp = undefined
      user.resetPasswordOtpExpire = undefined
      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        message: 'Email could not be sent. Please try again.',
      })
    }

    res.json({
      message: 'OTP sent to your registered email. Check inbox & spam folder.',
    })
  } catch (err) {
    console.error('Forgot password error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
})

// ============================================================
// STEP 2 — VERIFY OTP
// ============================================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP required' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = String(otp).trim()

    const user = await User.findOne({ email: cleanEmail }).select(
      '+resetPasswordOtp +resetPasswordOtpExpire'
    )
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== cleanOtp ||
      user.resetPasswordOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    res.json({ message: 'OTP verified successfully' })
  } catch (err) {
    console.error('Verify OTP error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
})

// ============================================================
// STEP 3 — RESET PASSWORD
// ============================================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'All fields required' })
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = String(otp).trim()

    const user = await User.findOne({ email: cleanEmail }).select(
      '+resetPasswordOtp +resetPasswordOtpExpire +password'
    )
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== cleanOtp ||
      user.resetPasswordOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    user.password = password
    user.resetPasswordOtp = undefined
    user.resetPasswordOtpExpire = undefined
    await user.save()

    res.json({
      message: 'Password reset successfully. Please login.',
      _id: user._id,
      name: user.name,
      email: user.email,
    })
  } catch (err) {
    console.error('Reset password error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
})

module.exports = router