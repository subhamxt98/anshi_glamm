const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect } = require('../middleware/authMiddleware')
// 👇 authorize hata diya hai

// @desc    Get all customers
// @route   GET /api/customers
router.get('/', protect, async (req, res) => {
  try {
    const customers = await User.find({ isAdmin: false }).select('-password')
    res.json(customers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password')
    if (customer) {
      res.json(customer)
    } else {
      res.status(404).json({ message: 'Customer not found' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router