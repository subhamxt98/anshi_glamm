// backend/models/User.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: false, // 👈 Google users ke liye optional
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // ===== GOOGLE OAUTH =====
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ===== FORGOT PASSWORD — OTP =====
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpire: {
      type: Date,
      default: null,
    },

    // purane fields (agar kahin aur use ho rahe ho to rehne do)
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
)

// Password hash — sirf tab jab password ho
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return // 👈 Google user safety
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Password match — Google users ke paas password nahi hota
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false // 👈 Google user
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)