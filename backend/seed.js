require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const Item = require('./models/itemModel')

const products = [
  // ===== LIPS =====
  { name: "Velvet Matte Lipstick", category: "Lips", price: 1299, oldPrice: 1599, rating: 4.8, reviews: 234, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85", badge: "Best Seller", description: "Premium matte lipstick", countInStock: 50 },
  { name: "Lip Gloss Set", category: "Lips", price: 899, oldPrice: 1199, rating: 4.7, reviews: 167, image: "https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?w=600&h=600&fit=crop&q=85", badge: "", description: "Glossy finish lip set", countInStock: 40 },
  { name: "Liquid Lip Color", category: "Lips", price: 1099, oldPrice: 1399, rating: 4.6, reviews: 189, image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85", badge: "New", description: "Long lasting liquid lip color", countInStock: 30 },
  { name: "Lip Liner Pencil", category: "Lips", price: 599, oldPrice: 799, rating: 4.5, reviews: 145, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85", badge: "", description: "Precision lip liner", countInStock: 60 },
  { name: "Lip Balm Tinted", category: "Lips", price: 399, oldPrice: 599, rating: 4.8, reviews: 312, image: "https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?w=600&h=600&fit=crop&q=85", badge: "", description: "Tinted lip balm for hydration", countInStock: 100 },

  // ===== EYES =====
  { name: "Luxury Eyeshadow Palette", category: "Eyes", price: 1899, oldPrice: 2299, rating: 4.7, reviews: 156, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=85", badge: "Trending", description: "12 shade luxury palette", countInStock: 25 },
  { name: "Volumizing Mascara", category: "Eyes", price: 999, oldPrice: 1299, rating: 4.9, reviews: 421, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "Best Seller", description: "Volumizing mascara for bold lashes", countInStock: 80 },
  { name: "Liquid Eyeliner", category: "Eyes", price: 699, oldPrice: 899, rating: 4.6, reviews: 145, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "", description: "Waterproof liquid eyeliner", countInStock: 70 },
  { name: "Kohl Pencil", category: "Eyes", price: 499, oldPrice: 699, rating: 4.7, reviews: 234, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=85", badge: "", description: "Intense kohl pencil", countInStock: 90 },
  { name: "Brow Definer", category: "Eyes", price: 799, oldPrice: 999, rating: 4.5, reviews: 98, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "New", description: "Brow shaping pencil", countInStock: 45 },
  { name: "Glitter Eyeshadow", category: "Eyes", price: 1299, oldPrice: 1599, rating: 4.8, reviews: 178, image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=85", badge: "", description: "Shimmering glitter eyeshadow", countInStock: 35 },
  { name: "Eye Primer", category: "Eyes", price: 899, oldPrice: 1199, rating: 4.6, reviews: 145, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "", description: "Long lasting eye primer", countInStock: 50 },

  // ===== FACE =====
  { name: "Silk Foundation", category: "Face", price: 2199, oldPrice: 2599, rating: 4.6, reviews: 98, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "Best Seller", description: "Silky smooth foundation", countInStock: 20 },
  { name: "Glow Highlighter", category: "Face", price: 1499, oldPrice: 1799, rating: 4.7, reviews: 178, image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85", badge: "", description: "Radiant glow highlighter", countInStock: 55 },
  { name: "Blush Palette", category: "Face", price: 1299, oldPrice: 1599, rating: 4.8, reviews: 203, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "", description: "4 shade blush palette", countInStock: 40 },
  { name: "Setting Powder", category: "Face", price: 1199, oldPrice: 1499, rating: 4.7, reviews: 234, image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85", badge: "New", description: "Translucent setting powder", countInStock: 65 },
  { name: "BB Cream", category: "Face", price: 999, oldPrice: 1299, rating: 4.5, reviews: 145, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "", description: "Lightweight BB cream", countInStock: 75 },
  { name: "Concealer Stick", category: "Face", price: 799, oldPrice: 999, rating: 4.6, reviews: 178, image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85", badge: "", description: "Full coverage concealer", countInStock: 60 },
  { name: "Bronzer Powder", category: "Face", price: 1399, oldPrice: 1699, rating: 4.7, reviews: 156, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85", badge: "Trending", description: "Sun-kissed bronzer", countInStock: 30 },
  { name: "Face Mist", category: "Face", price: 699, oldPrice: 899, rating: 4.8, reviews: 267, image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85", badge: "", description: "Refreshing face mist", countInStock: 85 },

  // ===== SKINCARE =====
  { name: "Rose Glow Serum", category: "Skincare", price: 2499, oldPrice: 2999, rating: 4.9, reviews: 189, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85", badge: "Best Seller", description: "Rose infused glow serum", countInStock: 15 },
  { name: "Hydrating Face Cream", category: "Skincare", price: 1699, oldPrice: 1999, rating: 4.8, reviews: 312, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85", badge: "", description: "Deep hydrating face cream", countInStock: 45 },
  { name: "Night Repair Cream", category: "Skincare", price: 2899, oldPrice: 3499, rating: 4.9, reviews: 412, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85", badge: "Best Seller", description: "Overnight repair cream", countInStock: 10 },
  { name: "Vitamin C Serum", category: "Skincare", price: 1999, oldPrice: 2499, rating: 4.8, reviews: 234, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85", badge: "New", description: "Brightening vitamin C serum", countInStock: 25 },
  { name: "Hyaluronic Moisturizer", category: "Skincare", price: 1499, oldPrice: 1799, rating: 4.7, reviews: 189, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85", badge: "", description: "Hyaluronic acid moisturizer", countInStock: 55 },
  { name: "Face Wash Gel", category: "Skincare", price: 599, oldPrice: 799, rating: 4.6, reviews: 312, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85", badge: "", description: "Gentle foaming face wash", countInStock: 95 },
  { name: "Sunscreen SPF 50", category: "Skincare", price: 899, oldPrice: 1199, rating: 4.8, reviews: 421, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85", badge: "Trending", description: "SPF 50 broad spectrum sunscreen", countInStock: 70 },
  { name: "Exfoliating Scrub", category: "Skincare", price: 799, oldPrice: 999, rating: 4.7, reviews: 178, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85", badge: "", description: "Gentle exfoliating scrub", countInStock: 65 },

  // ===== HAIR =====
  { name: "Nourishing Hair Oil", category: "Hair", price: 899, oldPrice: 1199, rating: 4.8, reviews: 267, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85", badge: "Trending", description: "Deep nourishing hair oil", countInStock: 40 },
  { name: "Shampoo Sulphate Free", category: "Hair", price: 699, oldPrice: 899, rating: 4.7, reviews: 189, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85", badge: "", description: "Sulphate free gentle shampoo", countInStock: 80 },
  { name: "Hair Mask Deep Repair", category: "Hair", price: 1199, oldPrice: 1499, rating: 4.8, reviews: 234, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85", badge: "Best Seller", description: "Deep repair hair mask", countInStock: 35 },
  { name: "Hair Serum Frizz Control", category: "Hair", price: 999, oldPrice: 1299, rating: 4.6, reviews: 145, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85", badge: "", description: "Frizz control hair serum", countInStock: 50 },
  { name: "Scalp Treatment", category: "Hair", price: 1499, oldPrice: 1799, rating: 4.7, reviews: 98, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85", badge: "New", description: "Soothing scalp treatment", countInStock: 20 },
  { name: "Leave-in Conditioner", category: "Hair", price: 799, oldPrice: 999, rating: 4.5, reviews: 167, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85", badge: "", description: "Lightweight leave-in conditioner", countInStock: 60 },

  // ===== BODY =====
  { name: "Body Lotion Shea", category: "Body", price: 699, oldPrice: 899, rating: 4.8, reviews: 312, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85", badge: "", description: "Shea butter body lotion", countInStock: 90 },
  { name: "Body Scrub Coffee", category: "Body", price: 899, oldPrice: 1199, rating: 4.7, reviews: 189, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85", badge: "Trending", description: "Coffee body scrub", countInStock: 55 },
  { name: "Hand Cream", category: "Body", price: 399, oldPrice: 599, rating: 4.6, reviews: 234, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85", badge: "", description: "Nourishing hand cream", countInStock: 100 },
  { name: "Foot Cream", category: "Body", price: 499, oldPrice: 699, rating: 4.5, reviews: 145, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85", badge: "", description: "Repairing foot cream", countInStock: 75 },

  // ===== NAILS =====
  { name: "Nail Polish Set", category: "Nails", price: 799, oldPrice: 999, rating: 4.7, reviews: 178, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85", badge: "New", description: "6 shade nail polish set", countInStock: 45 },
  { name: "Nail Art Kit", category: "Nails", price: 1299, oldPrice: 1599, rating: 4.8, reviews: 156, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85", badge: "", description: "Complete nail art kit", countInStock: 30 },
  { name: "Top Coat Shine", category: "Nails", price: 499, oldPrice: 699, rating: 4.6, reviews: 123, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85", badge: "", description: "Glossy top coat", countInStock: 80 },
  { name: "Nail Remover", category: "Nails", price: 299, oldPrice: 399, rating: 4.5, reviews: 98, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85", badge: "", description: "Gentle nail polish remover", countInStock: 120 },
];

const importData = async () => {
  try {
    await connectDB()
    await Item.deleteMany() // Pehle ke items hatao
    await Item.insertMany(products)
    console.log('✅ 42 Products successfully added with Direct Images!')
    process.exit()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

importData()