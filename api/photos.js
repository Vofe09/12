import { v2 as cloudinary } from 'cloudinary';
import metadata from '../data/metadata.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
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
        secure: true
      })
    );

    const meta = metadata[key];

    res.json({
      success: true,
      urls,
      title: meta?.title || "",
      date: meta?.date || "",
      cover: meta?.cover
        ? cloudinary.url(meta.cover, { type: "upload", secure: true })
        : ""
    });
  } catch (error) {
    console.error("Ошибка Cloudinary:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
}
