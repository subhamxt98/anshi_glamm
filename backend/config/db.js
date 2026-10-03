// ============================================
// ISHANI COSMETICS — DATABASE CONNECTION
// Location: backend/config/db.js
// Vercel serverless friendly (cached + no exit)
// ============================================

const mongoose = require('mongoose')

// Global cache — serverless ke cold starts ke beech survive karta hai
let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
  // Already connected → reuse
  if (cached.conn) return cached.conn

  // Connection in-progress → wait for same promise
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log(`✅ MongoDB Connected: ${m.connection.host}`)
        console.log(`📦 Database: ${m.connection.name}`)
        return m
      })
      .catch((err) => {
        // Promise fail hui → cache clear karo taaki next request retry kar sake
        cached.promise = null
        console.error(`❌ MongoDB Connection Error: ${err.message}`)
        throw err   // ⚠️ process.exit NAHI — throw karo, server.js middleware handle karega
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}

// Connection events (sirf ek baar register honge)
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to DB')
})

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose error:', err.message)
})

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected')
})

module.exports = connectDB