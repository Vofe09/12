import { v2 as cloudinary } from 'cloudinary';
import metadata from '../../../../data/metadata.js';

export async function onRequestGet({ env, params }) {
  const code = params.code;

  if (!code) {
    return new Response(JSON.stringify({ success: false, message: "Код не указан" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  try {
    const result = await cloudinary.search
      .expression(`folder:${code}`)
      .sort_by('public_id', 'asc')
      .max_results(500)
      .execute();

    const urls = result.resources.map((file) =>
      cloudinary.url(file.public_id, {
        type: "upload",
        secure: true,
      })
    );

    const meta = metadata[code];

    return new Response(
      JSON.stringify({
        success: true,
        urls,
        title: meta?.title || "",
        date: meta?.date || "",
        cover: meta?.cover
          ? cloudinary.url(meta.cover, { type: "upload", secure: true })
          : "",
      }),
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("Ошибка Cloudinary:", error);

    return new Response(JSON.stringify({ success: false, message: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}