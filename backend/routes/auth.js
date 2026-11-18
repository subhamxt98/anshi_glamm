const express = require('express')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const router = express.Router()
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const { protect } = require('../middleware/authMiddleware')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

const otpEmailTemplate = (name, otp) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#FFFFFF;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#FF3F6C;font-size:24px;letter-spacing:2px;margin:0;">ANSHIÉ's GLAM</h1>
      <p style="color:#7E808C;font-size:12px;margin:4px 0 0;">Premium Cosmetics</p>
    </div>

    <h2 style="color:#282C3F;font-size:20px;">Password Reset OTP</h2>
    <p style="color:#535766;font-size:14px;line-height:1.6;">
      Hi ${name || 'there'},<br/><br/>
      A password reset request was made for your account. Please use the OTP below.
      This OTP is valid for <strong>10 minutes</strong>.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;padding:18px 40px;background:#FFF5F7;border:2px dashed #FF3F6C;border-radius:12px;">
        <span style="font-size:36px;letter-spacing:12px;font-weight:800;color:#FF3F6C;">
          ${otp}
        </span>
      </div>
    </div>

    <p style="color:#7E808C;font-size:12px;line-height:1.6;text-align:center;">
      Do not share this OTP with anyone. If you did not request this, please ignore this email.
    </p>

    <hr style="border:none;border-top:1px solid #EBEBEE;margin:24px 0;"/>
    <p style="color:#7E808C;font-size:11px;text-align:center;">
      © ${new Date().getFullYear()} ANSHIÉ's GLAM
    </p>
  </div>
`

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return res.status(400).json({ 
        message: 'Name should contain only alphabets and spaces.' 
      })
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() })
    if (exists) {
      return res.status(400).json({ message: 'User already exists.' })
    }

    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password 
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // ✅ Added
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    )

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      isAdmin: user.isAdmin, // ✅ Added
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required.' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    const { email, name, picture, sub: googleId } = payload

    if (!email) {
      return res.status(400).json({ message: 'Google email not found.' })
    }

    const cleanEmail = email.toLowerCase().trim()

    let user = await User.findOne({ email: cleanEmail })

    if (user) {
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
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId,
        avatar: picture,
      })
    }

    const token = generateToken(user._id)

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isAdmin: user.isAdmin, // ✅ Added
      token,
    })
  } catch (err) {
    console.error('Google login error:', err.message)
    res.status(401).json({ message: 'Google login failed. Please try again.' })
  }
})

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found.' })

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
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const { name, email } = req.body

    if (name && !/^[a-zA-Z\s]+$/.test(name.trim())) {
      return res.status(400).json({ 
        message: 'Name should contain only alphabets and spaces.' 
      })
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim() })
      if (exists) {
        return res.status(400).json({ message: 'Email is already in use.' })
      }
      user.email = email.toLowerCase().trim()
    }

    if (name) user.name = name.trim()

    const updated = await user.save()

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      isAdmin: updated.isAdmin, // ✅ Added
      token: generateToken(updated._id),
    })
  } catch (err) {
    console.error('Update profile error:', err.message)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (!user.password) {
      return res.status(400).json({ message: 'Password not set for Google accounts.' })
    }

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    console.error('Change password error:', err.message)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
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

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset OTP — ANSHIÉ's GLAM",
        html: otpEmailTemplate(user.name, otp),
      })
    } catch (mailErr) {
      console.error('Mail error:', mailErr.message)
      user.resetPasswordOtp = undefined
      user.resetPasswordOtpExpire = undefined
      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        message: 'Email could not be sent. Please try again.',
      })
    }

    res.json({
      message: 'OTP sent to your registered email. Please check your inbox and spam folder.',
    })
  } catch (err) {
    console.error('Forgot password error:', err.message)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = String(otp).trim()

    const user = await User.findOne({ email: cleanEmail }).select(
      '+resetPasswordOtp +resetPasswordOtpExpire'
    )
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== cleanOtp ||
      user.resetPasswordOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' })
    }

    res.json({ message: 'OTP verified successfully.' })
  } catch (err) {
    console.error('Verify OTP error:', err.message)
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanOtp = String(otp).trim()

    const user = await User.findOne({ email: cleanEmail }).select(
      '+resetPasswordOtp +resetPasswordOtpExpire +password'
    )
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== cleanOtp ||
      user.resetPasswordOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' })
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
    res.status(500).json({ message: 'Server error. Please try again later.' })
  }
})

module.exports = router