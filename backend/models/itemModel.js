const mongoose = require('mongoose')

const itemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    category: { type: String, required: true }, // E.g. "Lips", "Face"
    image: { type: String, required: true }, // Cloudinary URL
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    countInStock: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Item', itemSchema)