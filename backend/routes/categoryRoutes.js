const express = require('express')
const router = express.Router()
const Category = require('../models/categoryModel')

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({})
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// @desc    Create a category (Admin only - future use)
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body)
    const createdCategory = await category.save()
    res.status(201).json(createdCategory)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router