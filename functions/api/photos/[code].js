import metadata from '../../../data/metadata.js';

function CreateJsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export async function onRequestGet({ params, env }) {
  const code = (params?.code || '').trim();

  if (!code) {
    return CreateJsonResponse(
      { success: false, message: 'Код не указан', urls: [] },
      400
    );
  }

  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return CreateJsonResponse(
      { success: false, message: 'Cloudinary env vars are not configured', urls: [] },
      500
    );
  }

  const authHeader = `Basic ${btoa(`${apiKey}:${apiSecret}`)}`;

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 10000);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expression: `folder="${code}"`,
          sort_by: [{ public_id: 'asc' }],
          max_results: 100,
        }),
        signal: abortController.signal,
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return CreateJsonResponse(
        {
          success: false,
          message: 'Cloudinary search failed',
          details: responseText,
          urls: [],
        },
        response.status
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return CreateJsonResponse(
        {
          success: false,
          message: 'Cloudinary returned non-JSON response',
          urls: [],
        },
        500
      );
    }

    const resources = Array.isArray(result.resources) ? result.resources : [];
    const urls = resources
      .map((resource) => resource.secure_url)
      .filter(Boolean);

    if (urls.length === 0) {
      return CreateJsonResponse(
        {
          success: false,
          message: 'Фотографии не найдены',
          urls: [],
          title: '',
          date: '',
          cover: '',
        },
        404
      );
    }

    const meta = metadata[code] || {};

    return CreateJsonResponse({
      success: true,
      urls,
      title: meta.title || '',
      date: meta.date || '',
      cover: meta.cover
        ? `https://res.cloudinary.com/${cloudName}/image/upload/${encodeURI(meta.cover)}`
        : '',
    });
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'Cloudinary request timed out'
        : (error?.message || 'Unknown server error');

    return CreateJsonResponse(
      {
        success: false,
        message,
        urls: [],
      },
      500
    );
  } finally {
    clearTimeout(timeoutId);
  }
}