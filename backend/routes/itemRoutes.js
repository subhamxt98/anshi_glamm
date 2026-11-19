const express = require('express')
const router = express.Router()
const Item = require('../models/itemModel')

router.get('/', async (req, res) => {
  try {
    let categoryFilter = {}

    if (req.query.category) {
      const cleanCategory = req.query.category.toLowerCase()
      categoryFilter = { category: cleanCategory }
    }

    const items = await Item.find(categoryFilter)
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router