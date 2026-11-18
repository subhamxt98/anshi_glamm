const express = require('express')
const router = express.Router()
const Item = require('../models/itemModel')
const User = require('../models/User')
const Order = require('../models/orderModel')
const { protect } = require('../middleware/authMiddleware')
const { authorizeAdmin } = require('../middleware/authorize')
const multer = require('multer')
const { cloudinary } = require('../config/cloudinary')

const storage = multer.memoryStorage()
const upload = multer({ storage })

// ===== Get all products =====
router.get('/items', protect, authorizeAdmin, async (req, res) => {
  try {
    const items = await Item.find({})
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ===== Add new product =====
router.post('/items', protect, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' })
    }

    const { name, description, price, category, countInStock } = req.body
    
    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, { folder: 'anshie-glam/products' })

    const item = new Item({ 
      name, 
      description, 
      price, 
      category, 
      image: result.secure_url, 
      countInStock 
    })
    
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ===== Update product (Edit) =====
router.put('/items/:id', protect, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const { name, description, price, category, countInStock } = req.body

    // Update fields (agar nayi value aayi hai toh)
    item.name = name || item.name
    item.description = description || item.description
    item.price = price || item.price
    item.category = category || item.category
    item.countInStock = countInStock || item.countInStock

    // Agar nayi image aayi hai toh Cloudinary par upload karein
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64')
      const dataURI = `data:${req.file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'anshie-glam/products' })
      item.image = result.secure_url
    }

    const updatedItem = await item.save()
    res.json(updatedItem)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ===== Delete product =====
router.delete('/items/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Product not found' })
    }
    await item.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ===== Get all orders =====
router.get('/orders', protect, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ===== Update order status =====
router.put('/orders/:id/status', protect, authorizeAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (req.body.status === 'delivered') {
      order.isDelivered = true
      order.deliveredAt = Date.now()
    }
    
    await order.save()
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router