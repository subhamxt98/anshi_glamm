const express = require('express')
const router = express.Router()
const Item = require('../models/itemModel')
const User = require('../models/User')
const Order = require('../models/orderModel')
const { protect } = require('../middleware/authMiddleware')
const { authorizeAdmin } = require('../middleware/authorize')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.get('/items', protect, authorizeAdmin, async (req, res) => {
  try {
    const items = await Item.find({})
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/items', protect, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' })
    }

    const { name, description, price, oldPrice, category, countInStock, rating } = req.body

    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = `data:${req.file.mimetype};base64,${b64}`
    const result = await cloudinary.uploader.upload(dataURI, { folder: 'anshie-glam/products' })

    const item = new Item({ 
      name, 
      description, 
      price: Number(price), 
      oldPrice: (oldPrice && oldPrice !== '') ? Number(oldPrice) : undefined, 
      category: category ? category.trim().toLowerCase() : 'uncategorized', 
      image: result.secure_url, 
      countInStock: Number(countInStock) || 0,
      rating: (rating && rating !== '') ? Number(rating) : 0
    })
    
    await item.save()
    res.status(201).json(item)
  } catch (err) {
    console.error("POST ITEM ERROR:", err.message) 
    res.status(500).json({ message: err.message })
  }
})

router.put('/items/:id', protect, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const { name, description, price, oldPrice, category, countInStock, rating } = req.body

    if (name) item.name = name
    if (description) item.description = description
    if (price && price !== '') item.price = Number(price)
    if (oldPrice !== undefined) item.oldPrice = oldPrice !== '' ? Number(oldPrice) : undefined
    if (category) item.category = category.trim().toLowerCase()
    if (countInStock && countInStock !== '') item.countInStock = Number(countInStock)
    if (rating && rating !== '') item.rating = Number(rating)

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64')
      const dataURI = `data:${req.file.mimetype};base64,${b64}`
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'anshie-glam/products' })
      item.image = result.secure_url
    }

    const updatedItem = await item.save()
    res.json(updatedItem)
  } catch (err) {
    console.error("PUT ITEM ERROR:", err.message)
    res.status(500).json({ message: err.message })
  }
})

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

router.get('/orders', protect, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

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