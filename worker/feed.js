// Public, fixed-source feed. This is not a general URL proxy.
export const FEED_URL = 'https://nupoorneha.substack.com/feed';
const MAX_BYTES = 2 * 1024 * 1024;

export async function handleRequest(request, env, ctx, fetchFeed = fetch, cache = caches.default) {
  const url = new URL(request.url);
  if (url.pathname !== '/api/substack.xml') return env.ASSETS.fetch(request);
  if (!['GET', 'HEAD'].includes(request.method)) {
    return new Response('Method not allowed', {status: 405, headers: {Allow: 'GET, HEAD'}});
  }
  // Ignore query strings so callers cannot choose an upstream or fragment the cache.
  const key = new Request(url.origin + '/api/substack.xml');
  const cached = await cache.match(key);
  if (cached) return request.method === 'HEAD' ? new Response(null, cached) : cached;
  try {
    const upstream = await fetchFeed(FEED_URL, {
      signal: AbortSignal.timeout(8000), redirect: 'manual',
      headers: {'User-Agent': 'n3n-site/1.0', Accept: 'application/rss+xml, application/xml, text/xml'},
    });
    if (!upstream.ok || Number(upstream.headers.get('Content-Length')) > MAX_BYTES) throw new Error('Feed unavailable');
    // Bound memory even if the upstream omits Content-Length.
    const reader = upstream.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {await reader.cancel(); throw new Error('Feed too large');}
      chunks.push(value);
    }
    const xml = await new Blob(chunks).text();
    if (!/<rss[\s>]/i.test(xml) || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Invalid RSS');
    const response = new Response(xml, {headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    }});
    ctx.waitUntil(cache.put(key, response.clone()));
    return request.method === 'HEAD' ? new Response(null, response) : response;
  } catch (error) {
    console.warn('Public Substack feed unavailable:', error.message);
    return new Response('Substack feed temporarily unavailable', {
      status: 502, headers: {'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8'},
    });
  }
}
