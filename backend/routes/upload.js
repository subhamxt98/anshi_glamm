// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');

// ============================================================
// SAARI IMAGES KI LIST (Unsplash links + Cloudinary public_id)
// ============================================================
const IMAGES_TO_UPLOAD = [
  // ===== Categories =====
  { publicId: 'anshie-glam/categories/lips',     url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/categories/eyes',     url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/categories/face',     url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/categories/skincare', url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=600&fit=crop&q=85' },

  // ===== Products (Lips) =====
  { publicId: 'anshie-glam/products/velvet-matte-lipstick', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/lip-gloss-set',         url: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/liquid-lip-color',      url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/lip-liner-pencil',      url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/lip-balm-tinted',       url: 'https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?w=600&h=600&fit=crop&q=85' },

  // ===== Products (Eyes) - FINAL FIX =====
  { publicId: 'anshie-glam/products/luxury-eyeshadow-palette', url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=85' },
  // Yahan link change kiya hai (photo-1596462502278 use kiya hai jo 100% chal raha hai)
  { publicId: 'anshie-glam/products/volumizing-mascara',       url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/liquid-eyeliner',          url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/kohl-pencil',              url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/brow-definer',             url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/glitter-eyeshadow',        url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/eye-primer',               url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },

  // ===== Products (Face) =====
  { publicId: 'anshie-glam/products/silk-foundation', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/glow-highlighter', url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/blush-palette',    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/setting-powder',   url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/bb-cream',         url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/concealer-stick',  url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/bronzer-powder',   url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/face-mist',        url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85' },

  // ===== Products (Skincare) =====
  { publicId: 'anshie-glam/products/rose-glow-serum',          url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/hydrating-face-cream',     url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/night-repair-cream',       url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/vitamin-c-serum',          url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/hyaluronic-moisturizer',   url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/face-wash-gel',            url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/sunscreen-spf50',          url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/exfoliating-scrub',        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85' },

  // ===== Products (Hair) =====
  { publicId: 'anshie-glam/products/nourishing-hair-oil',      url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/shampoo-sulphate-free',    url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/hair-mask-deep-repair',    url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/hair-serum-frizz-control', url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/scalp-treatment',          url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/leave-in-conditioner',     url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85' },

  // ===== Products (Body & Nails) =====
  { publicId: 'anshie-glam/products/body-lotion-shea',  url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/body-scrub-coffee', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/hand-cream',        url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/foot-cream',        url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/nail-polish-set',   url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/nail-art-kit',      url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/top-coat-shine',    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/products/nail-remover',      url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop&q=85' },

  // ===== Testimonials =====
  { publicId: 'anshie-glam/testimonials/priya',  url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=85' },
  { publicId: 'anshie-glam/testimonials/ananya', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&q=85' },
  { publicId: 'anshie-glam/testimonials/kavya',  url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&q=85' },

  // ===== Instagram =====
  { publicId: 'anshie-glam/instagram/1', url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&h=400&fit=crop&q=85' },
  { publicId: 'anshie-glam/instagram/2', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop&q=85' },
  { publicId: 'anshie-glam/instagram/3', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&q=85' },
  { publicId: 'anshie-glam/instagram/4', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&q=85' },
  { publicId: 'anshie-glam/instagram/5', url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop&q=85' },
  { publicId: 'anshie-glam/instagram/6', url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&q=85' },

  // ===== Brand Story / About =====
  { publicId: 'anshie-glam/brand/story-main',      url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=700&fit=crop&q=85' },
  { publicId: 'anshie-glam/brand/story-secondary', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop&q=85' },
  { publicId: 'anshie-glam/about/mission',         url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=700&h=600&fit=crop&q=85' },

  // ===== Leadership =====
  { publicId: 'anshie-glam/leadership/aarav',  url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop&q=85' },
  { publicId: 'anshie-glam/leadership/ananya', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop&q=85' },
  { publicId: 'anshie-glam/leadership/rohan',  url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=700&fit=crop&q=85' },
  { publicId: 'anshie-glam/leadership/sneha',  url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=700&fit=crop&q=85' },

  // ===== Team =====
  { publicId: 'anshie-glam/team/riya',  url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/team/karan', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&q=85' },
  { publicId: 'anshie-glam/team/priya', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=600&fit=crop&q=85' },
];

// ============================================================
// ROUTES
// ============================================================

// POST /api/upload/all — saari images ek saath upload
router.post('/all', async (req, res) => {
  const results = { success: [], failed: [] };

  for (const item of IMAGES_TO_UPLOAD) {
    try {
      const result = await cloudinary.uploader.upload(item.url, {
        public_id: item.publicId,
        overwrite: true,
        invalidate: true, // ✅ Added for cache busting
        resource_type: 'image',
      });
      results.success.push({ publicId: item.publicId, url: result.secure_url });
      console.log(`✅ ${item.publicId}`);
    } catch (error) {
      results.failed.push({ publicId: item.publicId, error: error.message });
      console.error(`❌ ${item.publicId}: ${error.message}`);
    }
  }

  res.json({
    total: IMAGES_TO_UPLOAD.length,
    successCount: results.success.length,
    failedCount: results.failed.length,
    results,
  });
});

// POST /api/upload/one — ek single image upload (body: { imageUrl, publicId })
router.post('/one', async (req, res) => {
  const { imageUrl, publicId } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId || undefined,
      folder: publicId ? undefined : 'anshie-glam/misc',
      overwrite: true,
      invalidate: true, // ✅ Added for cache busting
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;