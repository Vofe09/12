// api/photos.js
import { v2 as cloudinary } from 'cloudinary';
import photos from '../data/photos.js';

// Конфигурация Cloudinary через переменные окружения
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Vercel serverless API route
export default function handler(req, res) {
  const { key } = req.query;

  const ids = photos[key];

  if (!ids) {
    return res.status(404).json({ success: false, message: "Код не найден" });
  }

  // Генерация временных защищённых URL (на 5 минут)
  const signedUrls = ids.map(publicId =>
    cloudinary.url(publicId, {
      type: "private",
      resource_type: "image",
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 5
    })
  );

  res.json({ success: true, urls: signedUrls });
}
