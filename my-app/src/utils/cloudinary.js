// src/utils/cloudinary.js
const CLOUD_NAME = 'dhx1uospw'; // 👈 Yahan apna asli cloud name daal diya hai
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export const cld = (path, { w = 600, h = 600 } = {}) =>
  `${BASE}/w_${w},h_${h},c_fill,q_auto,f_auto/${path}`;