const express = require('express')
const router = express.Router()
const Order = require('../models/orderModel')
const { protect } = require('../middleware/authMiddleware')

// Place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' })
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      totalPrice,
    })

    const createdOrder = await order.save()
    res.status(201).json(createdOrder)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get logged in user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router