const mongoose = require('mongoose')

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String, // Cloudinary image URL
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Category', categorySchema)