require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}))
app.use(express.json())

// DB connect
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('❌ DB connect failed:', err.message)
    res.status(500).json({ message: 'DB connection failed' })
  }
})

// Health Check
app.get('/', (req, res) => {
  res.json({ success: true, message: '✅ API running' })
})

// ==========================================
// ROUTES
// ==========================================

// 1. Purane Routes
app.use('/api/auth', require('./routes/auth')) 
app.use('/api/payment', require('./routes/payment'))
app.use('/api/upload', require('./routes/upload'))

// 2. Naye Routes
app.use('/api/items', require('./routes/itemRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/api/cart', require('./routes/cartRouter'))
app.use('/api/categories', require('./routes/categoryRoutes'))
app.use('/api/customers', require('./routes/customerRoutes'))

// 👇 contact wali line hata di gayi hai

// ==========================================
// 404 Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error('❌', err.message)
  res.status(err.statusCode || 500).json({ message: err.message || 'Server Error' })
})

// ==========================================
// Server Listen
// ==========================================
if (require.main === module) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

module.exports = app