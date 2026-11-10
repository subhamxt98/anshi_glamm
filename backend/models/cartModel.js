const mongoose = require('mongoose')

const cartItemSchema = mongoose.Schema({
  productId: {
    type: String, // Frontend se 'id' as a string aa raha hai
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  }
})

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Kis user ka cart hai
    },
    items: [cartItemSchema], // Saare products is array mein rahenge
  },
  { timestamps: true }
)

module.exports = mongoose.model('Cart', cartSchema)