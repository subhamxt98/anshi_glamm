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

// 👇 DB connect — har request pe ensure, but cached
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('❌ DB connect failed:', err.message)
    res.status(500).json({ message: 'DB connection failed' })
  }
})

// Health
app.get('/', (req, res) => {
  res.json({ success: true, message: '✅ API running' })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/payment', require('./routes/payment'))

// 404
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` })
})

// Error
app.use((err, req, res, next) => {
  console.error('❌', err.message)
  res.status(err.statusCode || 500).json({ message: err.message || 'Server Error' })
})

// 👇 Local dev ke liye listen, Vercel ke liye export
if (require.main === module) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀 Server on http://localhost:${PORT}`)
  })
}

module.exports = app