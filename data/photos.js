// api/photos.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ success: false, message: "Ключ не указан" });
  }

  try {
    const result = await cloudinary.search
      .expression(`folder:${key}`)
      .sort_by('public_id', 'asc')
      .max_results(30)
      .execute();

    const urls = result.resources.map(file =>
      cloudinary.url(file.public_id, {
        type: "upload",
        secure: true,
        sign_url: false // если фото публичные
      })
    );

    res.json({ success: true, urls });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Ошибка на сервере" });
  }
}