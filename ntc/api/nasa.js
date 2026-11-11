// Vercel serverless proxy: whitelists NASA paths, caches in memory and at Vercel's CDN
// so repeat searches never count against NASA's 1,000 requests/hour limit.
const cache = new Map();
export default async function handler(req, res) {
  const { path = '/search', ...rest } = req.query;
  if (!/^\/(search|asset\/[^?#]+)$/.test(path)) return res.status(400).json({ error: 'bad path' });
  const qs = new URLSearchParams(rest).toString(), key = path + '?' + qs;
  let hit = cache.get(key);
  if (!hit || Date.now() - hit.t > 36e5) {
    const r = await fetch('https://images-api.nasa.gov' + encodeURI(path) + (qs ? '?' + qs : ''));
    if (!r.ok) return res.status(r.status).json({ error: 'upstream' });
    hit = { t: Date.now(), d: await r.json() };
    if (cache.size > 500) cache.clear();
    cache.set(key, hit);
  }
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json(hit.d);
}
