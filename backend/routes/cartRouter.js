const express = require('express')
const router = express.Router()
const Cart = require('../models/cartModel')
const { protect } = require('../middleware/authMiddleware')

// 1. User ka Cart Get karne ke liye (GET)
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
    
    // Agar cart nahi hai, toh naya empty cart banake bhej do
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }
    res.json(cart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 2. Cart mein Item Add ya Update karne ke liye (POST)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, name, image, price, quantity } = req.body
    
    let cart = await Cart.findOne({ user: req.user._id })
    
    // Agar cart nahi hai toh naya banao
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }

    // Check karo ki product pehle se cart mein hai kya?
    const itemIndex = cart.items.findIndex((item) => item.productId === productId)

    if (itemIndex > -1) {
      // Agar hai, toh quantity update kar do
      cart.items[itemIndex].quantity = quantity
    } else {
      // Agar nahi hai, toh naya item push kar do
      cart.items.push({ productId, name, image, price, quantity })
    }

    const updatedCart = await cart.save()
    res.status(200).json(updatedCart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 3. Cart se Item Remove karne ke liye (DELETE)
router.delete('/:productId', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
    
    if (cart) {
      // Us product ko chhod kar baaki items rakh lo
      cart.items = cart.items.filter(
        (item) => item.productId !== req.params.productId
      )
      await cart.save()
      res.json(cart)
    } else {
      res.status(404).json({ message: 'Cart not found' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 4. Pura Cart Clear karne ke liye (DELETE)
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      await cart.save()
      res.json({ message: 'Cart cleared', cart })
    } else {
      res.status(404).json({ message: 'Cart not found' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router