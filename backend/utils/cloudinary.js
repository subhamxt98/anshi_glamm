// src/utils/cloudinary.js
const CLOUD_NAME = 'YOUR_CLOUD_NAME'; // 👈 apna cloud name daalo
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// Transformations ke saath URL banata hai
export const cld = (path, { w = 600, h = 600 } = {}) =>
  `${BASE}/w_${w},h_${h},c_fill,q_auto,f_auto/${path}`;