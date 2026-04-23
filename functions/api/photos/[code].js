export async function onRequestGet({ params, env }) {
  const code = params.code;

  if (!code) {
    return new Response(JSON.stringify({ success: false }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/search`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expression: code,
          sort_by: [{ public_id: "asc" }],
          max_results: 100
        })
      }
    );

    const result = await res.json();

    const urls = result.resources.map(r => r.secure_url);

    return new Response(JSON.stringify({
      success: true,
      urls
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error(err);

    return new Response(JSON.stringify({ success: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}