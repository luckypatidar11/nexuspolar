export default async function handler(req, res) {
  const backendUrl = process.env.RENDER_API_URL?.replace(/\/+$/, '');
  if (!backendUrl) {
    return res.status(500).json({ error: 'RENDER_API_URL is not configured' });
  }

  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || '';
  const requestUrl = new URL(req.url, 'http://localhost');
  const targetUrl = new URL(`/api/${path}${requestUrl.search}`, `${backendUrl}/`);
  const headers = {};

  for (const name of ['accept', 'authorization', 'content-type']) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }

  let body;
  if (!['GET', 'HEAD'].includes(req.method)) {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      body = req.body;
    } else if (req.body !== undefined) {
      body = JSON.stringify(req.body);
    }
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });
    const responseBody = await upstream.text();
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('content-type', contentType);
    return res.status(upstream.status).send(responseBody);
  } catch (error) {
    console.error('Render API proxy failed:', error);
    return res.status(502).json({ error: 'Backend service is unavailable' });
  }
}