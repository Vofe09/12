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
          expression: `folder="${code}"`,
          sort_by: [{ public_id: "asc" }],
          max_results: 100
        })
      }
    );

    // ❗ ВАЖНО
    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    if (!res.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: text
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: "Cloudinary вернул не JSON"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const urls = (result.resources || []).map(r => r.secure_url);

    return new Response(JSON.stringify({
      success: true,
      urls
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("ERROR:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}