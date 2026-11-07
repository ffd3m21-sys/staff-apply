export function sb(path, opts = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    ...(opts.headers || {}),
  };
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, { ...opts, headers, cache: 'no-store' });
}
